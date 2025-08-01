import { readYamlFile } from "../helpers/yaml.helper";
import Config from "../types/Config.type";

export function initConfig(configPath: string): Config {
  // read from file
  const config: Config = readYamlFile(configPath || "config.yaml");

  const envPort: string | undefined = process.env.PORT;

  // update app
  config.SERVICE_NAME = process.env.SERVICE_NAME || config.SERVICE_NAME || 'ExpressJS API';
  config.PORT = envPort !== undefined ? parseInt(envPort) : config.PORT || 3000;
  config.CONTRACTS_FILE = process.env.CONTRACTS_FILE || config.CONTRACTS_FILE || './contracts.json';
  config.CONTRACT = config.CONTRACT || {};  
  config.CONTRACT.ADDRESS = process.env.CONTRACT_ADDRESS_SOLAR_NFT || '';
    config.CONTRACT.ADDRESS_SOLAR = process.env.CONTRACT_ADDRESS_SOLAR_NFT  || '';
 // config.CONTRACT.ADDRESS_VAULT = process.env.CONTRACT_ADDRESS_VAULT  ||  '';
 // config.CONTRACT.ADDRESS_REPRESENTATIVE_BOND_TOKEN = process.env.CONTRACT_ADDRESS_REPRESENTATIVE_BOND_TOKEN || '';
  config.CONTRACT.STABLECOIN_ALASTRIA = process.env.STABLECOIN_ALASTRIA || '';

  config.NETWORK = config.NETWORK || {};
  config.NETWORK.ALASTRIA = process.env.ALASTRIA_NETWORK_URL || '';
  config.NETWORK.POLYGON = process.env.AMOY_NETWORK_URL ||  '';
  config.NETWORK.ADMIN_ACCOUNTS_PRIV_KEY = process.env.ADMIN_ACCOUNTS_PRIV_KEY || '';
  config.NETWORK.ADMIN_ACCOUNTS_ACCOUNT = process.env.ADMIN_ACCOUNTS_PUBLIC_KEY || '';
  config.NETWORK.API_WALLET_PRIV_KEY = process.env.API_WALLET_PRIV_KEY || '';
  config.NETWORK.API_WALLET_PUBLIC = process.env.API_WALLET_PUBLIC_KEY || '';
 

  config.LOG_LEVELS.LOG_LEVEL_SYSTEM = process.env.LOG_LEVEL_SYSTEM || config.LOG_LEVELS.LOG_LEVEL_SYSTEM || "debug";
  config.LOG_LEVELS.LOG_LEVEL_FILE = process.env.LOG_LEVEL_FILE || config.LOG_LEVELS.LOG_LEVEL_FILE || "info";
  return config;
}
