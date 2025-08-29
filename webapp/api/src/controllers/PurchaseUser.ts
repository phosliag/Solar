import { MongoServerError } from "mongodb";
import { createPurchaseUser, getPurchaseUsers, getRetailPurchasedByUserId } from "../db/PurchaseUser";
import { createPaymentInvoice, updatePaymentInvoiceById, getPaymentInvoicesByUserId, getAllPaymentInvoices, getPaymentInvoiceByData, addPaymentToInvoice, markPaymentAsPaid } from "../db/PaymentInvoice";
import express from "express";
import { useApiBridge } from "../services/api-bridge.service";
import { getIssuerById } from "../db/Issuer";
import { getInvestorByEmail, getInvestorById } from "../db/Investor";
import { UserInfo, UpcomingPayment, PurchaseBond } from "../models/Payment";
import dayjs from "dayjs";
import { useBlockchainService } from '../services/blockchain.service'
import { VoidSigner } from "ethers";
import { getRetailMarkets, updateRetailMarketById } from "../db/RetailMarket";
import { handleTransactionError, handleTransactionSuccess } from "../services/trx.service";
import { NFT_TRANSFER, REQUEST_STABLE } from "../utils/Constants";
import { updateSolarPanelById, getSolarPanelById } from "../db/SolarPanel";


export const getAllPurchaseUsers = async (req: express.Request, res: express.Response) => {
  try {
    const users = await getPurchaseUsers();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal server error", massage: "Internal server error" });
  }
};

/**
 * TODO: Revisar el envio del price del a la placa porque al precio que se asigna a la placa y el que aparece
 * en las trx no es el mismo.
 */
export const purchase = async (req: express.Request, res: express.Response) => {
  try {
    console.log(req.body);
    const { userId, panelId } = req.body;

    // Validacion de los parametros
    if (!userId || !panelId) {
      res.status(400).json({
        error: "Missing required fields",
        message: "userId and reference are required.",
      });
      return;
    }

    // Comprobar si el panel y usuario existen
    const panel = await getSolarPanelById(panelId);
    if (!panel) {
      res.status(404).json({
        error: "Panel not found",
        message: "The specified solar panel does not exist.",
      });
      return;
    }

    const user = await getInvestorById(userId);
    if (!user) {
      res.status(404).json({
        error: "User not found",
        message: "The specified user does not exist.",
      });
      return;
    }

    let updatedPanel, trxStable, purchase, nftTransfer;
    try {
      // TODO -- Revisar enviar bien el price -----
      console.log(parseFloat(panel.price.toString()))
      trxStable = await useApiBridge.requestStable(process.env.ADMIN_ACCOUNTS_PUBLIC_KEY, user.walletAddress, parseFloat(panel.price.toString()));
      if (trxStable) {
        await handleTransactionSuccess(userId, REQUEST_STABLE, trxStable);
      }
    } catch (error) {
      console.log(error)
      await handleTransactionError(userId, REQUEST_STABLE, error);
      res.status(400).json({
        error: "Error in requestStable",
        message: error instanceof Error ? error.message : "Unknow error in requestStable",
        details: error
      });
      return;
    }

    try {
      nftTransfer = await useBlockchainService().transferNFT(user.walletAddress, panel.NftId);
      if (nftTransfer) {
        await handleTransactionSuccess(userId, NFT_TRANSFER, nftTransfer);
      }
      // Crear el registro de compra
      purchase = await createPurchaseUser({ userId: userId, reference: panelId });

      // Actualiza el panel solar con el nuevo propietario
      updatedPanel = await updateSolarPanelById(panelId, { owner: userId });
    } catch (error) {
      await handleTransactionError(userId, NFT_TRANSFER, error);
      res.status(400).json({
        error: "Error in nftTransfer",
        message: error instanceof Error ? error.message : "Unknow error in nftTransfer",
        details: error
      });
      return;
    }

    // Crea el primer invoice, con el estado inicial de "no pagado"
    await createPaymentInvoice({ userId, panelId, payments: [{ paid: false }] });

    res.status(201).json({
      message: "Purchase successful",
      panel: updatedPanel,
      userId: userId,
      purchase,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Purchase failed",
      message: "An unexpected error occurred while processing the purchase.",
    });
    return;
  }
};

export const getTokenListAndUpcomingPaymentsByInvestor = async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params.userId;
    const invoices = await getPaymentInvoicesByUserId(userId);

    // Devuelve los invoices del inversor 
    const panelInvoices = await Promise.all(
      invoices.map(async (inv) => {
        const panel = await getSolarPanelById(inv.panelId);
        return {
          invoiceId: String(inv._id),
          panelId: inv.panelId,
          panelName: panel?.name || inv.panelId,
          payments: (inv.payments || []).map((p: any) => ({
            timeStamp: p.timeStamp,
            paid: p.paid,
            trxPaid: p.trxPaid ?? null,
            amount: p.amount ? parseFloat(String(p.amount)) : 0, // Convertir a number si existe porque puede venir como Decimal128
          })),
        };
      })
    );

    res.status(200).json({ tokenList: [], upcomingPayment: [], invoices: panelInvoices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving investor invoices" });
  }
};

