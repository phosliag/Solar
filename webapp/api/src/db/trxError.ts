import mongoose from "mongoose";
import { PURCHASE, REDEEM, CALL_CONTRACT_METHOD_CONTROLLER, EXECUTE_CONTRACT_METHOD_CONTROLLER, CREATE, NFT_TRANSFER, BALANCE, GET_FAUCET_BALANCE, FAUCET, REQUEST_STABLE, CREATE_ACCOUNT, ContractMethodType } from "../utils/Constants";

export interface ITrxError {
  _id?: mongoose.Types.ObjectId;
  userId: string;
  timestamp: Date;
  trx_type: ContractMethodType;
  data: string;
}

const TrxErrorSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  trx_type: {type: String,enum: [ PURCHASE, REDEEM, CALL_CONTRACT_METHOD_CONTROLLER, EXECUTE_CONTRACT_METHOD_CONTROLLER, CREATE, NFT_TRANSFER, BALANCE, GET_FAUCET_BALANCE, FAUCET, REQUEST_STABLE, CREATE_ACCOUNT],required: true,},
  data: { type: String, required: true }
});


// Exportar el modelo
export const TrxErrorModel = mongoose.model<ITrxError>('TrxError', TrxErrorSchema); 

export const createTrxError = (values: Record<string, any>) => new TrxErrorModel(values).save();
export const getTrxErrorByUserId = (userId: string) => TrxErrorModel.find({ userId: userId });
export const getAllTrxErrors = () => TrxErrorModel.find();

