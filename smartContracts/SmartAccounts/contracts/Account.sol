// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20Account} from "./ERC20/ERC20Account.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20Burnable} from "./ERC20/IERC20Account.sol";

contract Account is ERC20Account, Ownable {
    constructor(address owner_) Ownable(owner_) {}

    function approveERC20(
        IERC20 tokenContract,
        address spender,
        uint256 value
    ) public override onlyOwner returns (bool) {
        return ERC20Account.approveERC20(tokenContract, spender, value);
    }

    function transferERC20(
        IERC20 tokenContract,
        address to,
        uint256 amount
    ) public override onlyOwner returns (bool) {
        return ERC20Account.transferERC20(tokenContract, to, amount);
    }

    function burnERC20(
        IERC20Burnable tokenContract,
        uint256 amount
    ) public override onlyOwner returns (bool) {
        return ERC20Account.burnERC20(tokenContract, amount);
    }
}
