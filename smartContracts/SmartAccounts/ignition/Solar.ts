// scripts/deploy.ts
// deploy para conseguir el bytecode de Solar.sol
import { ignition, network } from "hardhat";
import fs from "fs";
import path from "path";
import solarModule from "./modules/Solar";
import { AbiCoder } from "ethers";
import dotenvx from "@dotenvx/dotenvx";
import hre from "hardhat";
dotenvx.config();

async function main() {

  const deployment = await ignition.deploy(solarModule);
  const deployedAddress = deployment.solar.target;
  console.log(`✅ Solar deployed at: ${deployedAddress}`);


  const artifact = await hre.artifacts.readArtifact("SOLAR");

  const abiCoder = new AbiCoder();

const constructorArgs = abiCoder.encode(["address"], [process.env.ADMIN_WALLET_PUBLIC_KEY]);

  // Creation bytecode 
  const creationBytecode = artifact.bytecode + constructorArgs.slice(2);

  // output
  const outputPath = path.join(__dirname, "../deployed/solarcontract.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // 
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        contractName: artifact.contractName,
        network: network.name,
        solarAddress: deployedAddress,
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
// npx hardhat run ignition/Solar.ts --network <NAME_OF_NETWORK> 
