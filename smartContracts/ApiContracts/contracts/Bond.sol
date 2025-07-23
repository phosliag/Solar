// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Bond
 * @dev This contract represents a bond as an ERC20 token. It allows the owner to mint and burn tokens,
 *      representing the creation and redemption of bonds. The contract also tracks the price of each bond.
 * 
 * @notice This contract is designed to facilitate the management of bonds as tokens, with no fractional units.
 */
contract Bond is ERC20, ERC20Burnable, Ownable {

    // Price of each bond in wei
    uint256 public bondPrice;

    // Event emitted when new bonds are minted
    event MintBond(address indexed to, uint256 amount);

    // Event emitted when bonds are burned
    event BurnBond(address indexed from, uint256 amount);

    /**
     * @dev Constructor to initialize the Bond contract.
     * @param owner The address of the owner of the bond.
     * @param name The name of the bond token.
     * @param symbol The symbol of the bond token.
     * @param pricePerBond The price of each bond in wei.
     */
    constructor(
        address owner,
        string memory name,
        string memory symbol,
        uint256 pricePerBond
    ) Ownable(owner) ERC20(name, symbol) {
        bondPrice = pricePerBond;
    }

    /**
     * @dev Overrides the `decimals` function to set the number of decimals to 0.
     *      This ensures that the bond token does not have fractional units.
     * @return The number of decimals (0).
     */
    function decimals() public pure override returns (uint8) {
        return 0; // No decimals
    }

    /**
     * @dev Allows the owner to mint new bonds.
     * @param to The address to which the bonds will be minted.
     * @param amount The number of bonds to mint.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit MintBond(to, amount);
    }

    /**
     * @dev Allows the owner to burn bonds.
     * @param amount The number of bonds to burn.
     */
    function burn(uint256 amount) public override onlyOwner {
        _burn(msg.sender, amount);
        emit BurnBond(msg.sender, amount);
    }
}