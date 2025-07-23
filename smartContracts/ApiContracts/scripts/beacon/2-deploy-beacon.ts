// scripts/deploy-beacon.ts
import { ethers } from "hardhat";
import * as fs from "fs";
import securityToken from "../../security-token-address.json";
import dotenvx from "@dotenvx/dotenvx";
dotenvx.config();
//? SEGUNDO PASO: DESPLEGAR UN BEACON - SOLO SE DESPLIEGA UNA VEZ
async function main() {
  const implAddress = securityToken.address // Dirección obtenida del paso 1
  const Beacon = await ethers.getContractFactory("UpgradeableBeacon");
  const ownerAddress = process.env.API_WALLET_PUBLIC_KEY;
  if (!ownerAddress) {
    throw new Error("API_WALLET_PUBLIC_KEY is not defined in environment variables.");
  }
  const beacon = await Beacon.deploy(implAddress, ownerAddress);
  await beacon.waitForDeployment();
  const address = await beacon.getAddress();

  // Guardar la dirección en un archivo JSON
  const json = { address };
  fs.writeFileSync(
    "upgradeeable-beacon-address.json",
    JSON.stringify(json, null, 2)
  );

  console.log("Beacon deployed at:", address);
}

main();