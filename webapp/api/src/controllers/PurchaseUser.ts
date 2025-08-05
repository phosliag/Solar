import { MongoServerError } from "mongodb";
import { createPurchaseUser, getPurchaseUsers, getRetailPurchasedByUserId } from "../db/PurchaseUser";
import { createPaymentInvoice, updatePaymentInvoiceById, getPaymentInvoicesByUserId } from "../db/PaymentInvoice";
import express from "express";
import { useApiBridge } from "../services/api-bridge.service";
import { getEntityByEntityName, getEntityById } from "../db/ProjectObject";
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
    const purchaseData = req.body;

    // Validate required fields
    if (!purchaseData.userId || !purchaseData.reference) {
      res.status(400).json({
        error: "Missing required fields",
        message: "userId and reference are required.",
      });
      return;
    }

    // Find the solar panel by _id in the full collection
    // TODO: change reference to _id in back and front because the data in reference is the panel _id
    const panel = await getSolarPanelById(purchaseData.reference);
    if (!panel) {
      res.status(404).json({
        error: "Panel not found",
        message: "The specified solar panel does not exist.",
      });
      return;
    }

    const user = await getInvestorById(purchaseData.userId);
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
      const purchase = await createPurchaseUser({ userId: purchaseData.userId, reference: purchaseData.reference });

      // Update the owner of the solar panel using the reference as _id
      updatedPanel = await updateSolarPanelById(purchaseData.reference, { owner: purchaseData.userId });
    } catch (error) {
      throw error
    }


    res.status(201).json({
      message: "Purchase successful",
      panel: updatedPanel,
      userId: purchaseData.userId,
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
    const { balance } = useBlockchainService();
    const userId = req.params.userId;
    const wallet = (await getInvestorById(userId)).walletAddress;
    const paymentInvoices = await getPaymentInvoicesByUserId(userId);
    const userResponse: UserInfo = { tokenList: [], upcomingPayment: [] };

    const today = dayjs();

    // recorremos los paymentInvoices. 

    for (const invoice of paymentInvoices) {
      const bond = await getEntityById(invoice.bonoId);
      const balanceResponse = await balance(bond.tokenState[0].contractAddress, wallet, bond.tokenState[0].network);

      // tokenList: todos los registros sin importar 'paid'
      userResponse.tokenList.push({
        bondName: bond.itemName,
        network: invoice.network,
        amountAvaliable: invoice.amount,
        price: (invoice.amount * Number(balanceResponse.message)) * bond.unitPrice,
      });

      // upcomingPayment: pagos no pagados y cuya fecha sea en el año actual
      for (const payment of invoice.payments) {
        const paymentDate = dayjs(payment.timeStamp);
        if (
          !payment.paid &&
          paymentDate.year() === today.year()
        ) {
          const paymentAmount = invoice.amount * bond.unitPrice * (bond.rate / 100);
          userResponse.upcomingPayment.push({
            bondName: bond.itemName,
            paymentDate: paymentDate.format("D/MM/YYYY"),
            paymentAmount,
          });
        }
      }
    }
    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los bonos del usuario" });
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
    res.status(500).json({ error: "Error al obtener los bonos del usuario" });
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
