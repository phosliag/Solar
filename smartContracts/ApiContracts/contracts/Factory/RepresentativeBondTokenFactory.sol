// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {RepresentativeBondToken} from "../RepresentativeBondToken.sol";
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
/**
 * @title RepresentativeBondTokenFactory
 * @dev This contract is responsible for creating and managing RepresentativeBondToken contracts. It allows the owner to deploy new RepresentativeBondToken contracts
 *      and keeps track of all deployed RepresentativeBondTokens, their indices, and the total number of RepresentativeBondTokens created by each beneficiary.
 *      Only the owner of the contract can create new RepresentativeBondToken.
 * 
 */
contract RepresentativeBondTokenFactory is Ownable {
    
    mapping (uint256 => RepresentativeBondToken) public deployedRepresentativeBondTokens;
    mapping (address => uint256) public totalOfRepresentativeBondTokenByBeneficary;
    mapping (RepresentativeBondToken => uint256) public indexOfRepresentativeBondTokens;
    uint256 public totalOfRepresentativeBondTokenCreated;
    
    event RepresentativeBondTokenCreated(address indexed representativeBondTokenAddress, address indexed beneficaryOfRepresentativeBondToken);
    constructor() Ownable(msg.sender) {}
    function createRepresentativeBondToken(string memory name, string memory symbol, address owner, address _bondContract, address _beneficiary, uint _pricePerBond) external onlyOwner returns (address) {
        RepresentativeBondToken representativeBondToken = new RepresentativeBondToken(name, symbol,  owner,  _bondContract,  _beneficiary, _pricePerBond);
        // storage the deployed contract in the mapping of
        deployedRepresentativeBondTokens[totalOfRepresentativeBondTokenCreated] = representativeBondToken;
        // storage the index of the deployed contract in the mapping of 
        indexOfRepresentativeBondTokens[representativeBondToken] = totalOfRepresentativeBondTokenCreated;
        // increase the total number of contracts created
        totalOfRepresentativeBondTokenCreated++;
        // increase the total number of contracts created by the beneficiary
        totalOfRepresentativeBondTokenByBeneficary[_beneficiary]++;

        emit RepresentativeBondTokenCreated(address(representativeBondToken), _beneficiary);
        return address(representativeBondToken);
    }
}