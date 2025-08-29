import express from "express";
import { MongoServerError } from "mongodb";
import { createInvestor, getInvestors, getInvestorByEmail, updateInvestorById, deleteInvestorById, getInvestorById } from "../db/Investor";
import { useBlockchainService } from '../services/blockchain.service'
import { handleTransactionError, handleTransactionSuccess } from "../services/trx.service";
import { CREATE_ACCOUNT } from "../utils/Constants";
import { useApiBridge } from "../services/api-bridge.service";
import { createAccount } from "../services/api-smart-account.service";
import bcrypt from 'bcryptjs';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const SALT_ROUNDS = 10;

/**
 * Obtener todos los usuarios
 */
export const getAllInvestors = async (req: express.Request, res: express.Response) => {
  try {
    const users = await getInvestors(); // Obtiene todos los usuarios de la base de datos
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while retrieving users.",
    });
  }
};

/**
 * Crear un nuevo usuario
 */
export const registerInvestor = async (req: express.Request, res: express.Response) => {
  let newInvestor = null;
  let foundInvestorId = null;

  try {
    console.log("📩 Recibido en req.body:", req.body);
    const investor = req.body;

    // Validación de campos requeridos 
    if (!investor || !investor.name || !investor.surname || !investor.email) {
      res.status(400).json({
        error: "Missing required fields",
        message: "All required fields must be provided.",
      });
      return;
    }


    console.log("✅ Validación de datos correcta");
    // Creación del nuevo usuario
    try {
      newInvestor = await createInvestor(investor);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        res.status(400).json({
          error: "Investor already exists",
          message: "Investor already exists.",
        });
        return;
      }
      throw error; // Lanza otros errores para que sean manejados en el catch principal
    }

    if (!newInvestor) return;
    const foundInvestor = await getInvestorByEmail(investor.email);
    foundInvestorId = foundInvestor.get('_id').toString();
    console.log('InvestorId', foundInvestor, foundInvestorId);

    let response = null;
    try {
      // Crear cuenta del inversor en la blockchain
      response = await createAccount(foundInvestorId);

      await handleTransactionSuccess(foundInvestorId, CREATE_ACCOUNT, response.accounts[0]);
      // Llamar al faucet para la nueva cuenta
      await useApiBridge.faucet(response.accounts[0].address, 10);
      console.log("Faucet realizado para la cuenta:", response.accounts[0].address);

    } catch (error) {
      await handleTransactionError(foundInvestorId, CREATE_ACCOUNT, error);

      // Limpiar el inversor en caso de error
      console.log('Error BlockchainAcc', error);
      res.status(500).json({ error: "Error al crear cuenta en blockchain", message: error.message });
      await deleteInvestorById(foundInvestorId);
      return;
      throw error; // Lanza el error para que sea manejado en el catch principal
    }

    // Actualizar el inversor con la información de la cuenta blockchain
    const updatedInvestor = await updateInvestorById(foundInvestorId, { walletAddress: response.accounts[0].address, accounts: response.accounts });

    console.log(updatedInvestor);
    res.status(201).json(updatedInvestor);
  } catch (error) {
    console.error(error);
    if (foundInvestorId) {
      await deleteInvestorById(foundInvestorId);
    }
    res.status(500).json({
      error: "Investor creation failed",
      message: "An unexpected error occurred while creating the investor.",
    });
  }
};


/**
 * Obtener un inversor por email
 */
export const getInvestorByEmailController = async (req: express.Request, res: express.Response) => {
  try {
    const emailRaw = (req.query.email as string) || (req.body && (req.body as any).email);
    if (!emailRaw || typeof emailRaw !== 'string') {
      res.status(400).json({
        error: "Missing email",
        message: "The 'email' query parameter is required."
      });
      return;
    }

    const email = emailRaw.toLowerCase();
    const investor = await getInvestorByEmail(email);
    if (!investor) {
      res.status(404).json({
        error: "Investor not found",
        message: "No investor found with the provided email."
      });
      return;
    }

    res.status(200).json(investor);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while retrieving the investor."
    });
  }
};

