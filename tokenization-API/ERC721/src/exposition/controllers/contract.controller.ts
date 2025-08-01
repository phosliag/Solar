import { ContractTransactionReceipt, ContractTransactionResponse, Overrides, TransactionRequest } from "ethers";
import { Request } from "express";

import { loadAllContracts } from "../../bootstrap/contract.bootstrap";
import { callContractMethod, executeContractMethod, initContractsService, initContractsServiceAdmin } from "../../services/contracts.service";
import AppResult from "../../types/AppResult.type";
import Logger from "../../helpers/logger.helper";
import Config from "../../types/Config.type";

let config: Config;
let logger: Logger;




export async function manageUseMethod(req: Request): Promise<AppResult> {
    const contractName: string = "";
    const contractAddress: string = "" || req.params.address;
    const methodName: string = req.params.method;
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};

    const result: any = await callContractMethod(contractName, contractAddress, methodName, args, options);

    return {
        statusCode: 200,
        body: {
            message: 'Success',
            result
        }
    };
}


export async function callContractMethodController(req: Request): Promise<AppResult> {
  const contractName: string = "";
  const contractAddress: string = "" || req.params.address;
  const methodName: string = req.params.method;
  const args: any[] = req.body.args || [];
  const options: Overrides = req.body.options || {};

  const result: any = await callContractMethod(contractName, contractAddress, methodName, args, options);

  return {
    statusCode: 200,
    body: {
      message: 'Success',
      result
    }
  };
}

export async function executeContractMethodController(req: Request): Promise<AppResult> {
  const contractName: string = "";
  const contractAddress: string = "" || req.params.address;
  const methodName: string = req.params.method;
  const args: any[] = req.body.args || [];
  const options: Overrides = req.body.options || {};


  logger.info(`INITIALIZING SERVICES`); 
  const contracts = await loadAllContracts(config, logger);
 //initContractsService(logger, contracts, config);

  const result: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddress, methodName, args, options, "ALASTRIA");

  return {
    statusCode: 201,
    body: {
      message: result instanceof ContractTransactionReceipt ? 'Transaction executed' : 'Transacion processed',
      result
    }
  }
}
export async function createNFT(req: Request): Promise<AppResult> {
    const contractName: string = "SOLAR";
    const contractAddress: string = config.CONTRACT.ADDRESS_SOLAR;    
    const methodName: string = "mint";
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};

    let transactionHash = null;
    const results: {  transactionHash: string | null; nftId: string | null }[] = [];

    logger.info(`Start CreateBond  in Alastria `);
    const contracts = await loadAllContracts(config, logger);
    initContractsService(logger, contracts, config, "ALASTRIA");

    const metadata: string = args[0]; 
    const newArgs: any[] = [config.NETWORK.ADMIN_ACCOUNTS_ACCOUNT, metadata];
    const resultAlastria: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddress, methodName, newArgs, options, "ALASTRIA");

    if (resultAlastria && 'logs' in resultAlastria && resultAlastria.logs.length > 0) {
        const address = resultAlastria.logs[0].address;
        transactionHash = resultAlastria.hash; 

        let nftId = null;
        if (resultAlastria.logs[0].topics.length >= 4) {
            // El topic[3] contiene el ID del NFT mintiado
            nftId = BigInt(resultAlastria.logs[0].topics[3]).toString(); // lo convierte a decimal
        }
        // coger el id del nft --> esta dentro del topic log 4
        results.push({ transactionHash, nftId });
    } else {     
        results.push({ transactionHash: resultAlastria?.hash ?? null, nftId: null });
    }

    return {
        statusCode: 201,
        body: {
          
            nft: results,
            message: resultAlastria   
        },
    };
}

export async function NFTbalance(req: Request): Promise<AppResult> {

    const contractName: string = "SOLAR";
    const methodName: string = "tokensOfOwner";
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};
      
    const ownerAddress: string = args[0];
    const contractAddress: string = config.CONTRACT.ADDRESS_SOLAR;   

    const results: { network: string; address: string | null }[] = [];

    logger.info(`Start GetBalance`); 

    const contracts = await loadAllContracts(config, logger);

    const newArgs: any[] = [ownerAddress];

    initContractsService(logger, contracts, config, "ALASTRIA");
    const resultAlastria: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddress, methodName, newArgs, options, "ALASTRIA");

    return {
        statusCode: 201,
        body: {
            message: resultAlastria            
        }
    }
}

export async function returnNFT(req: Request): Promise<AppResult> {
    const contractName: string = "Account";
    const methodName: string = "transferERC721";
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};

    const contractAddress: string = config.CONTRACT.ADDRESS_SOLAR;
    const accountFrom: string = args[0];
    const nftID: string = args[1];

    const results: { network: string; address: string | null }[] = [];
    logger.info(` transferNFT`);
    const contracts = await loadAllContracts(config, logger);

    const newArgs: any[] = [contractAddress, config.NETWORK.ADMIN_ACCOUNTS_ACCOUNT, nftID];

    initContractsService(logger, contracts, config, "ALASTRIA");
    const resultAlastria: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, accountFrom, methodName, newArgs, options, "ALASTRIA");

    const transactionHash = resultAlastria && 'hash' in resultAlastria ? resultAlastria.hash : 'N/A';


    return {
        statusCode: 201,
        body: {
            message: transactionHash
        }
    }
}

