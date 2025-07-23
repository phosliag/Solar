import mongoose from "mongoose";
import { PURCHASE_BOND, REDEEM_BOND, CALL_CONTRACT_METHOD_CONTROLLER, EXECUTE_CONTRACT_METHOD_CONTROLLER, MINT_BOND, BRIDGE, BURN, CREATE_BOND, REQUEST_TRANSFER, BALANCE, GET_FAUCET_BALANCE, FAUCET, REQUEST_STABLE, CREATE_ACCOUNT_MULTIPLE, CREATE_INDIVIDUAL_ACCOUNT_RETRY, ContractMethodType } from "../utils/Constants";

export interface ITrxSuccessful {
  _id?: mongoose.Types.ObjectId;
  userId: string;
  timestamp: Date;
  network: string;
  trx_type: ContractMethodType;
  trx: string;
}

const TrxSuccessfulSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  network: { type: String, required: true },
  trx_type: {type: String,enum: [PURCHASE_BOND, REDEEM_BOND, CALL_CONTRACT_METHOD_CONTROLLER, EXECUTE_CONTRACT_METHOD_CONTROLLER, MINT_BOND, BRIDGE, BURN, CREATE_BOND, REQUEST_TRANSFER, BALANCE, GET_FAUCET_BALANCE, FAUCET, REQUEST_STABLE, CREATE_ACCOUNT_MULTIPLE, CREATE_INDIVIDUAL_ACCOUNT_RETRY],required: true,},
  trx: { type: String, required: true }
});

export const TrxSuccessfulModel = mongoose.model<ITrxSuccessful>("TrxSuccessful", TrxSuccessfulSchema); 

export const createTrxSuccessful = (values: Record<string, any>) => new TrxSuccessfulModel(values).save();
export const getTrxSuccessfulByUserId = (userId: string) => TrxSuccessfulModel.find({ userId: userId });
export const getAllTrxSuccessfulls = () => TrxSuccessfulModel.find();
