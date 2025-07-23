// src/services/apiBridgeService.ts
import { environment } from '../enviroments/environment'; // ajusta la ruta según tu estructura
import { CreateBondResponse } from '../models/company.model';

const baseUrl = environment.HOST_BRIDGE;
const apiKey = environment.PRIVATE_API_KEY_SMART_ACCOUNT;

const defaultHeaders = {
  'Content-Type': 'application/json',
  'X-API-Key': apiKey,
};

async function post<T = any>(endpoint: string, body: object): Promise<T> {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({ args: Object.values(body) }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}

export const useApiBridge = {
  async createBond(name: string, symbol: string, price: number, wallet: string): Promise<CreateBondResponse> {
    return await post('/createBond', { name, symbol, price, wallet });
  },

  async mintBond(bondAddress: string, toWallet: string, amount: number): Promise<CreateBondResponse> {
    return await post('/mintBond', { bondAddress, toWallet, amount });
  },

  async balance(bondAddress: string, accountAddressOwner: string, network: string): Promise<CreateBondResponse> {
    return await post('/balance', { bondAddress, accountAddressOwner, network });
  },

  async bridge(
    bondAddress: string,
    wallet: string,
    creditAmount: number,
    bondName: string,
    bondSymbol: string,
    bondPrice: number
  ): Promise<CreateBondResponse> {
    return await post('/bridge', {
      bondAddress,
      wallet,
      creditAmount,
      bondName,
      bondSymbol,
      bondPrice
    });
  },

  async requestTransfer(
    toAddress: string,
    fromAddress: string,
    amount: number,
    network: string,
    contractAddress: string
  ): Promise<CreateBondResponse> {
    return await post('/requestTransfer', {
      toAddress,
      fromAddress,
      amount,
      network,
      contractAddress
    });
  },
  
  async burn(
    originNetworkContract: string,
    amount: number,
    network: string,
    ownerWallet: string,
    contractAlastriaAddress: string
  ): Promise<CreateBondResponse> {
    return await post('/burn', {
      originNetworkContract,
      amount,
      network,
      ownerWallet,
      contractAlastriaAddress
    });
  },

  async faucetBalance( accountAddressOwner: string): Promise<CreateBondResponse> {
    return await post('/faucetBalance', { accountAddressOwner });
  },

  async faucet( accountAddressOwner: string, amount: number): Promise<CreateBondResponse> {
    return await post('/faucet', { accountAddressOwner, amount });
  },

  async requestStable(
    toAddress: string,
    fromAddress: string,
    amount: number
  ): Promise<CreateBondResponse> {
    return await post('/requestStable', {
      toAddress,
      fromAddress,
      amount
    });
  },

};
