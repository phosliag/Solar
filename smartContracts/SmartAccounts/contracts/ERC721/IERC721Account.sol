// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";



/// @notice Extends ERC721 with account functions
interface IERC721Account {

    function transferERC721(IERC721 tokenContract, address to, uint256 tokenId) external returns (bool);

    function setApprovalForAllERC721(IERC721 tokenContract, address operator, bool approved) external
        returns (bool);

}