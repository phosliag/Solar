import { ethers } from 'ethers';
import {
  getContract,
  getContractInstance,
  getContractMethod,
  callContractMethod,
  executeContractMethod,
  initContractsService
} from '../services/contracts.service';
import ContractInstanceNotFoundException from '../types/exceptions/ContractInstanceNotFound.exception';
import ContractMethodNotFoundException from '../types/exceptions/ContractMethodNotFound.exception';
import ContractNotFoundException from '../types/exceptions/ContractNotFound.exception';
import Logger from '../helpers/logger.helper';
import ContractCollection from '../types/ContractCollection.type';
import Config from '../types/Config.type';

jest.mock('ethers');

describe('contracts.service', () => {
  let logger: Logger;
  let contracts: ContractCollection;
  let config: Config;

  beforeEach(() => {
    logger = new Logger();
    contracts = {
      'ERC20MintableAndBurnable': {
        abi: [], // Add the actual ABI here
        // @ts-ignore
        bytecode: '0x'
      }
    };
    config = {
      NETWORK: {
        // @ts-ignore
        WALLET_PRIV_KEY: `0x5b3244868464b97618e1545555f5ce5e443ad09dafb72c560a3d8018e1c2b2b3`,
        URL: `http://63.33.55.29/?apikey=018fb8ff-36a1-74ea-9620-3b130fd23d67`
      }
    };
    // @ts-ignore
    initContractsService(logger, contracts, config);
  });

  describe('getContract', () => {
    it('should return the contract if it exists', () => {
      const contract = getContract('ERC20MintableAndBurnable');
      expect(contract).toBe(contracts['ERC20MintableAndBurnable']);
    });

    it('should throw ContractNotFoundException if the contract does not exist', () => {
      expect(() => getContract('NonExistentContract')).toThrow(ContractNotFoundException);
    });
  });

  describe('getContractInstance', () => {
    it('should return a contract instance if the contract exists and is deployed', async () => {
      const contractInstance = {
        getDeployedCode: jest.fn().mockResolvedValue('0x')
      };
      // @ts-ignore
      ethers.Contract.mockImplementation(() => contractInstance);

      const instance = await getContractInstance('ERC20MintableAndBurnable', '0x123');
      expect(instance).toBe(contractInstance);
    });

    it('should throw ContractInstanceNotFoundException if the contract is not deployed', async () => {
      const contractInstance = {
        getDeployedCode: jest.fn().mockResolvedValue(null)
      };
      // @ts-ignore
      ethers.Contract.mockImplementation(() => contractInstance);

      await expect(getContractInstance('ERC20MintableAndBurnable', '0x123')).rejects.toThrow(ContractInstanceNotFoundException);
    });
  });

  describe('getContractMethod', () => {
    it('should return the contract method if it exists', async () => {
      const contractInstance = {
        getFunction: jest.fn().mockReturnValue({
          getFragment: jest.fn().mockReturnValue({ name: 'mint', inputs: [] })
        })
      };
      // @ts-ignore
      jest.spyOn(ethers, 'Contract').mockImplementation(() => contractInstance);

      const method = await getContractMethod('ERC20MintableAndBurnable', '0x123', 'mint', []);
      expect(method).toBeDefined();
    });

    it('should throw ContractMethodNotFoundException if the method does not exist', async () => {
      const contractInstance = {
        getFunction: jest.fn().mockImplementation(() => { throw new Error('Method not found'); })
      };
      // @ts-ignore
      jest.spyOn(ethers, 'Contract').mockImplementation(() => contractInstance);

      await expect(getContractMethod('ERC20MintableAndBurnable', '0x123', 'nonExistentMethod', [])).rejects.toThrow(ContractMethodNotFoundException);
    });
  });

  describe('callContractMethod', () => {
    it('should call the mint method successfully', async () => {
      const contractInstance = {
        getFunction: jest.fn().mockReturnValue({
          getFragment: jest.fn().mockReturnValue({ name: 'mint', inputs: [] })
        }),
        mint: jest.fn().mockResolvedValue('Minted')
      };
      // @ts-ignore
      jest.spyOn(ethers, 'Contract').mockImplementation(() => contractInstance);

      const result = await callContractMethod('ERC20MintableAndBurnable', '0x123', 'mint', [1000], {});
      expect(result).toBe('Minted');
    });
  });

  describe('executeContractMethod', () => {
    it('should execute the burn method successfully', async () => {
      const contractInstance = {
        getFunction: jest.fn().mockReturnValue({
          getFragment: jest.fn().mockReturnValue({ name: 'burn', inputs: [] })
        }),
        burn: jest.fn().mockResolvedValue('Burned')
      };
      // @ts-ignore
      jest.spyOn(ethers, 'Contract').mockImplementation(() => contractInstance);

      const result = await executeContractMethod('ERC20MintableAndBurnable', '0x123', 'burn', [500], {}, '');
      expect(result).toBe('Burned');
    });
  });
});