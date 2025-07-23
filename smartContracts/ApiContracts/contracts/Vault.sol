// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @notice This contract acts as a Vault for multiple ERC20 tokens.
 * @dev The contract allows the owner to lock and unlock tokens on behalf of other accounts.
 * The ERC20 token contract is specified as a parameter in the deposit and withdraw functions.
 */
contract Vault is Ownable {

    // token => beneficiary => amount
    mapping(address => mapping(address => uint256)) public balancesOfBeneficiaries;

    event BondDeposited(address indexed token, address indexed beneficiary, uint256 amount);
    event BondWithdrawn(address indexed token, address indexed beneficiary, uint256 amount);
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Deposits tokens on behalf of another account.
     * @param token The ERC20 token contract address.
     * @param beneficiary The account to which the locked tokens will be assigned.
     * @param amount The amount of tokens to lock.
     */
    function deposit(address token, address beneficiary, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(token != address(0), "Invalid token address");
        require(beneficiary != address(0), "Invalid beneficiary address");

        IERC20 erc20 = IERC20(token);
        require(erc20.balanceOf(beneficiary) >= amount, "Insufficient token balance");

        // Transfers the tokens to the contract
        require(erc20.transferFrom(beneficiary, address(this), amount), "Token transfer failed");

        // Updates the locked balance of the beneficiary for the specified token
        balancesOfBeneficiaries[token][beneficiary] += amount;
        emit BondDeposited(token, beneficiary, amount);
    }

    /**
     * @dev Allows the owner to withdraw locked tokens on behalf of a beneficiary.
     * @param token The ERC20 token contract address.
     * @param beneficiary The account that will receive the unlocked tokens.
     * @param amount The amount of tokens to withdraw.
     */
    function withdraw(address token, address beneficiary, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(token != address(0), "Invalid token address");
        require(balancesOfBeneficiaries[token][beneficiary] != 0, "Beneficiary has no locked balance");

        uint256 lockedBalance = balancesOfBeneficiaries[token][beneficiary];
        require(lockedBalance >= amount, "Insufficient locked balance");

        // Reduces the locked balance of the beneficiary for the specified token
        balancesOfBeneficiaries[token][beneficiary] -= amount;

        IERC20 erc20 = IERC20(token);
        // Transfers the tokens to the beneficiary
        require(erc20.transfer(beneficiary, amount), "Token transfer failed");
        emit BondWithdrawn(token, beneficiary, amount);
    }

    /**
     * @dev Queries the locked balance of a beneficiary for a specific token.
     * @param token The ERC20 token contract address.
     * @param beneficiary The account to query.
     * @return The locked balance of the beneficiary for the specified token.
     */
    function getBalance(address token, address beneficiary) external view returns (uint256) {
        return balancesOfBeneficiaries[token][beneficiary];
    }
}