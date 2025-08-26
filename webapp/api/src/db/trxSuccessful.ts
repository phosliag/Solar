import mongoose from "mongoose";
import { PURCHASE, REDEEM, CALL_CONTRACT_METHOD_CONTROLLER, EXECUTE_CONTRACT_METHOD_CONTROLLER, CREATE, NFT_TRANSFER, BALANCE, GET_FAUCET_BALANCE, FAUCET, REQUEST_STABLE, CREATE_ACCOUNT, ContractMethodType } from "../utils/Constants";

export interface ITrxSuccessful {
  _id?: mongoose.Types.ObjectId;
  userId: string;
  timestamp: Date;
  trx_type: ContractMethodType;
  trx: string;
}

const TrxSuccessfulSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  trx_type: {type: String,enum: [PURCHASE, REDEEM, CALL_CONTRACT_METHOD_CONTROLLER, EXECUTE_CONTRACT_METHOD_CONTROLLER, CREATE, NFT_TRANSFER, BALANCE, GET_FAUCET_BALANCE, FAUCET, REQUEST_STABLE, CREATE_ACCOUNT],required: true,},
  trx: { type: String, required: true }
});

export const TrxSuccessfulModel = mongoose.model<ITrxSuccessful>("TrxSuccessful", TrxSuccessfulSchema); 

export const createTrxSuccessful = (values: Record<string, any>) => new TrxSuccessfulModel(values).save();
export const getTrxSuccessfulByUserId = (userId: string) => TrxSuccessfulModel.find({ userId: userId });
export const getAllTrxSuccessfulls = () => TrxSuccessfulModel.find();
