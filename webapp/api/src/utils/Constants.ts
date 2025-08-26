export type ContractMethodType =
  | "purchase"
  | "redeem"
  | "callContractMethodController"
  | "executeContractMethodController"
  | "create"
  | "nftTransfer"
  | "balance"
  | "getFaucetBalance"
  | "faucet"
  | "requestStable"
  | "createAccount";

export const PURCHASE = "purchase";
export const REDEEM = "redeem";
export const CALL_CONTRACT_METHOD_CONTROLLER = "callContractMethodController";
export const EXECUTE_CONTRACT_METHOD_CONTROLLER = "executeContractMethodController";
export const CREATE = "create";
export const NFT_TRANSFER = "nftTransfer";
export const BALANCE = "balance";
export const GET_FAUCET_BALANCE = "getFaucetBalance";
export const FAUCET = "faucet";
export const REQUEST_STABLE = "requestStable";
export const CREATE_ACCOUNT = "createAccount";
