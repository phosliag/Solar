import express from 'express';
import { createIssuer, getIssuerByEmail, getIssuers, updateIssuerById, deleteIssuerById } from '../db/Issuer'; // Asegúrate de importar el modelo correctamente
import { MongoServerError } from 'mongodb';
import { useBlockchainService } from '../services/blockchain.service'
import { UserInfo } from "../models/Payment";
import { getPaymentInvoicesByBonoId, updatePaymentInvoiceByData, getPaymentInvoiceByData, getPaymentInvoicesByUserId } from "../db/PaymentInvoice";
import { Payment, Investors } from "../models/Payment";
import { getIssuerById } from '../db/Issuer';
import dayjs from "dayjs";
import { getInvestorById } from '../db/Investor';
import { useApiBridge } from '../services/api-bridge.service';
import { CREATE_ACCOUNT_MULTIPLE, REQUEST_TRANSFER } from '../utils/Constants';
import { handleTransactionSuccess, handleTransactionError } from '../services/trx.service';
import { getEntitiesByUserId, getEntityById } from '../db/ProjectObject';
/**
 * Obtener todos los usuarios
 */
export const getAllIssuers = async (req: express.Request, res: express.Response) => {
  try {
    const users = await getIssuers(); // Obtiene todos los usuarios de la base de datos
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while retrieving users.",
    });
  }
};

