import express from "express";
import { getEntities, createNewEntity, updateEntityById, deleteEntityById, GenericModel } from "../db/ProjectObject";
import { MongoServerError } from "mongodb";
import { useBlockchainService } from '../services/blockchain.service'
import { useBusinessService } from '../services/business.service'
import { getIssuerById } from '../db/Issuer'; 
import { CREATE_BOND, MINT_BOND } from "../utils/Constants";
import { handleTransactionSuccess, handleTransactionError } from "../services/trx.service";


// // AÑADIR EN EL FRONT Q SE LA PASE EL ID DEL USUARIO
// export const getAllEntity = async (req: express.Request, res: express.Response) => {
//     try {
//     const panels = await getEntities();
//     res.status(200).json(panels);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ error: "Internal server error", massage: "Internal server error" });
//   }
// };


// export const createEntity = async (req: express.Request, res: express.Response) => {
//   const { mintBond } = useBlockchainService();
//   const { calculateBondPrice, getBondNetWorkAccount } = useBusinessService();

//   try {
//     console.log(req.body);
//     const entityData = req.body;

//     const {
//       itemName,
//       startDate,
//       endDate,
//       description,
//       rate,
//       frequency,
//       targetAmount,
//       totalUnits,
//       earlyExitOption,
//       exitPenalty,
//       exitStartDate,
//       exitEndDate,
//       network,
//     } = req.body;

//     // Validate required fields
//     if ( !itemName || !startDate || !endDate ||
//       !description || !rate || !frequency || !targetAmount ||
//       !totalUnits || !earlyExitOption || !network
//     ) {
//       res.status(400).json({
//         error: "Missing fields",
//         message: "All available fields must be provided.",
//       });
//       return;
//     }
//     console.log("ok - data");

//     // Validate conditional fields
//     if (earlyExitOption === "yes" && (!exitPenalty || !exitStartDate || !exitEndDate)) {
//       res.status(400).json({
//         error: "Missing early redemption fields",
//         message: "If there are early redemption clauses, the penalty and redemption periods fields are required.",
//       });
//       return;
//     }

//     console.log("ok - all data");

//     let createdEntity;

//     // Create the entity using the createPanel method
//     createdEntity = await createNewEntity(entityData).catch((error) => {
//       if (error instanceof MongoServerError && error.code === 11000) {
//         res.status(400).json({
//           error: "Duplicate itemName detected",
//           message: "Duplicate itemName detected.",
//         });
//         return;
//       }
//     });

//     if (!createdEntity) return;
  
//     try {
//       const issuer = (await getIssuerById(createdEntity.creator));
//       if (!issuer) {
//         res.status(404).json({ error: "Issuer not found" });
//         return; 
//       }

//       const wallet = issuer.walletAddress;
      
//       const entityPrice = await calculateBondPrice(createdEntity);
//       console.log(entityPrice);
      
//       let responseCreateCompanyEntity;

//       try {
//         responseCreateCompanyEntity = await createCompanyBond(createdEntity.itemName, createdEntity.itemCode,
//           entityPrice, wallet);
//         await handleTransactionSuccess(
//           issuer.id,
//           createdEntity.network.toUpperCase(),
//           CREATE_BOND,
//           responseCreateCompanyEntity.accounts[0]
//         );
//       } catch (error) {
//         await handleTransactionError(
//           issuer.id,
//           createdEntity.network.toUpperCase(),
//           CREATE_BOND,
//           error
//         );
//       }   
      
//       const contractAddress = await getBondNetWorkAccount(responseCreateCompanyEntity.accounts, createdEntity.network.toUpperCase());
      
//       let responseMintEntity;
//       try {
//         responseMintEntity = await mintBond(contractAddress, wallet, createdEntity.totalUnits);
//         await handleTransactionSuccess(
//           createdEntity.creator,
//           createdEntity.network.toUpperCase(),
//           MINT_BOND,
//           responseMintEntity 
//         );
//       } catch (error) {
//         await handleTransactionError(
//           issuer.id,
//           createdEntity.network.toUpperCase(),
//           MINT_BOND,
//           error
//         );
//       }
//       // Update the entity with the contract address in tokenState
//       await updateEntityById(createdEntity._id.toString(), { 
//         tokenState: [{
//           network: createdEntity.network,
//           amount: createdEntity.totalUnits,
//           contractAddress: contractAddress
//         }]
//       });
//       res.status(201).json({
//         createdEntity, 
//         trx: {
//           createCompanyEntity: responseCreateCompanyEntity.message,
//           mintEntity: responseMintEntity.message
//         }
//       });
//     } catch (error) {
//       // If something fails in the blockchain operations, delete the created document
//       await deleteEntityById(createdEntity._id.toString());
//       throw error; // Re-throw the error to be caught by the outer catch
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: "Entity creation failed",
//       message: "An unexpected error occurred while creating the entity.",
//     });
//   }
// };

// export const updateEntity = async (req: express.Request, res: express.Response) => {
//   const { id } = req.params;
//   try {
//     // Busca y actualiza el bono, devolviendo el documento actualizado
//     const updatedEntity = await GenericModel.findByIdAndUpdate(
//       id, // ID del bono a actualizar
//       req.body, // Datos de actualización
//       { new: true, runValidators: true } // Opciones: `new` devuelve el documento actualizado; `runValidators` valida según el esquema
//     );

//     if (!updatedEntity) {
//       res.status(404).json({ message: "Entity not found." });
//       return;
//     }

//     res.status(200).json({ updatedEntity });
//   } catch (error) {
//     res.status(400).json({
//       message: error.message,
//       error: error.message,
//     });
//   }
// };
