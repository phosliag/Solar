import { getPurchaseUsers } from "../db/PurchaseUser";
import { purchase, getAllPurchaseUsers, getTokenListAndUpcomingPaymentsByInvestor, balanceFaucet, faucetStable } from "../controllers/PurchaseUser";
import express from "express";
import { getAllIssuers, registerIssuer, updatePayment, getOneIssuer } from "../controllers/Issuer";
import { getAllInvestors, registerInvestor } from "../controllers/Investor";
import { login } from "../controllers/auth";

export default (router: express.Router) => {
    router.post('/register-purchase', purchase)   
    router.post('/register-issuer', registerIssuer)
    router.post('/register-investor', registerInvestor)
    router.get('/users', getAllPurchaseUsers)
    router.get('/investors', getAllInvestors)
    router.post('/login', login)
    router.get('/bonds-investor-tokens/:userId', getTokenListAndUpcomingPaymentsByInvestor)
    router.post('/users-balance', balanceFaucet)
    router.post('/update-payment', updatePayment)
    router.post('/faucet-stable', faucetStable)
}