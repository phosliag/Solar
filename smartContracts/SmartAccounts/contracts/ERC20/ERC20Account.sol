// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Account} from './IERC20Account.sol';
import {IERC20Burnable} from './IERC20Account.sol';

abstract contract ERC20Account is IERC20Account {
    
     address internal constant DEAD = address(0x000000000000000000000000000000000000dEaD);

    function allowanceERC20(
        IERC20 tokenContract,
        address spender
    ) public view virtual override returns (uint256) {
        return tokenContract.allowance(address(this), spender);
    }

    function approveERC20(
        IERC20 tokenContract,
        address spender,
        uint256 value
    ) public virtual override returns (bool) {
        return tokenContract.approve(spender, value);
    }

    function balanceERC20(
        IERC20 tokenContract
    ) public view virtual override returns (uint256) {
        return tokenContract.balanceOf(address(this));
    }

    function transferERC20(
        IERC20 tokenContract,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        return tokenContract.transfer(to, amount);
    }

   /// @inheritdoc IERC20Account
    /// @dev Primero intenta burn(), luego burnFrom(), y si ambos fallan, transfiere a dirección DEAD.
    function burnERC20(
        IERC20Burnable tokenContract,
        uint256 amount
    ) public virtual override returns (bool) {
        // 1) Intento de burn() nativo
        try tokenContract.burn(amount) {
            return true;
        } catch {
            // 2) Intento de burnFrom(this, amount)
            try tokenContract.burnFrom(address(this), amount) {
                return true;
            } catch {
                // 3) Fallback: envío a “dead” (no reduce supply, pero inmoviliza los tokens)
                IERC20(address(tokenContract)).transfer(DEAD, amount);
                return true;
            }
        }
    }
}