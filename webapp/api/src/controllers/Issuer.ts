import express from 'express';
import { createIssuer, getIssuerByEmail, getIssuers, updateIssuerById, deleteIssuerById } from '../db/Issuer'; // Asegúrate de importar el modelo correctamente
import { MongoServerError } from 'mongodb';
import { useBlockchainService } from '../services/blockchain.service'
import { UserInfo } from "../models/Payment";
import { getPaymentInvoicesByPanelId, updatePaymentInvoiceByData, getPaymentInvoiceByData, getPaymentInvoicesByUserId } from "../db/PaymentInvoice";
import { Payment, Investors } from "../models/Payment";
import { getIssuerById } from '../db/Issuer';
import dayjs from "dayjs";
import { getInvestorById } from '../db/Investor';
import { useApiBridge } from '../services/api-bridge.service';
import { CREATE_ACCOUNT_MULTIPLE, REQUEST_TRANSFER } from '../utils/Constants';
import { handleTransactionSuccess, handleTransactionError } from '../services/trx.service';
import { getSolarPanelById } from '../db/SolarPanel';

/**
 * recuper el token en ciruclacion y los siguientes pagos a hacer  
 */
//TODO: Revisar esta funcion para usarla para payment??????
export const getTokenListAndUpcomingPaymentsByIssuer = async (req: express.Request, res: express.Response) => {
  const { balance } = useBlockchainService();

  // try {
  //   const userId = req.params.userId;
  //   const wallet = (await getIssuerById(userId)).walletAddress;
  //   const entities = await getEntitiesByUserId(userId);
  //   const invoices = await getPaymentInvoicesByUserId(userId);
  //   const userResponse: UserInfo = { tokenList: [], upcomingPayment: [] };
  //   const today = dayjs();

  //   for (const entity of entities) {
  //     for (const token of entity.tokenState) {
  //       const balanceResponse = await balance(token.contractAddress, wallet, token.network);
  //       const amountAvailable = token.amount - Number(balanceResponse.message);

  //       userResponse.tokenList.push({
  //         bondName: entity.itemName,
  //         network: token.network,
  //         amountAvaliable: token.amount - Number(balanceResponse.message),
  //         price: amountAvailable * entity.unitPrice,
  //       });

  //       const relatedInvoice = invoices.find(inv =>
  //         inv.bonoId === entity.id &&
  //         inv.network === token.network.toUpperCase()
  //       );

  //       if (relatedInvoice) {
  //         for (const payment of relatedInvoice.payments) {
  //           const paymentDate = dayjs(payment.timeStamp);

  //           if (!payment.paid && paymentDate.year() === today.year()) {
  //             const paymentAmount = entity.unitPrice * (entity.rate / 100);
  //             userResponse.upcomingPayment.push({
  //               bondName: entity.itemName,
  //               paymentDate: paymentDate.format("D/MM/YYYY"),
  //               paymentAmount: amountAvailable * paymentAmount,
  //             });
  //           }
  //         }
  //       }
  //     }
  //   }
  //   console.log("userResponse: ", userResponse)
  //   res.status(200).json(userResponse);
  // } catch (error) {
  //   res.status(500).json({ error: "Error al obtener los bonos del usuario" });
  // }
};


/**
 * get Pending Payments. 
 */
// TOD: Revisar tambien!!!
export const getPendingPayments = async (req: express.Request, res: express.Response) => {
  const { balance } = useBlockchainService();
  // try {
  //   const userId = req.params.userId;
  //   const wallet = (await getIssuerById(userId)).walletAddress;
  //   console.log(wallet);
  //   const entities = await getEntitiesByUserId(userId);
  //   console.log(entities);
  //   const today = dayjs();

  //   let finalResponse: Payment[] = []
  //   const pastDuePayments: Payment[] = [];
  //   const upcomingPayments: Payment[] = [];

  //   //pòr cada bonoId hay q buscar en invoice todo y meterlo en una lista de usuario q se guardara en cada bono        
  //   for (const entity of entities) {
  //     const invoices = await getPaymentInvoicesByBonoId(entity.id);

  //     for (const invoice of invoices) {
  //       for (const payment of invoice.payments) {
  //         if (payment.paid) continue;
  //         const paymentDate = dayjs(payment.timeStamp);
  //         const isPastDue = paymentDate.isBefore(today, "day");
  //         const isUpcoming = paymentDate.isBefore(today.add(30, "day")) && paymentDate.isAfter(today, "day");

  //         const investor: Investors = {
  //           userId: invoice.userId,
  //           numberToken: invoice.amount,
  //           amount: invoice.amount * entity.unitPrice,
  //           paid: false,
  //         };

  //         const targetList = isPastDue ? pastDuePayments : isUpcoming ? upcomingPayments : null;
  //         if (!targetList) continue;
  //         let existingPayment = targetList.find(
  //           p => p.bondName === entity.itemName && p.network === invoice.network
  //         );

  //         if (existingPayment) {
  //           existingPayment.investors.push(investor);
  //           existingPayment.numberToken += invoice.amount;
  //           existingPayment.amount += investor.amount;
  //         } else {
  //           const newPayment: Payment = {
  //             bondName: entity.itemName,
  //             bondId: entity._id.toString(),
  //             network: 'ALASTRIA',
  //             numberToken: invoice.amount,
  //             amount: investor.amount,
  //             paymentDate: payment.timeStamp.toISOString(),
  //             investors: [investor],
  //           };
  //           targetList.push(newPayment);
  //         }
  //       }
  //     }
  //   }

  //   console.log('upcomingPayments', upcomingPayments);
  //   console.log('pastDuePayments', pastDuePayments);
  //   res.status(200).json({
  //     upcomingPayments,
  //     pastDuePayments
  //   });
  // } catch (error) {
  //   res.status(500).json({ error: "Error al obtener los bonos del usuario" });
  // }
};

export const updatePayment = async (req: express.Request, res: express.Response) => {
  console.log("📩 Recibido en req.body:", req.body);
  const { userId, panelId, amount, timeStamp } = req.body;
  const paid = true;

  // const invoice = await getPaymentInvoiceByData(userId, panelId);
  const panel = await getSolarPanelById(panelId);

  const inversor = await getInvestorById(userId);

  let responseTransfer;
  try {

    // Pagar al inversor por el bono. REVISAR: solo he inertido las wallet
    responseTransfer = await useApiBridge.requestStable(inversor.walletAddress, process.env.ADMIN_ACCOUNTS_PUBLIC_KEY, panel.price);
    if (responseTransfer) {
      await handleTransactionSuccess(userId, REQUEST_TRANSFER, responseTransfer);
    }
    console.log("Response Transfer:", responseTransfer);
  } catch (error) {
    await handleTransactionError(userId, REQUEST_TRANSFER, error);
    console.log("Error al transferir el dinero:", error);
    res.status(500).json({ error: "Error al transferir el dinero" });
    return;
  }

  // TODO -- Revisar el update y creacion del nuevo invoice para mes que viene
  // NO OLVIDAR CAMBIAR FETCH FRONT (si es necesario)
  const payment = await updatePaymentInvoiceByData(
    userId,
    panelId,
    {
      payment: {
        paid: true,
        trxPaid: responseTransfer.message,
        amount: amount,
        timeStamp: timeStamp || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 12)
      }
    }
  );

  res.status(200).json(payment);
}
