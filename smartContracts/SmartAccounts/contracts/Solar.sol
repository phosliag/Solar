// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


/**
 * @title SOLAR - Contrato ERC721 para Placas Solares
 * @dev Contrato de tokens no fungibles que representa placas solares
 * @author Fernando lopez
 */
contract SOLAR is ERC721, Ownable {

    
    // Contador para los token IDs
    uint private _tokenIdCounter = 1;
    
    // Metadata externa fija - URI para los metadatos estándar (igual para todos)
    string private _fixedTokenURI;
    
    // Mapping de privateTokenURI por token (contrato de uso específico de cada placa)
    mapping(uint256 => string) private _privateTokenURIs;
    
    // Información general del contrato
    string private _contractDescription;
    string private _companyName;
    string private _companyWebsite;
    
    // Eventos para tracking de cambios
    event FixedTokenURIUpdated(string newTokenURI);
    event ContractInfoUpdated(string description, string companyName, string website);
    event PrivateTokenURIUpdated(uint256 indexed tokenId, string privateTokenURI);
    event SolarPanelMinted(address indexed to, uint256 indexed tokenId, string privateTokenURI);

    /**
     * @param apiWallet Dirección que será asignada como propietaria (owner) del contrato.
     *                  
     */
    constructor(address apiWallet) ERC721("Solar Panel NFT", "SOLAR") Ownable(apiWallet) {
        _fixedTokenURI = "https://example.com/solar-metadata.json"; // URI fija para metadatos estándar
        _contractDescription = "NFTs de placas solares";
        _companyName = "Placas Solares S.A.";
        _companyWebsite = "https://placassolares.com";
    }
    
    /**
     * @dev Mintea un nuevo token de placa solar (solo owner)
     * @param to Dirección del destinatario
     * @param privateTokenURI URI del contrato de uso específico de esta placa solar
     * @return tokenId ID del token creado
     */
    function mint(address to, string memory privateTokenURI) public onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId();
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _privateTokenURIs[tokenId] = privateTokenURI;
        
        emit SolarPanelMinted(to, tokenId, privateTokenURI);
        
        return tokenId;
    }
    
    /**
     * @dev Mintea múltiples tokens en batch (solo owner)
     * @param recipients Array de direcciones destinatarias
     * @param privateTokenURIs Array de URIs de contratos de uso para cada token
     */
    function mintBatch(
        address[] calldata recipients, 
        string[] calldata privateTokenURIs
    ) external onlyOwner {
        require(recipients.length == privateTokenURIs.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            mint(recipients[i], privateTokenURIs[i]);
        }
    }
    
    /**
     * @dev Actualiza la URI fija para metadatos estándar (solo owner)
     * @param newTokenURI Nueva URI fija para todos los tokens
     */
    function setTokenURI(string calldata newTokenURI) external onlyOwner {
        _fixedTokenURI = newTokenURI;
        emit FixedTokenURIUpdated(newTokenURI);
    }
    
    /**
     * @dev Actualiza la información general del contrato (solo owner)
     * @param description Nueva descripción
     * @param companyName Nuevo nombre de empresa
     * @param website Nuevo website
     */
    function updateContractInfo(
        string calldata description,
        string calldata companyName,
        string calldata website
    ) external onlyOwner {
        _contractDescription = description;
        _companyName = companyName;
        _companyWebsite = website;
        emit ContractInfoUpdated(description, companyName, website);
    }
    
    /**
     * @dev Actualiza el contrato de uso privado de un token específico (solo owner)
     * @param tokenId ID del token
     * @param privateTokenURI Nuevo URI del contrato de uso privado
     */
    function updatePrivateTokenURI(uint256 tokenId, string calldata privateTokenURI) external onlyOwner {
        require(exists(tokenId), "Token does not exist");
        _privateTokenURIs[tokenId] = privateTokenURI;
        emit PrivateTokenURIUpdated(tokenId, privateTokenURI);
    }
    
    // Funciones de lectura (view functions)
    
    /**
     * @dev Retorna el contrato de uso privado de un token específico
     * @param tokenId ID del token
     * @return URI del contrato de uso privado
     */
    function getPrivateTokenURI(uint256 tokenId) external view returns (string memory) {
        require(exists(tokenId), "Token does not exist");
        return _privateTokenURIs[tokenId];
    }
    
    /**
     * @dev Retorna información general del contrato
     * @return description Descripción del contrato
     * @return companyName Nombre de la empresa
     * @return website Website de la empresa
     */
    function getContractInfo() external view returns (
        string memory description,
        string memory companyName,
        string memory website
    ) {
        return (_contractDescription, _companyName, _companyWebsite);
    }
    
    /**
     * @dev Retorna el total de tokens minteados
     * @return Número total de tokens
     */
    function totalSupply() external view returns (uint256) {
          return _tokenIdCounter - 1; // -1 porque empiezas en 1
    }
    
    /**
     * @dev Retorna el próximo token ID que será minteado
     * @return Próximo token ID
     */
    function nextTokenId() public view returns (uint256) {
           return _tokenIdCounter;
    }
    
    /**
     * @dev Verifica si un token existe
     * @param tokenId ID del token a verificar
     * @return true si el token existe
     */
    function exists(uint256 tokenId) public view returns (bool) {
        try this.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * @dev Retorna los tokens propiedad de una dirección
     * @param owner Dirección del propietario
     * @return Array de token IDs
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i < _tokenIdCounter; i++) {
            if (exists(i) && ownerOf(i) == owner) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return tokenIds;
    }
    /**
     * @dev Retorna la URI del token (metadatos estándar - igual para todos)
     * @param tokenId ID del token
     * @return URI fija para metadatos estándar
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(exists(tokenId), "ERC721: URI query for nonexistent token");
        return _fixedTokenURI;
    }
}