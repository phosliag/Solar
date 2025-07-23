export default interface Config {
  SERVICE_NAME: string;
  PORT: number;
  CONTRACTS_FILE: string;
  CONTRACT: { ADDRESS: string, ADDRESS_BOND: string, ADDRESS_VAULT: string, ADDRESS_REPRESENTATIVE_BOND_TOKEN:string, STABLECOIN_ALASTRIA:string,  }
  NETWORK: { ALASTRIA: string; POLYGON: string; ADMIN_ACCOUNTS_PRIV_KEY: string; API_WALLET_PRIV_KEY: string, API_WALLET_PUBLIC: string };
  LOG_LEVELS: { LOG_LEVEL_SYSTEM: string; LOG_LEVEL_FILE: string };
}