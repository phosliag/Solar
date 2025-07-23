
import RepresentativeBondTokenFactoryModule from "./modules/RepresentativeBondTokenFactory";   // ajusta la ruta

import fs from "fs";
import path from "path";
import hre from "hardhat";
async function main() {
  console.log(`select network: ${hre.network.name}…`);


  const { representativeBondTokenFactory } = await hre.ignition.deploy(RepresentativeBondTokenFactoryModule);
  console.log("RepresentativeBondTokenFactory deploy with address:", await representativeBondTokenFactory.target);

  //storage
  const artifact = await hre.artifacts.readArtifact("RepresentativeBondTokenFactory");
    const outputPath = path.join(__dirname, "../deployed/RepresentativeBondTokenFactory.json");
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
    fs.writeFileSync(
      outputPath,
      JSON.stringify({
        contractName: artifact.contractName,
        contractAddress: await representativeBondTokenFactory.target,
        network: hre.network.name
      }, null, 2)
    );
  
    console.log(`Data saved bondFactory`);

}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// npx hardhat run ignition/amoy.ts --network amoy