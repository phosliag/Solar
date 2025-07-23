// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICertificateRegistry
 * @notice Interfaz para el contrato CertificateRegistryOptimized.
 * @dev Define todas las funciones externas que modifican el estado y los eventos públicos,
 * permitiendo la interacción y la composición con otros contratos inteligentes.
 */
interface ICertificateRegistry {

    // --- Eventos ---
    // Un contrato que interactúa con el registro podría querer reaccionar a estos eventos.

    /**
     * @notice Se emite cuando el owner crea un nuevo tipo de certificado.
     */
    event CertificateTypeCreated(uint indexed typeId, string name);

    /**
     * @notice Se emite cuando se registra un nuevo certificado y se asigna a un destinatario.
     */
    event CertificateIssued(bytes32 indexed certificateHash, uint indexed typeId, address indexed recipient, address issuer);

    /**
     * @notice Se emite cuando un destinatario firma con éxito su certificado.
     */
    event CertificateSigned(bytes32 indexed certificateHash, address indexed signer);


    // --- Funciones que Modifican el Estado ---

    /**
     * @notice Crea un nuevo tipo de certificado.
     * @dev Debe ser llamado por el owner del contrato principal.
     * @param _name El nombre del nuevo tipo de certificado.
     */
    function createCertificateType(string memory _name) external;

    /**
     * @notice Registra y asigna un certificado a un destinatario para que lo firme.
     * @dev Debe ser llamado por el owner del contrato principal.
     * @param _certificateHash Hash único del contenido del certificado.
     * @param _recipient La dirección que debe firmar el certificado.
     * @param _typeId El ID del tipo de certificado a registrar.
     */
    function issueCertificate(bytes32 _certificateHash, address _recipient, uint _typeId) external;

    /**
     * @notice Permite al destinatario firmar un certificado pendiente.
     * @dev La dirección que llama a esta función (`msg.sender`) debe ser la que firmó el hash.
     * @param _certificateHash El hash del certificado que se está firmando.
     * @param _signature La firma digital del hash del certificado.
     */
    function signCertificate(bytes32 _certificateHash, bytes calldata _signature, address _recipient) external;
}