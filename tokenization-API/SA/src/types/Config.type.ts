export default interface Config {
  SERVICE_NAME: string;
  PORT: number;
  CONTRACTS_FILE: string;
  BYTECODE: string;
  CONTRACT: { NAME: string, ADDRESS: string }
  NETWORK: { ALASTRIA: string; POLYGON: string; ADMIN_ACCOUNTS_PRIV_KEY: string; API_WALLET_PRIV_KEY: string };
  LOG_LEVELS: { LOG_LEVEL_SYSTEM: string; LOG_LEVEL_FILE: string };
}