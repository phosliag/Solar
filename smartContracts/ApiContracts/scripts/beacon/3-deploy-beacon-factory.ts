// scripts/deploy-factory.ts
import { ethers } from "hardhat";
import * as fs from "fs";
import beaconAddress from "../../upgradeeable-beacon-address.json"; 
//? TERCER PASO: DESPLEGAR EL FACTORY CON EL BEACON- SOLO SE DESPLIEGA UNA VEZ Y SERÁ USADO PARA DESPLEGAR LOS BONDS
async function main() {
  const Factory = await ethers.getContractFactory("SecurityBondFactory");
  const factory = await Factory.deploy(beaconAddress.address);
  await factory.waitForDeployment();
  const address = await factory.getAddress();

  // Guardar la dirección en un archivo JSON
  const json = { address };
  fs.writeFileSync(
    "beacon-factory-address.json",
    JSON.stringify(json, null, 2)
  );

  console.log("Factory deployed at:", address);
}

main();