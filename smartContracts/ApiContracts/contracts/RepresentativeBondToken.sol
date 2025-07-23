// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RepresentativeBondToken
 * @dev This contract represents a representative token of a bond on another network.
 *      It allows the owner to mint new tokens and burn existing ones. The contract also
 *      stores the address of the bond contract on the main network and the beneficiary of the bond.
 * 
 * @notice This contract is designed to facilitate interoperability between networks by representing
 *         bonds as tokens on a secondary network.
 */
contract RepresentativeBondToken is ERC20, ERC20Burnable, Ownable {

    // Address of the bond contract on the main network
    address public bondContract;

    // Address of the beneficiary of the bond
    address public beneficiary;

    // Price of each bond in wei
    uint256 public bondPrice;

    // Event emitted when new tokens are minted
    event MintRepresentativeBond(address indexed to, uint256 amount);

    // Event emitted when tokens are burned
    event BurnRepresentativeBond(address indexed from, uint256 amount);

    /**
     * @dev Constructor to initialize the RepresentativeBondToken contract.
     * @param name The name of the token.
     * @param symbol The symbol of the token.
     * @param owner The address of the owner of the token.
     * @param _bondContract The address of the bond contract on the main network.
     * @param _beneficiary The address of the beneficiary of the bond.
     * @param pricePerBond The price of each bond in wei.
     */
    constructor(
        string memory name,
        string memory symbol,
        address owner,
        address _bondContract,
        address _beneficiary,
        uint256 pricePerBond
    ) ERC20(name, symbol) Ownable(owner) {
        bondContract = _bondContract;
        beneficiary = _beneficiary;
        bondPrice = pricePerBond;
    }

    /**
     * @dev Overrides the `decimals` function to set the number of decimals to 0.
     *      This ensures that the token does not have fractional units.
     * @return The number of decimals (0).
     */
    function decimals() public pure override returns (uint8) {
        return 0; // No decimals
    }

    /**
     * @dev Allows the owner to mint new tokens.
     * @param to The address to which the tokens will be minted.
     * @param amount The number of tokens to mint.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit MintRepresentativeBond(to, amount);
    }

    /**
     * @dev Allows the owner to burn tokens.
     * @param amount The number of tokens to burn.
     */
    function burn(uint256 amount) public override onlyOwner {
        _burn(msg.sender, amount);
        emit BurnRepresentativeBond(msg.sender, amount);
    }
}