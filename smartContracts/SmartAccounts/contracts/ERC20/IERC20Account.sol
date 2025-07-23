// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Extends ERC20 with burn functions
interface IERC20Burnable is IERC20 {
    /// @notice Burns from the caller's own balance (msg.sender)
    function burn(uint256 amount) external;
    /// @notice Burns from the balance of `account`, using allowance
    function burnFrom(address account, uint256 amount) external;
}

/// @notice Account operations on generic ERC20
interface IERC20Account {
    function allowanceERC20(IERC20 tokenContract, address spender) external view returns (uint256);
    function approveERC20(IERC20 tokenContract, address spender, uint256 value) external returns (bool);
    function balanceERC20(IERC20 tokenContract) external view returns (uint256);
    function transferERC20(IERC20 tokenContract, address to, uint256 amount) external returns (bool);

    /// @notice Attempts to burn natively or via allowance, or falls back
    function burnERC20(IERC20Burnable tokenContract, uint256 amount) external returns (bool);
}