export const balanceFaucet = async (req: express.Request, res: express.Response) => {
  try {
    const data = req.body;

    const balance = await useApiBridge.faucetBalance(data.address);

    let big = BigInt(balance.message);
    let amountFinal: number = Number(big);

    console.log(amountFinal);

    res.status(200).json(amountFinal / 1000000);
  } catch (error) {
    console.error("Error en faucetBalance:", error);
    res.status(502).json({ error: "No se pudo obtener el balance desde el faucet" });
  }
};

export const faucetStable = async (req: express.Request, res: express.Response) => {
  try {
    const data = req.body;

    const response = await useApiBridge.faucet(data.address, data.amount);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los bonos del usuario" });
  }
}

/**
 * get Pending Payments.
 */
export const getPendingPayments = async (req: express.Request, res: express.Response) => {
  try {
    const invoices: any[] = await getAllPaymentInvoices();
    // Convertir Decimal128 a number para amounts si existe
    const normalized = invoices.map((inv: any) => ({
      _id: String(inv._id),
      userId: inv.userId,
      panelId: inv.panelId,
      purchaseDate: inv.purchaseDate,
      payments: (inv.payments || []).map((p: any) => ({
        timeStamp: p.timeStamp,
        paid: p.paid,
        trxPaid: p.trxPaid || "",
        amount: typeof p.amount === 'object' && p.amount !== null && 'toString' in p.amount ? parseFloat(String(p.amount)) : (p.amount ?? null)
      }))
    }));

    res.status(200).json({ invoices: normalized });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los pagos pendientes" });
  }
};

export const updatePayment = async (req: express.Request, res: express.Response) => {
  console.log("📩 Recibido en req.body:", req.body);
  const { userId, panelId, amount } = req.body;
  const paid = true;

  const inversor = await getInvestorById(userId);

  let responseTransfer;
  try {
    //TODO -- REVISAR: da error en pay
    responseTransfer = await useApiBridge.requestStable(inversor.walletAddress, process.env.ADMIN_ACCOUNTS_PUBLIC_KEY, Math.round(amount));
    if (responseTransfer) {
      await handleTransactionSuccess(userId, REQUEST_STABLE, responseTransfer);
    }
    console.log("Response Transfer:", responseTransfer);
  } catch (error) {
    await handleTransactionError(userId, REQUEST_STABLE, error);
    console.log("Error al transferir el dinero:", error);
    res.status(500).json({ error: "Error al transferir el dinero" });
    return;
  }

  try {
    // Localiza el invoice y el payment pendiente (paid === false)
    const invoice: any = await getPaymentInvoiceByData(userId, panelId);
    if (!invoice) {
      res.status(404).json({ error: "Payment invoice no encontrada para el usuario/panel dados" });
      return;
    }

    const now = new Date();
    const unpaidPayments: any[] = (invoice.payments || []).filter((p: any) => !p.paid);
    if (unpaidPayments.length === 0) {
      res.status(400).json({ error: "No hay pagos pendientes para actualizar" });
      return;
    }

    // Busca el pago vencido (<= hoy). Si no, el primero pendiente por fecha. (Puede ser una comprobacion innecesaria si los pagos siempre se crean en orden)
    unpaidPayments.sort((a: any, b: any) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime());
    const targetPayment = unpaidPayments.find((p: any) => new Date(p.timeStamp).getTime() <= now.getTime()) || unpaidPayments[0];
    const targetTimestamp: Date = new Date(targetPayment.timeStamp);

    // 2) Marcar ese payment como pagado y adjuntar datos (amount, trx)
    await markPaymentAsPaid(
      invoice._id.toString(),
      targetTimestamp,
      {
        paid: true,
        trxPaid: responseTransfer?.message || "",
        amount: amount,
      }
    );

    // Crear el siguiente registro: último día del mes posterior al del pago actualizado (a las 12:00)
    const nextPaymentDate = new Date(targetTimestamp.getFullYear(), targetTimestamp.getMonth() + 1, 0, 12);
    const updatedInvoice = await addPaymentToInvoice(invoice._id.toString(), {
      timeStamp: nextPaymentDate,
      paid: false,
      trxPaid: "",
    });

    res.status(200).json(updatedInvoice);
  } catch (error) {
    console.log("Error actualizando el invoice/pagos:", error);
    res.status(500).json({ error: "Error al actualizar el estado del pago" });
  }
}
