

const dotenvx = require("@dotenvx/dotenvx");
const ethers = require("ethers");

dotenvx.config();

 async function checkNodeStatus(provider: any, networkName: string): Promise<boolean> {
      try {
        await provider.getBlockNumber();
        console.log(`The node for ${networkName} is working correctly.`);
        return true as boolean;
      } catch (error) {
        console.error(`The node for ${networkName} has issues:`, (error as Error).message);
        return false as boolean;
      }

    }


async function main() {
    const  adminAccountAddress  = process.env.ADMIN_WALLET_PUBLIC_KEY;
    const  adminApiAddress  = process.env.API_WALLET_PUBLIC_KEY;
    const NETWORK_AMOY = process.env.NETWORK_AMOY;
    const NETWORK_BSC = process.env.NETWORK_BSC;

   

    const bscProvider = new ethers.JsonRpcProvider(NETWORK_BSC);
    const amoyProvider = new ethers.JsonRpcProvider(NETWORK_AMOY);

    const bscOk = await checkNodeStatus(bscProvider, "BSC Testnet");
    const amoyOk = await checkNodeStatus(amoyProvider, "Amoy Network");

    if (!bscOk || !amoyOk) {
        console.error("One or both nodes are not working correctly. Exiting...");
        return;
    }


    console.log(`NETWORK_AMOY, NETWORK_BSC`, NETWORK_AMOY, NETWORK_BSC);
    try {
      console.log(`Comprobando balances de Admin wallet...`);
      const bscProvider = new ethers.JsonRpcProvider(NETWORK_BSC);
      const amoyProvider = new ethers.JsonRpcProvider(NETWORK_AMOY);
      let bscBalance = await bscProvider.getBalance(adminAccountAddress);
      await new Promise(resolve => setTimeout(resolve, 2000));
      let amoyBalance = await amoyProvider.getBalance(adminAccountAddress);
      console.log(`balances in bsc testnet and amoy network of Admin Account: ${adminAccountAddress}`);
      console.log(`bsc testnet balance: ${ethers.formatEther(bscBalance)}`);
      console.log(`amoy balance: ${ethers.formatEther(amoyBalance)}`);
      console.log(`\n`);
      console.log(`Comprobando balances de API account...`);
      bscBalance = await bscProvider.getBalance(adminApiAddress);
      await new Promise(resolve => setTimeout(resolve, 2000));
      amoyBalance = await amoyProvider.getBalance(adminApiAddress);
      console.log(`balances in bsc testnet and amoy network of API wallet: ${adminApiAddress}`);
      console.log(`bsc testnet balance: ${ethers.formatEther(bscBalance)}`);
      console.log(`amoy balance: ${ethers.formatEther(amoyBalance)}`);

    } catch (error) {
        console.error("An error occurred:", error);
    }


}

main().catch((error) => {
console.error(error);
process.exitCode = 1;
});

// npx hardhat run .\actions\getBalances.ts