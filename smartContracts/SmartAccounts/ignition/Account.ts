// scripts/deploy.ts

import { ignition, network } from "hardhat";
import fs from "fs";
import path from "path";
import accountModule from "./modules/Account";
import { AbiCoder } from "ethers";
import dotenvx from "@dotenvx/dotenvx";
import hre from "hardhat";
dotenvx.config();

async function main() {

  const deployment = await ignition.deploy(accountModule);
  const deployedAddress = deployment.account.target;
  console.log(`✅ Account deployed at: ${deployedAddress}`);


  const artifact = await hre.artifacts.readArtifact("Account");

  const abiCoder = new AbiCoder();

const constructorArgs = abiCoder.encode(["address"], [process.env.API_WALLET_PUBLIC_KEY]);

  // Creation bytecode 
  const creationBytecode = artifact.bytecode + constructorArgs.slice(2);

  // output
  const outputPath = path.join(__dirname, "../deployed/accountBytecode.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // 
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        contractName: artifact.contractName,
        network: network.name,
        accountAddress: deployedAddress,
        creationBytecode,
      },
      null,
      2
    )
  );

  console.log(`📝 Deployment info written to: ${outputPath}`);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
// npx hardhat run ignition/Account.ts --network <NAME_OF_NETWORK> 