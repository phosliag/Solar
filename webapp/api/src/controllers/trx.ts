import { getAllTrxSuccessfulls } from "../db/trxSuccessful";
import { getAllTrxErrors } from "../db/trxError";
import express from "express";
import { getInvestors } from "../db/Investor";
import { getIssuers } from "../db/Issuer";


export const getAllTrxSuccess = async (req: express.Request, res: express.Response) => {
    try {
    const trxSuccessfulls = await getAllTrxSuccessfulls();
    console.log(trxSuccessfulls);
    const investors = await getInvestors();
    const issuers = await getIssuers();
    const users = [...investors, ...issuers];
    const trxSuccessfullsWithInvestor = trxSuccessfulls.map(trxs => {
        const user = users.find((investor: any) => investor._id.toString() === trxs.userId);
        const { userId, timestamp, network, trx_type, trx } = trxs;
        if (user) {
            return { timestamp, network, trx_type, trx, userId: user.walletAddress };
        }
        return { timestamp, network, trx_type, trx, userId };
    });
        
    res.status(200).json(trxSuccessfullsWithInvestor);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal server error", massage: "Internal server error" });
  }
};

export const getAllTrxError = async (req: express.Request, res: express.Response) => {
    try {
    const trxErrors = await getAllTrxErrors();
    res.status(200).json(trxErrors);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal server error", massage: "Internal server error" });
  }
};
