// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import dotenvx from "@dotenvx/dotenvx";
dotenvx.config();

const solarModule = buildModule("Solar", (m) => {
  console.log(`owner`, process.env.ADMIN_WALLET_PUBLIC_KEY);
  const apiWallet = m.getParameter("apiWallet", process.env.ADMIN_WALLET_PUBLIC_KEY);
  const solar = m.contract("SOLAR", [apiWallet], {
     //
  });
 
  return { solar };
});

export default solarModule;
