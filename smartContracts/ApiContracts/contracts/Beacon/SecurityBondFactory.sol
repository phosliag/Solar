// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

/**
 * @title SecurityBondFactory
 * @dev Crea instancias de contratos SecurityToken usando BeaconProxy para que sean actualizables
 */
contract SecurityBondFactory is Ownable {
    address public immutable beacon;

    mapping(uint256 => address) public deployedBonds;
    mapping(address => uint256) public totalOfBondsCreatedByBeneficiary;
    mapping(address => uint256) public indexOfDeployedBonds;
    uint256 public totalOfBondsCreated;

    event BondCreated(address indexed bondProxy, address indexed beneficiary);

    constructor(address _beacon) Ownable(msg.sender) {
        require(_beacon != address(0), "Beacon address cannot be zero");
        beacon = _beacon;
    }

    function createBond(bytes memory initData, address beneficiary) external onlyOwner returns (address) {
        BeaconProxy proxy = new BeaconProxy(beacon, initData);

        deployedBonds[totalOfBondsCreated] = address(proxy);
        indexOfDeployedBonds[address(proxy)] = totalOfBondsCreated;
        totalOfBondsCreated++;
        totalOfBondsCreatedByBeneficiary[beneficiary]++;

        emit BondCreated(address(proxy), beneficiary);
        return address(proxy);
    }
}