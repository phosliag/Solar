// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const RepresentativeBondTokenFactoryModule = buildModule("RepresentativeBondTokenFactory", (m) => {

  const representativeBondTokenFactory = m.contract("RepresentativeBondTokenFactory", [], {
     //
  });
 
  return { representativeBondTokenFactory };
});

export default RepresentativeBondTokenFactoryModule;
