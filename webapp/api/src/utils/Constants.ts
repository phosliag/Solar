export type ContractMethodType =
  | "purchaseBond"
  | "redeemBond"
  | "callContractMethodController"
  | "executeContractMethodController"
  | "mintBond"
  | "bridge"
  | "burn"
  | "createBond"
  | "requestTransfer"
  | "balance"
  | "getFaucetBalance"
  | "faucet"
  | "requestStable"
  | "createAccountMultiple"
  | "createIndividualAccountRetry";

export const PURCHASE_BOND = "purchaseBond";
export const REDEEM_BOND = "redeemBond";
export const CALL_CONTRACT_METHOD_CONTROLLER = "callContractMethodController";
export const EXECUTE_CONTRACT_METHOD_CONTROLLER = "executeContractMethodController";
export const MINT_BOND = "mintBond";
export const BRIDGE = "bridge";
export const BURN = "burn";
export const CREATE_BOND = "createBond";
export const REQUEST_TRANSFER = "requestTransfer";
export const BALANCE = "balance";
export const GET_FAUCET_BALANCE = "getFaucetBalance";
export const FAUCET = "faucet";
export const REQUEST_STABLE = "requestStable";
export const CREATE_ACCOUNT_MULTIPLE = "createAccountMultiple";
export const CREATE_INDIVIDUAL_ACCOUNT_RETRY = "createIndividualAccountRetry";
