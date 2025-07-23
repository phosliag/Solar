// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const accountFactoryModule = buildModule("AccountFactory", (m) => {

  const account = m.contract("AccountFactory", [], {
     //
  });
 
  return { account };
});

export default accountFactoryModule;
