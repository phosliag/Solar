// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Bond} from "../Bond.sol";
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title BondFactory
 * @dev This contract is responsible for creating and managing Bond contracts. It allows the owner to deploy new Bond contracts
 *      and keeps track of all deployed bonds, their indices, and the total number of bonds created by each beneficiary.
 *      Only the owner of the contract can create new bonds.
 */
contract BondFactory is Ownable {
    
    // Mapping to store deployed Bond contracts by their index
    mapping (uint256 => Bond) public deployedBonds;

    // Mapping to store the total number of bonds created by each beneficiary
    mapping (address => uint256) public totalOfBondsCreatedByBeneficary;

    // Mapping to store the index of a deployed Bond contract by its address
    mapping (Bond => uint256) public indexOfDeployedBonds;

    // Mapping to store all Bond contracts created by a beneficiary
    mapping (address => address[]) public bondsByBeneficiary;

    // Counter to track the total number of bonds created
    uint256 public totalOfBondsCreated;

    // Event emitted when a new Bond contract is created
    event BondCreated(address indexed bondAddress, address indexed beneficaryOfBond);

    /**
     * @dev Constructor that initializes the contract with the owner.
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Creates a new Bond contract and registers it in the mappings.
     * @param name The name of the Bond.
     * @param symbol The symbol of the Bond.
     * @param priceBond The unit price of the Bond.
     * @param beneficaryOfBond The address of the beneficiary of the Bond.
     * @return The address of the newly created Bond contract.
     */
    function createBond(
        string memory name,
        string memory symbol,
        uint priceBond,
        address beneficaryOfBond
    ) external onlyOwner returns (address) {
        require(beneficaryOfBond != address(0), "Beneficiary address cannot be zero");

        // Deploy a new Bond contract
        Bond bond = new Bond(msg.sender, name, symbol, priceBond);

        // Store the deployed Bond contract in the mappings
        deployedBonds[totalOfBondsCreated] = bond;
        indexOfDeployedBonds[bond] = totalOfBondsCreated;

        // Increment the total number of bonds created
        totalOfBondsCreated++;

        // Increment the total number of bonds created by the beneficiary
        totalOfBondsCreatedByBeneficary[beneficaryOfBond]++;

        // Add the bond to the list of bonds for the beneficiary
        bondsByBeneficiary[beneficaryOfBond].push(address(bond));

        // Emit an event for the newly created Bond contract
        emit BondCreated(address(bond), beneficaryOfBond);

        // Return the address of the deployed Bond contract
        return address(bond);
    }

    /**
     * @dev Retrieves all Bond contracts created by a specific beneficiary.
     * @param beneficaryOfBond The address of the beneficiary.
     * @return An array of addresses of Bond contracts created by the beneficiary.
     */
    function getBondsByBeneficiary(address beneficaryOfBond) external view returns (address[] memory) {
        return bondsByBeneficiary[beneficaryOfBond];
    }
}