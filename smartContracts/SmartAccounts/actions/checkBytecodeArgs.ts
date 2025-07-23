// scripts/checkBytecodeArgs.ts

import hre from "hardhat";
import { AbiCoder, keccak256, getBytes, hexlify } from "ethers";
import * as path from "path";
import * as fs from "fs";
import dotenvx from "@dotenvx/dotenvx";
dotenvx.config();

// Configurable contract name and args
const CONTRACT_NAME = "Account";
const CONSTRUCTOR_ARGS = [
    process.env.API_WALLET_PUBLIC_KEY || process.env.API_WALLET_PUBLIC_KEY
];

async function main() {
    const artifact = await hre.artifacts.readArtifact(CONTRACT_NAME);
    const abi = artifact.abi;
    const bytecode = artifact.bytecode;

    const constructorInputs = abi.find((entry) => entry.type === "constructor")?.inputs || [];

    console.log(`🔍 Analyzing contract: ${CONTRACT_NAME}`);
    console.log(`➡️ Constructor with ${constructorInputs.length} arguments.`);

    if (constructorInputs.length === 0) {
        console.log("✅ The constructor has no arguments. You don't need to concatenate anything.");
        return;
    }

    const abiCoder = new AbiCoder();
    const encodedArgs: string = abiCoder.encode(
        constructorInputs.map((i: { type: string }) => i.type),
        CONSTRUCTOR_ARGS as string[]
    );

    const fullBytecode = bytecode + encodedArgs.slice(2); // remove '0x'

    // Read deployed bytecode if it exists (optional)
    const deployedJsonPath = path.join(__dirname, "../deployed/accountBytecode.json");
    if (!fs.existsSync(deployedJsonPath)) {
        console.log("⚠️ 'accountBytecode.json' not found. Only local info will be shown.");
    } else {
        const deployed = JSON.parse(fs.readFileSync(deployedJsonPath, "utf8"));
        const deployedBytecode = deployed.creationBytecode;

        if (deployedBytecode.toLowerCase() === fullBytecode.toLowerCase()) {
            console.log("✅ The bytecode in 'accountDeployment.json' already has the arguments embedded.");
        } else {
            console.log("❌ The bytecode in 'accountDeployment.json' does NOT have the arguments embedded.");
            console.log("💡 Use this bytecode with args:");
            console.log(fullBytecode);
        }
    }
}

main().catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
});
// To run this script from the console, use the following command:
// npx hardhat run .\actions\checkBytecodeArgs.ts