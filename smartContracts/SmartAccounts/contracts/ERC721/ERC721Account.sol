// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Account} from './IERC721Account.sol';

abstract contract ERC721Account is IERC721Account {
 
    function transferERC721(IERC721 tokenContract, address to, uint256 tokenId) public virtual override returns (bool) {
        tokenContract.transferFrom(address(this), to, tokenId);
        return true;
    }

    function setApprovalForAllERC721(IERC721 tokenContract, address operator, bool approved) public virtual override
        returns (bool) {
        tokenContract.setApprovalForAll(operator, approved);
        return true;
    }
}