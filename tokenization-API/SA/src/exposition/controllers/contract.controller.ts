import { ContractTransactionReceipt, ContractTransactionResponse, Overrides, TransactionRequest } from "ethers";
import { encodeBytes32String } from "ethers";
import { Request } from "express";

import { loadAllContracts } from "../../bootstrap/contract.bootstrap";
import { callContractMethod, executeContractMethod, initContractsService } from "../../services/contracts.service";
import AppResult from "../../types/AppResult.type";
import Logger from "../../helpers/logger.helper";
import Config from "../../types/Config.type";

let config: Config;
let logger: Logger;




export async function manageUseMethod(req: Request): Promise<AppResult> {
    const contractName: string = config.CONTRACT.NAME;
    const contractAddress: string = config.CONTRACT.ADDRESS || req.params.address;
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
  const contractName: string = config.CONTRACT.NAME;
  const contractAddress: string = config.CONTRACT.ADDRESS || req.params.address;
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
  const contractName: string = config.CONTRACT.NAME;
  const contractAddress: string = config.CONTRACT.ADDRESS || req.params.address;
  const methodName: string = req.params.method;
  const args: any[] = req.body.args || [];
  const options: Overrides = req.body.options || {};


  logger.info(`INITIALIZING SERVICES executeContractMethodController`); 
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


export async function createAccountMultiple(req: Request): Promise<AppResult> {   

    const contractName: string = "AccountFactory";
    const contractAddress: string = config.CONTRACT.ADDRESS || req.params.address;
    const methodName: string = req.params.method;
    const args: any[] = req.body.args || [];
    const options: Overrides = req.body.options || {};

    let address = null;
    let transactionHash = null;
    let timestamp = null;

    const results: {
        network: string;
        address: string | null;
        transactionHash: string | null;        
    }[] = [];

    logger.info(`CREATING IN alastria`);
    const contracts = await loadAllContracts(config, logger);

    const bytecode: string = config.BYTECODE;


    const salt: string = args[0] || "DEFAULT";  
    const encoded = encodeBytes32String(salt);

    const newArgs: any[] = [encoded, bytecode];
    let network = "ALASTRIA";
    initContractsService(logger, contracts, config, "ALASTRIA" );
    const resultAlastria: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddress, methodName, newArgs, options, network);
    if (resultAlastria && 'logs' in resultAlastria && resultAlastria.logs.length > 0) {
        address = resultAlastria.logs[0].address;
        transactionHash = resultAlastria.hash;      
        logger.info(`account alastri: ${resultAlastria.logs[0].address}`);       
    } else {
        logger.warn("No logs returned from Alastria deployment.");      
    }

    results.push({
        network: "ALASTRIA",
        address,
        transactionHash        
    });

    try {
        logger.info(`CREATING IN amoy`);
        initContractsService(logger, contracts, config, "AMOY");
        network = "AMOY"
        const resultAmoy: ContractTransactionResponse | ContractTransactionReceipt | null =
            await executeContractMethod(contractName, contractAddress, methodName, newArgs, options, network);

        let addressAmoy: string | null = null;
        let transactionHashAmoy: string | null = null;
        let timestampAmoy: string | null = null;

        if (resultAmoy && 'logs' in resultAmoy && resultAmoy.logs.length > 0) {
            addressAmoy = resultAmoy.logs[0].address;
            transactionHashAmoy = resultAmoy.hash;
            logger.info(`account amoy: ${addressAmoy}`);
        } else {
            logger.warn("No logs returned from Amoy deployment.");
        }

        results.push({
            network: "AMOY",
            address: addressAmoy,
            transactionHash: transactionHashAmoy            
        });

        return {
            statusCode: 201,
            body: {
                message: "Transactions executed successfully",
                accounts: results,
            },
        };

    } catch (error) {
        logger.error(`Error in AMOY deployment: ${error}`);

        return {
            statusCode: 500,
            body: {
                message: "Transaction failed",
                accounts: results,
            },
        };
    }        

}

export async function createIndividualAccountRetry(req: Request): Promise<AppResult> {
    const contractName: string = "AccountFactory";
    const contractAddress: string = config.CONTRACT.ADDRESS || req.params.address;

    const bytecode: string = config.BYTECODE;

    const methodName: string = "createAccount";
    const args: any[] = req.body.args || [];  

    // Primera posición es la red (network)
    const salt: string = args[0] || "DEFAULT";   
    //const salt: string = "";   
    const network: string = args[1] || "DEFAULT";   
    const options: Overrides = req.body.options || {};
       
    const encoded = encodeBytes32String(salt);

    const newArgs: any[] = [encoded, bytecode];

    const results: {
        network: string;
        address: string | null;
        transactionHash: string | null;        
    }[] = [];

    logger.info(`INITIALIZING SERVICES createAccountRetryIndividual in ${network}`);
    const contracts = await loadAllContracts(config, logger);

    initContractsService(logger, contracts, config, network);

    const result: ContractTransactionResponse | ContractTransactionReceipt | null =
        await executeContractMethod(contractName, contractAddress, methodName, newArgs, options, network);

    let address = null;
    let transactionHash = null;  

    if (result && "logs" in result && result.logs.length > 0) {
        address = result.logs[0].address;
        transactionHash = result.hash;

        logger.info(`account ${network}: ${address}`);
    } else {
        logger.warn(`No logs returned from ${network} deployment.`);
    }

    results.push({
        network,
        address,
        transactionHash        
    });

    return {
        statusCode: 201,
        body: {
            message: "Transaction executed successfully",
            accounts: results,
        },
    };
}



export default function initContractController(_logger: Logger, _config: Config) {
  logger = _logger;
  config = _config;
}