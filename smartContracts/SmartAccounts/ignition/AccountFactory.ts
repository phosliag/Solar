
import { ignition } from "hardhat";
import accountModule from "./modules/AccountFactory";
import fs from "fs";
import path from "path";
import hre from "hardhat";


async function main() {
  const deployment = await ignition.deploy(accountModule);

  const accountFactoryAddress = deployment.account.target;

    console.log(`✅ AccountFactoryAddress contract deployed at: ${accountFactoryAddress}`);
  

    const network = hre.network.name;
    const artifact = await hre.artifacts.readArtifact("AccountFactory");
    // save the bytecode to a file
    const outputPath = path.join(__dirname, "../deployed/accountFactoryIn"+network+"Network.json");
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
    fs.writeFileSync(
      outputPath,
      JSON.stringify({
        contractName: artifact.contractName,
        accountFactoryAddress,
        network
      }, null, 2)
    );
  
    console.log(`Data saved to ${outputPath}`);

}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
// To run this script, use the following command:
// npx hardhat run ignition/AccountFactory.ts --network <NAME_OF_NETWORK> 
//! be attention to select the correct network to deploy the contract 