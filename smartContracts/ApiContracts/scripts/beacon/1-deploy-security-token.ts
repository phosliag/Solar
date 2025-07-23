// scripts/deploy-implementation.ts
import { ethers } from "hardhat";
import * as fs from "fs";
//? PRIMER PASO: DESPLEGAR LA PRIMERA VERSIÓN DEL CONTRATO
async function main() {
  const SecurityToken = await ethers.getContractFactory("SecurityToken");
  const impl = await SecurityToken.deploy();
  await impl.waitForDeployment();
  const address = await impl.target;

  // Guardar la dirección en un archivo JSON
  const json = { address };
  fs.writeFileSync(
    "security-token-address.json",
    JSON.stringify(json, null, 2)
  );

  console.log("Implementation deployed at:", address);
}

main();