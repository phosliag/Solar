import express, { Router } from "express";
import { getAllTrxSuccess, getAllTrxError } from "../controllers/trx";

export default (router: express.Router) => {
    router.get('/trx-success', getAllTrxSuccess)
    router.get('/trx-error', getAllTrxError)
}