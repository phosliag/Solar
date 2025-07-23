// scripts/factory-createBond.ts
import { ethers } from "hardhat";
import factoryAdddress from "../../beacon-factory-address.json"; 
import dotenvx from "@dotenvx/dotenvx";
//? CUARTO PASO:  repetir este paso cuantas veces se quiera. Cada bono tendrá su propia dirección
dotenvx.config();
async function main() {
  const factory = await ethers.getContractAt("SecurityBondFactory", factoryAdddress.address); 
   const adminAddress = process.env.API_WALLET_PUBLIC_KEY;
  if (!adminAddress) {
    throw new Error("API_WALLET_PUBLIC_KEY is not defined in environment variables.");
  }
  const iface = new ethers.Interface([
    "function initialize(string,string,uint256,string,string,string,address)"
  ]);

  const initData = iface.encodeFunctionData("initialize", [
    "MyBond",           // name
    "BND",              // symbol
    ethers.parseUnits("1000000", 18), // cap
    "ES1234567890",     // ISIN
    "bond",             // instrumentType
    "ES",               // jurisdiction
    adminAddress   // admin
  ]);

  const tx = await factory.createBond(initData, adminAddress);
  const receipt = await tx.wait();
  if (receipt && receipt.logs && receipt.logs[0]) {
    console.log("Bond deployed via factory:", receipt.logs[0].address);
  } else {
    console.error("Transaction receipt or logs not found.");
  }
}

main();