export async function transferNFT(req: Request): Promise<AppResult> {   
    const contractName: string = "SOLAR";    
    const methodName: string = "transferFrom";
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};

    const contractAddress: string = config.CONTRACT.ADDRESS_SOLAR; 
    const accountTo: string = args[0];
    const nftID: string = args[1];

    const results: { network: string; address: string | null }[] = [];     
    logger.info(` transferNFT`); 
    const contracts = await loadAllContracts(config, logger);

    const newArgs: any[] = [config.NETWORK.ADMIN_ACCOUNTS_ACCOUNT ,accountTo, nftID];

    initContractsService(logger, contracts, config, "ALASTRIA" );
    const resultAlastria: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddress, methodName, newArgs, options, "ALASTRIA");
       
    const transactionHash = resultAlastria && 'hash' in resultAlastria ? resultAlastria.hash : 'N/A';


    return {
        statusCode: 201,
        body: {
            message: transactionHash             
        }
    }
}


export async function requestTransfer(req: Request): Promise<AppResult> {
 
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};
    const contractAddressVault: string = config.CONTRACT.ADDRESS_VAULT;

    const toAddress: string = args[0];  // token  addreess to
    const fromAddress: string = args[1];// token  from to
    const amount: string = args[2];  // amount
    const network: string = args[3];  // network 
    const contractAddress: string = args[4]; // la direccion del owner q se genera en createAccount
  

    const contractName: string = "Account";
    const methodName: string = "transferERC20";   

    const burnArgs: any[] = [contractAddress,toAddress, amount];

    logger.info(`Start  ---      Transfer`);
    const contracts = await loadAllContracts(config, logger);
    initContractsService(logger, contracts, config, network);

    const resultBurn: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, fromAddress, methodName, burnArgs, options, network);
    if (resultBurn && "status" in resultBurn && resultBurn.status === 1) {

        const transactionHash = resultBurn && 'hash' in resultBurn ? resultBurn.hash : 'N/A';
        return {
            statusCode: 201,
            body: {
                message: transactionHash               
            }
        }
    } else {
        return {
            statusCode: 500,
            body: {
                message: "burn error"
            }
        }
    }
}


export async function faucet(req: Request): Promise<AppResult> {
    const contractName: string = "StableCoin";
    const methodName: string = "mint";
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};

    // este es el caller de la function
    const toAddress: string = args[0];
    const amount: number = args[1];

    // SIEMPRE EN ALASTRIA 
    const results: { network: string; address: string | null }[] = [];

    logger.info(`Faucet `);

    const contracts = await loadAllContracts(config, logger);

    const newArgs: any[] = [toAddress, amount];

    initContractsService(logger, contracts, config, "ALASTRIA");

    const contractAddress = config.CONTRACT.STABLECOIN_ALASTRIA;

    const resultAlastria: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddress, methodName, newArgs, options, "ALASTRIA");

    return {
        statusCode: 201,
        body: {
            message: resultAlastria,
            resultAlastria
        }
    }
}

export async function getFaucetBalance(req: Request): Promise<AppResult> {
    const contractName: string = "StableCoin";
    const methodName: string = "balanceOf";
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};

    // este es el caller de la function
    const toAddress: string = args[0];

    // SIEMPRE EN ALASTRIA 
    const results: { network: string; address: string | null }[] = [];

    logger.info(`Faucet `);

    const contracts = await loadAllContracts(config, logger);

    const newArgs: any[] = [toAddress];

    initContractsService(logger, contracts, config, "ALASTRIA");
    const contractAddress = config.CONTRACT.STABLECOIN_ALASTRIA;

    const resultAlastria: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddress, methodName, newArgs, options, "ALASTRIA");
    
    return {
        statusCode: 201,
        body: {
            message: resultAlastria            
        }
    }
}

export async function requestStable(req: Request): Promise<AppResult> {

    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};
    const contractAddressVault: string = config.CONTRACT.ADDRESS_VAULT;

    const toAddress: string = args[0];  // to
    const fromAddress: string = args[1];// from 
    const amount: string = args[2];  // amount

    const network: string = "ALASTRIA"; // red 
    const contractAddress: string =  config.CONTRACT.STABLECOIN_ALASTRIA; 
    

    const contractName: string = "Account";
    const methodName: string = "transferERC20";

    const burnArgs: any[] = [contractAddress, toAddress, amount];

    logger.info(`Start  ---      Transfer`);
    const contracts = await loadAllContracts(config, logger);
    initContractsService(logger, contracts, config, network);

    const resultBurn: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, fromAddress, methodName, burnArgs, options, "ALASTRIA");
    if (resultBurn && "status" in resultBurn && resultBurn.status === 1) {

        const transactionHash = resultBurn && 'hash' in resultBurn ? resultBurn.hash : 'N/A';
        return {
            statusCode: 201,
            body: {
                message: transactionHash
            }
        }
    } else {
        return {
            statusCode: 500,
            body: {
                message: "burn error"
            }
        }
    }

}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default function initContractController(_logger: Logger, _config: Config) {
  logger = _logger;
  config = _config;
}