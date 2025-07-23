import * as dotenv from 'dotenv';

dotenv.config();

export const environment = {
  production: process.env.PRODUCTION === 'true' ? true : false,
  BSC_RPC_URL: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
  TOKEN_CONTRACT_BSC: process.env.TOKEN_CONTRACT_BSC || '0xTOKEN_CONTRACT_BSC',
  BRIDGE_VAULT: process.env.BRIDGE_VAULT || '0xBRIDGE_VAULT',
  TOKEN_CONTRACT_POLYGON: process.env.TOKEN_CONTRACT_POLYGON || '0xTOKEN_CONTRACT_POLYGON',
  HOST_SMART_ACCOUNT: process.env.HOST_SMART_ACCOUNT || "http://localhost:4000",
  HOST_BRIDGE: process.env.HOST_BRIDGE || "http://localhost:3000",
  // HOST_SMART_ACCOUNT: "http://smart-acc.westeurope.azurecontainer.io:4000",
  // HOST_BRIDGE: "http://erc20.westeurope.azurecontainer.io:3000" ,
  PRIVATE_API_KEY_SMART_ACCOUNT: process.env.PRIVATE_API_KEY_SMART_ACCOUNT || "574c8880-3456-11ef-9a9c-0800200c9a66",
  PRIVATE_API_KEY_BRIDGE: process.env.PRIVATE_API_KEY_BRIDGE || "574c8880-3456-11ef-9a9c-0800200c9a66",
};
