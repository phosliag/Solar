import { ethers } from 'ethers';
// import { environment } from "../enviroments/environment";

const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');

//https://data-seed-prebsc-1-s1.bnbchain.org:8545/
//https://polygon-amoy.drpc.org/

//Example
// const baseUrl = environment.HOST_SMART_ACCOUNT;
// const apiKey = environment.PRIVATE_API_KEY_SMART_ACCOUNT;

// const headers = {
//   "Content-Type": "application/json",
//   "x-api-key": apiKey,
// };

export const getBscBalance = async (address: string): Promise<string | null> => {
    console.log("Call getBscBalance() ::: address: " + address);
    try {
        const balance = await provider.getBalance(address);
        const balanceInEth = ethers.formatEther(balance);
        console.log(`Balance for address ${address}: ${balanceInEth}`);
        return balanceInEth;
    } catch (error) {
        console.error('Error in getBscBalance:', error);
        return null;
    }
};

export const getTokenList = async (walletAddress: any, tokenAddresses: any[]) => {
    console.log("Call getTokenList() ::: Wallet Address: " + walletAddress + " Token Address: " + tokenAddresses);
    const tokenList = [];

    for (const address of tokenAddresses) {
        const tokenABI = [
            "function balanceOf(address owner) view returns (uint256)",
            "function symbol() view returns (string)"
        ];
        const tokenContract = new ethers.Contract(address, tokenABI, provider);
        const balance = await tokenContract.balanceOf(walletAddress);
        const symbol = await tokenContract.symbol();
        tokenList.push({ symbol, balance: ethers.formatUnits(balance, 18) });
    }

    return tokenList;
};

// EXAMPLE
// export async function createAccountSimple(salt: string, network: string): Promise<any> {
//   const url = `${baseUrl}/createIndividualAccountRetry`;

//   const response = await fetch(url, {
//     method: "POST",
//     headers: headers,
//     body: JSON.stringify({ salt, network }),
//   });

//   if (!response.ok) {
//     throw new Error(`HTTP error! Status: ${response.status}`);
//   }

//   return await response.json();
// };