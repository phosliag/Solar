import { useState, useEffect } from 'react';
import { encodeBytes32String, ethers } from 'ethers';
import { createAccount, createAccountSimple } from './api-smart-account.service'; // Simulando tu servicio ApiSmartAccount
import { useApiBridge } from './api-bridge.service'; // Simulando tu servicio ApiBridge
import { SmartAccount } from '../models/company.model';
import { CREATE_ACCOUNT_MULTIPLE, CREATE_INDIVIDUAL_ACCOUNT_RETRY } from '../utils/Constants';
import { handleTransactionError, handleTransactionSuccess } from './trx.service';
export const useBlockchainService = () => {
  // const [provider, setProvider] = useState(null);
  // const [mockBalance, setMockBalance] = useState(0);
  // const [bridgeBalance, setBridgeBalance] = useState(0);

  // useEffect(() => {
  //   const newProvider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
  //    setProvider(newProvider);

  // }, []);

  // Crear una empresa (similar al método createCompany en Angular)
  const createCompany = async (companyName: any) => {
    try {
      const response = await createAccount(companyName);
      const accounts = response?.accounts ?? [];
      const missingAccounts = accounts.filter((acc: { address: string; }) => !acc.address || acc.address.trim() === '');

      console.log('Cuentas creadas:', accounts.length);
      console.log('Cuentas faltantes:', missingAccounts.length);

      for (const acc of missingAccounts) {
        try {
          await createAccountSimple(acc.address, acc.network);
          await handleTransactionSuccess(
            companyName,
            acc.network.toUpperCase(),
            CREATE_INDIVIDUAL_ACCOUNT_RETRY,
            acc
          );
          console.log(`Cuenta ${acc.address} reintentada con éxito.`);
        } catch (retryErr) {
          console.error(`Error al reintentar cuenta ${acc.address}:`, retryErr);
          await handleTransactionError(
            companyName,
            acc.network.toUpperCase(),
            CREATE_INDIVIDUAL_ACCOUNT_RETRY,
            retryErr
          );
        }
      }

      return {
        message: response.message,
        address: accounts[0]?.address || '0x0000000000000000000000000000000000000000',
        createdAt: new Date(),
        accounts,
      };
    } catch (err) {
      console.error('Error al crear cuenta en backend:', err);

      return {
        message: err.message,
        address: '0x' + Math.floor(Math.random() * 1e16).toString(16).padStart(40, '0'),
        createdAt: new Date(),
        accounts: [] as SmartAccount[],
      };
    }
  };

  // Crear un bono (similar al método createBond en Angular)
  const createCompanyBond = async (bondName: string, bondSymbol: string, bondPrice: number, bondWallet: string) => {
    try {
      const response = await useApiBridge.createBond(bondName, bondSymbol, bondPrice, bondWallet);
      return response;
    } catch (err) {
      console.error('Error creando bono:', err);
    }
  };

  // Mint de un bono (similar a mintBond en Angular)
  const mintBond = async (bondAddress: any, wallet: any, creditAmount: any) => {
    try {
      const response = await useApiBridge.mintBond(bondAddress, wallet, creditAmount);
      return response;
    } catch (err) {
      console.error('Error minting bond:', err);
    }
  };

  // Mint de un bono (similar a mintBond en Angular)
  const balance = async (bondAddress: any, accountAddressOwner: any, network: any) => {
    try {
      const response = await useApiBridge.balance(bondAddress, accountAddressOwner, network);
      return response;
    } catch (err) {
      console.error('Error balance bond:', err);
    }
  };

  // Bridge de tokens (similar al método bridge en Angular)
  // const bridgeTokens = async (toPolygon: any, qty: number) => {
  //   if (toPolygon) {
  //     console.log(`Mock bridge out ${qty}`);
  //     setMockBalance(mockBalance - qty);
  //     setBridgeBalance(bridgeBalance + qty);
  //   } else {
  //     console.log(`Mock bridge in ${qty}`);
  //     setMockBalance(mockBalance + qty);
  //     setBridgeBalance(bridgeBalance - qty);
  //   }
  //   return true;
  // };

  // Obtener balance (similar a getBSCBalance en Angular)
  // const getBSCBalance = async (address: any) => {
  //   console.log(`Mock get balance for ${address}`);
  //   return mockBalance;
  // };

  return {
    createCompany,
    createCompanyBond,
    mintBond,
    balance
    // bridgeTokens,
    // getBSCBalance,
    // provider,
  };
};
