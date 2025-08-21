import { MongoServerError } from "mongodb";
import { createPurchaseUser, getPurchaseUsers, getRetailPurchasedByUserId } from "../db/PurchaseUser";
import { createPaymentInvoice, updatePaymentInvoiceById, getPaymentInvoicesByUserId } from "../db/PaymentInvoice";
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
import { REQUEST_TRANSFER, REQUEST_STABLE } from "../utils/Constants";
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

export const purchase = async (req: express.Request, res: express.Response) => {
  try {
    console.log(req.body);
    const {userId, panelId} = req.body;

    // Validate required fields
    if (!userId || !panelId) {
      res.status(400).json({
        error: "Missing required fields",
        message: "userId and reference are required.",
      });
      return;
    }

    // Find the solar panel by _id in the full collection
    // TODO: change reference to _id in back and front because the data in reference is the panel _id
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
    let updatedPanel, nftTransfer;
    try {
      nftTransfer = await useBlockchainService().transferNFT(user.walletAddress, panel.NftId);

      // Create the purchase record
      const purchase = await createPurchaseUser({ userId: userId, reference: panelId });

      // Update the owner of the solar panel using the reference as _id
      updatedPanel = await updateSolarPanelById(panelId, { owner: userId });
    } catch (error) {
      throw error
    }

    await createPaymentInvoice({userId, panelId, payments:[{paid: false}]})

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

// TODO: Revisar si es necesario!!!!!!!!
export const getTokenListAndUpcomingPaymentsByInvestor = async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params.userId;
    const invoices = await getPaymentInvoicesByUserId(userId);

    // Compose a response that includes all invoices with panel info and payment details
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
            amount: p.amount ? parseFloat(String(p.amount)) : 0,
          })),
        };
      })
    );

    // Maintain existing keys for compatibility
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
