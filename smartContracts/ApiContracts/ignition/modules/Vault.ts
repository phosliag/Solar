// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const VaultModule = buildModule("Vault", (m) => {

  const vault = m.contract("RepresentativeBondTokenFactory", [], {
     //
  });
 
  return { vault };
});

export default VaultModule;
