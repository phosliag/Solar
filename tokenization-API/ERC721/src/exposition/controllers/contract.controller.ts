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
    const results: { network: string; transactionHash: string | null; address: string | null }[] = [];

    logger.info(`Start CreateBond  in Alastria `);
    const contracts = await loadAllContracts(config, logger);
    initContractsService(logger, contracts, config, "ALASTRIA");

    const metadata: string = args[0]; 
    const newArgs: any[] = [config.NETWORK.API_WALLET_PUBLIC, metadata];
    const resultAlastria: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddress, methodName, newArgs, options, "ALASTRIA");

    if (resultAlastria && 'logs' in resultAlastria && resultAlastria.logs.length > 0) {
        const address = resultAlastria.logs[0].address;
        transactionHash = resultAlastria.hash; 
        // coger el id del nft --> esta dentro del topic log 4
        results.push({ network: "ALASTRIA", transactionHash, address });
    } else {     
        results.push({ network: "ALASTRIA", transactionHash: resultAlastria?.hash ?? null, address: null });
    }

    return {
        statusCode: 201,
        body: {
            // message: "Transactions executed successfully",
            accounts: results,
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

    const newArgs: any[] = [contractAddress, config.NETWORK.API_WALLET_PUBLIC, nftID];

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

    const newArgs: any[] = [config.NETWORK.API_WALLET_PUBLIC ,accountTo, nftID];

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

export async function bridge(req: Request): Promise<AppResult> {

    const contractAddressVault: string = config.CONTRACT.ADDRESS_VAULT;
   
    const options: Overrides = req.body.options || {};
    const args: any[] = req.body.args || [];
    const accountAddressOwner: string = args[1];
    const bondAddress: string = args[0];
    const amount: string = args[2];


    const contractNameApprove: string = "Account";
    const methodNameApprove: string = "approveERC20";
    const contractAddressApprove: string = accountAddressOwner;

    const tokenName = args[3];
    const tokenSymbol = args[4];
    const priceToken = args[5];
    const apiWalletPublic = config.NETWORK.API_WALLET_PUBLIC;
     

    const approveArgs: any[] = [bondAddress, contractAddressVault, amount];
    logger.info(`Start     --       ApproveERC20`);
    const contracts = await loadAllContracts(config, logger);
    initContractsService(logger, contracts, config, "ALASTRIA");

    const resultApprove: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractNameApprove, contractAddressApprove, methodNameApprove, approveArgs, options, "ALASTRIA");

    if (resultApprove && 'status' in resultApprove && resultApprove.status === 1) {
        logger.info("Approve transaction succeeded. Waiting 10 seconds...");

        await delay(10_000); // espera 10s (10,000 ms)

        // Llama a la siguiente función
        const contractName: string = "Vault";
        const methodName: string = "deposit";
        const newArgs: any[] = [bondAddress, accountAddressOwner, amount];

        logger.info(`Start    --     Deposit`);

        initContractsService(logger, contracts, config, "ALASTRIA");

        const result: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddressVault, methodName, newArgs, options, "ALASTRIA");

        if (result && "status" in result && result.status === 1) {


            const contractName: string = "RepresentativeBondTokenFactory";
            const methodName: string = "createRepresentativeBondToken";
            const contractAddressRepresentative: string = config.CONTRACT.ADDRESS_REPRESENTATIVE_BOND_TOKEN;

            logger.info(`Start    --     createRepresentativeBondToken`);

            const representativeArgs: any[] = [tokenName, tokenSymbol, apiWalletPublic, bondAddress, accountAddressOwner, priceToken ];

            initContractsService(logger, contracts, config, "AMOY");
           
            const resultAmoy: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, contractAddressRepresentative, methodName, representativeArgs, options, "AMOY");
            let addressTokenAmoy = "";

            if (resultAmoy && 'logs' in resultAmoy && resultAmoy.logs.length > 0) {

                // esto hay q devolverlo para guardarlo en el mongo --> se manda en la siguiente llamada. 
                addressTokenAmoy = resultAmoy.logs[0].address;
                const transactionHash = resultAmoy && 'hash' in resultAmoy ? resultAmoy.hash : 'N/A';
                logger.info(`account in seco amoy: ${resultAmoy.logs[0].address}`);
                logger.info(`Start    --    Mint in amoy representative tokens`);

                const contractName: string = "RepresentativeBondToken";
                const methodName: string = "mint";

                const mintRepresentativeArgs: any[] = [accountAddressOwner, amount];

                initContractsService(logger, contracts, config, "AMOY");
                const resultTokenMint: ContractTransactionResponse | ContractTransactionReceipt | null = await executeContractMethod(contractName, addressTokenAmoy, methodName, mintRepresentativeArgs, options, "AMOY");

                return {
                    statusCode: 201,
                    body: {
                        message: transactionHash,
                        contract: addressTokenAmoy
                    }
                }

            } else {
                return {
                    statusCode: 500,
                    body: {
                        message: "create bond in amoy Error"
                    }
                }
            }           

        } else {
            return {
                statusCode: 500,
                body: {
                    message: "lock in vault Error"
                }
            }
        }       

    } else {
        return {
            statusCode: 500,
            body: {
                message: "approve error"
            }
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