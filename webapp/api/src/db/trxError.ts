import mongoose from "mongoose";
import { PURCHASE_BOND, REDEEM_BOND, CALL_CONTRACT_METHOD_CONTROLLER, EXECUTE_CONTRACT_METHOD_CONTROLLER, MINT_BOND, BRIDGE, BURN, CREATE_BOND, REQUEST_TRANSFER, BALANCE, GET_FAUCET_BALANCE, FAUCET, REQUEST_STABLE, CREATE_ACCOUNT_MULTIPLE, CREATE_INDIVIDUAL_ACCOUNT_RETRY, ContractMethodType } from "../utils/Constants";

export interface ITrxError {
  _id?: mongoose.Types.ObjectId;
  userId: string;
  timestamp: Date;
  network: string;
  trx_type: ContractMethodType;
  data: string;
}

const TrxErrorSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  network: { type: String, required: true },
  trx_type: {type: String,enum: [ PURCHASE_BOND, REDEEM_BOND, CALL_CONTRACT_METHOD_CONTROLLER, EXECUTE_CONTRACT_METHOD_CONTROLLER, MINT_BOND, BRIDGE, BURN, CREATE_BOND, REQUEST_TRANSFER, BALANCE, GET_FAUCET_BALANCE, FAUCET, REQUEST_STABLE, CREATE_ACCOUNT_MULTIPLE, CREATE_INDIVIDUAL_ACCOUNT_RETRY],required: true,},
  data: { type: String, required: true }
});


// Exportar el modelo
export const TrxErrorModel = mongoose.model<ITrxError>('TrxError', TrxErrorSchema); 

export const createTrxError = (values: Record<string, any>) => new TrxErrorModel(values).save();
export const getTrxErrorByUserId = (userId: string) => TrxErrorModel.find({ userId: userId });
export const getAllTrxErrors = () => TrxErrorModel.find();

