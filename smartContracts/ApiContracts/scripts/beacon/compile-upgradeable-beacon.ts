// scripts/compile-upgradeable-beacon.ts
import { ethers } from "hardhat";

async function main() {
  const Beacon = await ethers.getContractFactory("UpgradeableBeacon");
  console.log("Beacon factory loaded:", Beacon);
}

main().catch(console.error);