export const getOneIssuer = async (req: express.Request, res: express.Response) => {
  try {
    const users = await getIssuerById(req.params.id); // Obtiene todos los usuarios de la base de datos
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
export const registerIssuer = async (req: express.Request, res: express.Response) => {
  let newIssuer = null;
  let foundIssuerId = null;

  try {
    console.log("📩 Recibido en req.body:", req.body);
    const issuer = req.body;
    const { createCompany } = useBlockchainService();

    // Validación de campos requeridos
    if (!issuer.entityLegalName || !issuer.country || !issuer.taxIdNumber || !issuer.name || !issuer.website
      || !issuer.surname || !issuer.idCard || !issuer.email || !issuer.password) {
      res.status(400).json({
        error: "Missing required fields",
        message: "All required fields must be provided.",
      });
      return;
    }

    console.log('✅ Validación de datos correcta');

    // Creación del nuevo usuario
    try {
      newIssuer = await createIssuer(issuer);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        res.status(400).json({
          error: "Issuer already exists",
          message: `The value for ${Object.keys(error.keyValue).join(", ")} already exists.`,
        });
        return;
      }
      throw error; // Lanza otros errores para que sean manejados en el catch principal
    }

    if (!newIssuer) return;
    const foundIssuer = await getIssuerByEmail(newIssuer.email);
    foundIssuerId = foundIssuer._id.toString();
    console.log(foundIssuerId);

    let response = null;
    try {
      response = await createCompany(foundIssuerId);
      for (const account of response.accounts) {
        
        await handleTransactionSuccess(
          foundIssuerId,
          CREATE_ACCOUNT_MULTIPLE,
          account
        );
        // Llamar al faucet para la nueva cuenta
        await useApiBridge.faucet(account.address, 10);
        console.log("Faucet realizado para la cuenta:", account.address);
      }
    } catch (error) {
      for (const account of response.accounts) {
        await handleTransactionError(
          foundIssuerId,
          CREATE_ACCOUNT_MULTIPLE,
          error
        );
      }
      throw error; // Lanza el error para que sea manejado en el catch principal
    }

    // Actualizar el emisor con la dirección de la wallet y las cuentas
    const updatedIssuer = await updateIssuerById(foundIssuerId, { 
      walletAddress: response.address, 
      accounts: response.accounts 
    });

    console.log("nuevo", updatedIssuer);
    res.status(201).json(updatedIssuer);
  } catch (error) {
    console.error(error);
    if (foundIssuerId) {
      await deleteIssuerById(foundIssuerId);
    }
    res.status(500).json({
      error: "Issuer creation failed",
      message: "An unexpected error occurred while creating the issuer.",
    });
  }
};

/**
 * recuper el token en ciruclacion y los siguientes pagos a hacer  
 */

export const getTokenListAndUpcomingPaymentsByIssuer = async (req: express.Request, res: express.Response) => {
  const { balance } = useBlockchainService();

  try {
    const userId = req.params.userId;
    const wallet = (await getIssuerById(userId)).walletAddress;
    const entities = await getEntitiesByUserId(userId);
    const invoices = await getPaymentInvoicesByUserId(userId);
    const userResponse: UserInfo = { tokenList: [], upcomingPayment: [] };
    const today = dayjs();

    for (const entity of entities) {
      for (const token of entity.tokenState) {
        const balanceResponse = await balance(token.contractAddress, wallet, token.network);
        const amountAvailable = token.amount - Number(balanceResponse.message);

        userResponse.tokenList.push({
          bondName: entity.itemName,
          network: token.network,
          amountAvaliable: token.amount - Number(balanceResponse.message),
          price: amountAvailable * entity.unitPrice,
        });

        const relatedInvoice = invoices.find(inv =>
          inv.bonoId === entity.id &&
          inv.network === token.network.toUpperCase()
        );

        if (relatedInvoice) {
          for (const payment of relatedInvoice.payments) {
            const paymentDate = dayjs(payment.timeStamp);

            if (!payment.paid && paymentDate.year() === today.year()) {
              const paymentAmount = entity.unitPrice * (entity.rate / 100);
              userResponse.upcomingPayment.push({
                bondName: entity.itemName,
                paymentDate: paymentDate.format("D/MM/YYYY"),
                paymentAmount: amountAvailable * paymentAmount,
              });
            }
          }
        }
      }
    }
    console.log("userResponse: ", userResponse)
    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los bonos del usuario" });
  }
};


/**
 * get Pending Payments. 
 */
export const getPendingPayments = async (req: express.Request, res: express.Response) => {
  const { balance } = useBlockchainService();
  try {
    const userId = req.params.userId;
    const wallet = (await getIssuerById(userId)).walletAddress;
    console.log(wallet);
    const entities = await getEntitiesByUserId(userId);
    console.log(entities);
    const today = dayjs();

    let finalResponse: Payment[] = []
    const pastDuePayments: Payment[] = [];
    const upcomingPayments: Payment[] = [];

    //pòr cada bonoId hay q buscar en invoice todo y meterlo en una lista de usuario q se guardara en cada bono        
    for (const entity of entities) {
      const invoices = await getPaymentInvoicesByBonoId(entity.id);

      for (const invoice of invoices) {
        for (const payment of invoice.payments) {
          if (payment.paid) continue;
          const paymentDate = dayjs(payment.timeStamp);
          const isPastDue = paymentDate.isBefore(today, "day");
          const isUpcoming = paymentDate.isBefore(today.add(30, "day")) && paymentDate.isAfter(today, "day");

          const investor: Investors = {
            userId: invoice.userId,
            numberToken: invoice.amount,
            amount: invoice.amount * entity.unitPrice,
            paid: false,
          };

          const targetList = isPastDue ? pastDuePayments : isUpcoming ? upcomingPayments : null;
          if (!targetList) continue;
          let existingPayment = targetList.find(
            p => p.bondName === entity.itemName && p.network === invoice.network
          );

          if (existingPayment) {
            existingPayment.investors.push(investor);
            existingPayment.numberToken += invoice.amount;
            existingPayment.amount += investor.amount;
          } else {
            const newPayment: Payment = {
              bondName: entity.itemName,
              bondId: entity._id.toString(),
              network: invoice.network,
              numberToken: invoice.amount,
              amount: investor.amount,
              paymentDate: payment.timeStamp.toISOString(),
              investors: [investor],
            };
            targetList.push(newPayment);
          }
        }
      }
    }

    console.log('upcomingPayments', upcomingPayments);
    console.log('pastDuePayments', pastDuePayments);
    res.status(200).json({
      upcomingPayments,
      pastDuePayments
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los bonos del usuario" });
  }
};

export const updatePayment = async (req: express.Request, res: express.Response) => {
  console.log("📩 Recibido en req.body:", req.body);
  const { userId, bondId, network } = req.body;
  const paid = true;

  const invoice = await getPaymentInvoiceByData(userId, bondId, network);
  const entity = await getEntityById(bondId);

  const contractAddress = entity.tokenState.find((block: any) =>
    block.network.toUpperCase() === network.toUpperCase()).contractAddress;
  const issuer = await getIssuerById(entity.creator);
  const inversor = await getInvestorById(userId);
  const amount = invoice.amount * (entity.unitPrice * (entity.rate / 100));
  console.log('amount', amount);
  let responseTransfer;
  try {
    
    // Pagar al inversor por el bono. REVISAR: solo he inertido las wallet
    responseTransfer = await useApiBridge.requestStable(inversor.walletAddress, issuer.walletAddress, Math.floor(amount));
    if (responseTransfer) {
      await handleTransactionSuccess(
        userId,
        REQUEST_TRANSFER,
        responseTransfer
      );
    }
    console.log("Response Transfer:", responseTransfer);
  } catch (error) {
    await handleTransactionError(
      userId,
      REQUEST_TRANSFER,
      error
    );
    console.log("Error al transferir el dinero:", error);
    res.status(500).json({ error: "Error al transferir el dinero" });
    return;
  }
  
  const payment = await updatePaymentInvoiceByData(userId, bondId, network, { payment: { paid: true, trxPaid: responseTransfer.message } });

  res.status(200).json(payment);
}