/**
 * Actualiza los datos de un inversor por su ID
 */
export const updateInvestor = async (req: express.Request, res: express.Response) => {
  const investorId = req.params.id;
  console.log('update request received for id', investorId);

  // Configurar almacenamiento para guardar archivos en ../documents relativo a este archivo (mismo nivel que src)
  const storage = multer.diskStorage({
    destination: (req_: any, file: any, cb: any) => {
      // Configurar el directorio de documentos
      const documentsDir = path.resolve(__dirname, "../../documents");
      try {
        // Crear el directorio si no existe
        if (!fs.existsSync(documentsDir)) {
          fs.mkdirSync(documentsDir, { recursive: true });
        }
      } catch (e) {
        // Manejo de errores al crear el directorio
        console.error('Error creating documents directory:', e);
        return cb(e as Error, documentsDir);
      }
      cb(null, documentsDir);
    },
    filename: (req_: any, file: any, cb: any) => {
      const ext = path.extname(file.originalname) || "";
      const sanitizedField = file.fieldname.replace(/[^a-zA-Z0-9_.-]/g, "_");
      cb(null, `${investorId}-${sanitizedField}-${Date.now()}${ext}`);
    }
  });

  // Configurar multer para manejar la carga de archivos
  const upload = multer({ storage });

  // Aceptar campos de imagen específicos y un máximo de 1 archivo por campo
  const fields = upload.fields([
    { name: 'authImages.frontID', maxCount: 1 },
    { name: 'authImages.backID', maxCount: 1 },
    { name: 'authImages.residenceProof', maxCount: 1 },
  ]);

  // Aceptar campos de imagen específicos y un máximo de 1 archivo por campo
  fields(req, res, async (err: any) => {
    // Manejo de los errores en la carga
    if (err) {
      res.status(400).json({ error: 'Upload error', message: err.message || String(err) });
      return;
    }

    try {
      const updateDoc: Record<string, any> = {};

      // Copiar campos no relacionados con archivos desde los datos del formulario
      if (req.body) {
        Object.entries(req.body).forEach(([key, value]) => {
          if (key === '_id') return;
          // Permitir que se copie en updateDoc solo la bandera de validación  de authImages
          if (key.startsWith('authImages.') && key !== 'authImages.validated') return;
          updateDoc[key] = value;
        });
      }

      // Manejar archivos subidos y actualizar las URLs en el documento
      const files = (req as any).files as { [fieldname: string]: { filename: string }[] } | undefined;
      if (files) {
        const fieldMap: Record<string, string> = {
          'authImages.frontID': 'frontID',
          'authImages.backID': 'backID',
          'authImages.residenceProof': 'residenceProof',
        };

        // Actualizar las URLs de los archivos en el documento updateDoc
        for (const [formField, imageKey] of Object.entries(fieldMap)) {
          const arr = files[formField];
          if (arr && arr[0]) {
            const fileUrl = `/documents/${arr[0].filename}`;
            updateDoc[`authImages.${imageKey}`] = fileUrl;
          }
        }
      }

      // Asegurarse de que la validación sea un booleano (Probablemente innecesario)
      if (typeof updateDoc['authImages.validated'] !== 'undefined') {
        const val = updateDoc['authImages.validated'];
        updateDoc['authImages.validated'] = (val === true || val === 'true');
      }

      const updatedInvestor = await updateInvestorById(investorId, updateDoc as any);
      res.status(200).json(updatedInvestor);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        res.status(400).json({
          error: "Duplicate field value",
          message: "A record already exists with some unique value you entered."
        });
        return;
      }
      console.error(error);
      res.status(500).json({
        error: "Update failed",
        message: "An unexpected error occurred while updating the investor."
      });
    }
  });
}