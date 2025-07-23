// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20Account} from "../ERC20/ERC20Account.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20Burnable} from "../ERC20/IERC20Account.sol";
import {ICertificateRegistry} from "./ICertificateRegistry.sol"; // Importamos la interfaz

contract Dentist is ERC20Account, Ownable {
    // Variable para almacenar la dirección del contrato CertificateRegistry
    ICertificateRegistry public certificateRegistry;

    constructor(address owner_) Ownable(owner_) {}

    function setCertificateRegistry(address _certificateRegistryAddress) public onlyOwner {
        require(_certificateRegistryAddress != address(0), "Account: Zero address not allowed for CertificateRegistry");
        certificateRegistry = ICertificateRegistry(_certificateRegistryAddress);
    }

    // --- Funciones para interactuar con el contrato ERC-20 (ya existentes) ---
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

    /// @notice Llama a registerCertificateToSign en el contrato CertificateRegistry
    /// @dev Solo el propietario de Account puede llamar a esta función.
    function registerCertificateToSign(bytes32 certHash, address ownerCertificate, uint typeCertificate) external onlyOwner {
        require(address(certificateRegistry) != address(0), "Account: CertificateRegistry address not set");
        certificateRegistry.issueCertificate(certHash, ownerCertificate, typeCertificate);
    }

    /// @notice Llama a registerSignerCertificate en el contrato CertificateRegistry
    /// @dev Permite a cualquier usuario con certificados pendientes firmarlos a través de Account.
    function registerSignerCertificate(bytes32 certHash, address ownerCertificate, bytes calldata signature) external {
        require(address(certificateRegistry) != address(0), "Account: CertificateRegistry address not set");
        certificateRegistry.signCertificate(certHash, signature, ownerCertificate);
    }
    
   
}