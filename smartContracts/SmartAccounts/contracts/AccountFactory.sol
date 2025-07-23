// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Create2Deployer} from "./Create2Deployer.sol";

/**
 * @title AccountFactory
 * @dev A factory contract for deploying `Account` contracts deterministically using the CREATE2 opcode.
 * 
 * @notice This contract allows the owner to deploy `Account` contracts with predictable addresses
 * using the CREATE2 opcode. It keeps track of all deployed contracts and provides functions to retrieve them.
 */
contract AccountFactory is Ownable, Create2Deployer {
    // Mapping to store deployed contracts by their index
    mapping (uint256 => address) public deployedContracts;

    // Mapping to store the index of a deployed contract by its address
    mapping (address => uint256) public indexOfDeployedContracts;

    // Counter to track the total number of deployed contracts
    uint256 public totalOfContractsAccounts;

    // Event emitted when a new `Account` contract is created
    event AccountCreated(address indexed accountAddress, address indexed owner);

    /**
     * @dev Constructor that initializes the contract with the owner.
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Deploys a new `Account` contract using CREATE2.
     * @param salt A unique value used to compute the deterministic address.
     * @param bytecodeofAccountContract The bytecode of the `Account` contract to deploy.
     * @return The address of the newly deployed `Account` contract.
     */
    function createAccount(bytes32 salt, bytes memory bytecodeofAccountContract) external onlyOwner returns (address) {
        // Deploy the contract using CREATE2
        address account = _deployCreate2(salt, bytecodeofAccountContract);

        // Store the deployed contract in the mappings
        deployedContracts[totalOfContractsAccounts] = account;
        indexOfDeployedContracts[account] = totalOfContractsAccounts;

        // Increment the counter for deployed contracts
        totalOfContractsAccounts++;

        // Emit an event for the newly created contract
        emit AccountCreated(address(account), msg.sender);

        // Return the address of the deployed contract
        return account;
    }

    /**
     * @dev Retrieves all deployed `Account` contracts.
     * @return An array of addresses of all deployed `Account` contracts.
     */
    function getAllDeployedContracts() external view returns (address[] memory) {
        // Create an array to store the addresses of deployed contracts
        address[] memory accounts = new address[](totalOfContractsAccounts);

        // Populate the array with the addresses of deployed contracts
        for (uint256 i = 0; i < totalOfContractsAccounts; i++) {
            accounts[i] = deployedContracts[i];
        }

        // Return the array of deployed contract addresses
        return accounts;
    }
}