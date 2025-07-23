// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateRegistryOptimized
 * @author fernando lopez
 * @notice Un registro de certificados mejorado que permite la creación dinámica de tipos
 * y la gestión de múltiples certificados pendientes por usuario.
 */
contract CertificateRegistry {

    struct Certificate {
        uint typeId;
        uint256 timestamp;
        address issuer; 
    }

    struct CertificateType {
        uint typeId;
        string name;
        bool exists;
    }



    // Mapping principal de certificados registrados, indexado por su hash
    mapping(bytes32 => Certificate) public certificates;

    // Mapping para los tipos de certificado. Usamos un contador para asegurar IDs únicos.
    mapping(uint => CertificateType) public certificateTypes;
    uint public nextTypeId; // MEJORA: Contador para nuevos tipos.

    // Mapping de certificados firmados por cada dirección
    mapping(address => mapping(bytes32 => bool)) public signedCertificates;


    // mapping(dirección del firmante => array de hashes de certificados pendientes)
    mapping(address => bytes32[]) public pendingCertificatesForUser;

    // mapping(dirección del firmante => mapping(hash del certificado => bool))
    mapping(address => mapping(bytes32 => bool)) public isCertificatePending;

    address public owner;

    // --- Modificadores ---

    modifier isOwner() {
        require(msg.sender == owner, "Auth: Not the owner");
        _;
    }

    // --- Eventos ---

    event CertificateTypeCreated(uint indexed typeId, string name);
    event CertificateIssued(bytes32 indexed certificateHash, uint indexed typeId, address indexed recipient, address issuer);
    event CertificateSigned(bytes32 indexed certificateHash, address indexed signer);

    // --- Constructor ---

    constructor() {
        owner = msg.sender;
        nextTypeId = 1; // Inicializamos el contador
        // Creamos los tipos iniciales de forma modular
        createCertificateType("Login");
        createCertificateType("X-ray");
    }

    // --- Funciones de Gestión (Owner) ---

    /**
     * @notice : Crea un nuevo tipo de certificado. Solo el owner.
     * @param _name El nombre del nuevo tipo de certificado (ej. "Diploma", "Permiso").
     */
    function createCertificateType(string memory _name) public isOwner {
        require(bytes(_name).length > 0, "Input: Name cannot be empty");
        uint currentId = nextTypeId;
        certificateTypes[currentId] = CertificateType({
            typeId: currentId,
            name: _name,
            exists: true
        });
        emit CertificateTypeCreated(currentId, _name);
        nextTypeId++;
    }

    /**
     * @notice Registra y asigna un certificado a un destinatario para que lo firme.
     * @param _certificateHash Hash único del contenido del certificado.
     * @param _recipient La dirección que debe firmar el certificado.
     * @param _typeId El ID del tipo de certificado a registrar.
     */
    function issueCertificate(bytes32 _certificateHash, address _recipient, uint _typeId) external isOwner {
        require(certificates[_certificateHash].timestamp == 0, "Error: Certificate already exists");
        require(certificateTypes[_typeId].exists, "Error: Certificate type does not exist");
        require(_recipient != address(0), "Error: Invalid recipient address");

        certificates[_certificateHash] = Certificate({
            typeId: _typeId,
            timestamp: block.timestamp,
            issuer: msg.sender
        });

        // Añade el certificado a la lista de pendientes del destinatario.
        pendingCertificatesForUser[_recipient].push(_certificateHash);
        isCertificatePending[_recipient][_certificateHash] = true;

        emit CertificateIssued(_certificateHash, _typeId, _recipient, msg.sender);
    }

    // --- Funciones de Firma (Usuario) ---

    /**
     * @notice El destinatario firma un certificado pendiente. 
     * @dev La firma siempre es del propietario del smart contract.
     * @param _certificateHash El hash del certificado que se está firmando.
     * @param _signature La firma digital del hash del certificado.
     */
    function signCertificate(bytes32 _certificateHash, bytes calldata _signature, address _recipient) external {
        require(isCertificatePending[msg.sender][_certificateHash], "Error: Certificate is not pending for you");

        address signer = recoverSigner(_certificateHash, _signature);
        require(signer == msg.sender, "Error: Invalid signature");

        signedCertificates[_recipient][_certificateHash] = true;
        isCertificatePending[_recipient][_certificateHash] = false; // Lo marca como no pendiente

        // MEJORA: Elimina el certificado de la lista de pendientes de forma eficiente.
        _removePendingCertificate(_recipient, _certificateHash);

        emit CertificateSigned(_certificateHash, _recipient);
    }

    /**
     * @dev Usa el método "swap and pop" para una eliminación en O(1) de gas.
     */
    function _removePendingCertificate(address _user, bytes32 _certHash) private {
        bytes32[] storage pendingList = pendingCertificatesForUser[_user];
        for (uint i = 0; i < pendingList.length; i++) {
            if (pendingList[i] == _certHash) {
                // Reemplaza el elemento a eliminar con el último elemento
                pendingList[i] = pendingList[pendingList.length - 1];
                // Elimina el último elemento
                pendingList.pop();
                return;
            }
        }
    }

    // --- Funciones de Consulta (Públicas) ---

    /**
     * @notice Obtiene la lista de hashes de certificados pendientes para un usuario.
     */
    function getPendingCertificatesFor(address _user) external view returns (bytes32[] memory) {
        return pendingCertificatesForUser[_user];
    }

    /**
     * @notice Verifica si un certificado específico ha sido firmado por una dirección.
     */
    function hasSigned(address _signer, bytes32 _certificateHash) external view returns (bool) {
        return signedCertificates[_signer][_certificateHash];
    }
    
    /**
     * @notice Obtiene los datos de un certificado registrado.
     */
    function getCertificateInfo(bytes32 _certificateHash) external view returns (uint typeId, uint256 timestamp, address issuer) {
        Certificate memory cert = certificates[_certificateHash];
        require(cert.timestamp != 0, "Error: Certificate not found");
        return (cert.typeId, cert.timestamp, cert.issuer);
    }

    // --- Lógica de Recuperación de Firma (Sin cambios) ---

    function recoverSigner(bytes32 messageHash, bytes calldata signature) internal pure returns (address) {
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

  function splitSignature(bytes calldata sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "splitSignature: Invalid signature length");
        
        // CORRECCIÓN: Usamos `calldataload` para leer directamente desde `calldata`
        // en lugar de `mload` que lee desde `memory`.
        assembly {
            // sig.offset apunta al inicio de los datos de la firma en el calldata.
            // No hay una palabra de "longitud" al principio como en `memory`.
            
            // Cargar los primeros 32 bytes (el valor de r)
            r := calldataload(sig.offset)
            
            // Cargar los siguientes 32 bytes (el valor de s), que están en sig.offset + 32
            s := calldataload(add(sig.offset, 32))
            
            // Cargar la palabra de 32 bytes que contiene a 'v'. 'v' está en la posición 64.
            // Luego, aislamos el último byte de esa palabra.
            v := byte(0, calldataload(add(sig.offset, 64)))
        }

        // Para compatibilidad con firmadores que devuelven v = 0/1 (como Trezor)
        if (v < 27) {
            v += 27;
        }
    }
}