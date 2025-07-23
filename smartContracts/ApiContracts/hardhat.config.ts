import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenvx from "@dotenvx/dotenvx";
// import "@nomicfoundation/hardhat-ethers";

dotenvx.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10,
      },
      evmVersion: "byzantium", // alastria
    },
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
  },
  networks: {
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
      accounts: process.env.API_WALLET_PRIV_KEY ? [process.env.API_WALLET_PRIV_KEY] : [],
      gasPrice: 400000000000,
      timeout: 120000, 
    },
    amoy: {
      url: "https://polygon-amoy.drpc.org",
      accounts: process.env.API_WALLET_PRIV_KEY ? [process.env.API_WALLET_PRIV_KEY] : [],
      gasPrice: 400000000000,
      timeout: 300000, 
    },
    alastria: {
      url: "http://108.142.237.13:8545",
      accounts: process.env.API_WALLET_PRIV_KEY ? [process.env.API_WALLET_PRIV_KEY] : [],
 
    },
  },
};

export default config;
