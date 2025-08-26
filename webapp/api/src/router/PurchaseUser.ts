import express from "express";
import { getPurchaseUsers } from "../db/PurchaseUser";
import { purchase, getAllPurchaseUsers, getTokenListAndUpcomingPaymentsByInvestor, balanceFaucet, faucetStable, updatePayment } from "../controllers/PurchaseUser";
import { getAllInvestors, registerInvestor, updateInvestor, getInvestorByEmailController } from "../controllers/Investor";
import { login } from "../controllers/auth";

export default (router: express.Router) => {
    router.post('/register-purchase', purchase)
    router.post('/register-investor', registerInvestor)
    router.put('/update-investor/:id', updateInvestor)
    router.get('/users', getAllPurchaseUsers)
    router.get('/investors', getAllInvestors)
    router.get('/investor-by-email', getInvestorByEmailController)
    router.post('/login', login)
    router.get('/bonds-investor-tokens/:userId', getTokenListAndUpcomingPaymentsByInvestor)
    router.post('/users-balance', balanceFaucet)
    router.post('/update-payment', updatePayment)
    router.post('/faucet-stable', faucetStable)
}