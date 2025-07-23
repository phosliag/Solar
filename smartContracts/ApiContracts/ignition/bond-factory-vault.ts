
import BondFactoryModule from "./modules/BondFactory";   // ajusta la ruta
import VaultModule       from "./modules/Vault";         // ajusta la ruta
import fs from "fs";
import path from "path";
import hre from "hardhat";
async function main() {
  console.log(`select network: ${hre.network.name}…`);


  const { bondFactory } = await hre.ignition.deploy(BondFactoryModule);
  console.log("BondFactory deploy with address:", await bondFactory.target);

  //storage the address of the bondFactory in a file
  const artifactBond = await hre.artifacts.readArtifact("BondFactory");
  const artifactVault = await hre.artifacts.readArtifact("Vault");

    const outputPath = path.join(__dirname, "../deployed/bondFactory.json");
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  
    fs.writeFileSync(
      outputPath,
      JSON.stringify({
        contractName: artifactBond.contractName,
        contractAddress: await bondFactory.target,
        network: hre.network.name
      }, null, 2)
    );
  
    console.log(`Data saved bondFactory`);
    console.log(`... start deploy vault`);


  const { vault } = await hre.ignition.deploy(VaultModule);
  console.log("Vault deploy with address:",     await vault.target);

  const outputPath2 = path.join(__dirname, "../deployed/vault.json");
  fs.mkdirSync(path.dirname(outputPath2), { recursive: true });

  fs.writeFileSync(
    outputPath2,
    JSON.stringify({
      contractName: artifactVault.contractName,
      contractAddress: await vault.target,
      network: hre.network.name
    }, null, 2)
  );

  console.log(`Data saved Vault`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
// npx hardhat run ignition/bond-factory-vault.ts --network <network_name>