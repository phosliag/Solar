// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import dotenvx from "@dotenvx/dotenvx";
dotenvx.config();

const accountModule = buildModule("Account", (m) => {
  console.log(`owner`, process.env.API_WALLET_PUBLIC_KEY);
  const owner = m.getParameter("owner", process.env.API_WALLET_PUBLIC_KEY);
  const account = m.contract("Account", [owner], {
     //
  });
 
  return { account };
});

export default accountModule;
