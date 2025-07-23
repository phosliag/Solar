// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20CappedUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract SecurityToken is Initializable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable,
    ERC20CappedUpgradeable,
    AccessControlUpgradeable
{
    /// @notice No interfiere la inicialización con el upgrade layout ya que es completamente seguro en contratos upgradeables.Es la forma recomendada por OpenZeppelin para definir roles en AccessControl.
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    string public isin;
    string public instrumentType;
    string public jurisdiction;

    mapping(address => bool) public whitelist;
    mapping(address => bool) public blacklist;

    struct TransactionRecord {
        uint256 id;
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(uint256 => TransactionRecord) private _transactionRecords;
    uint256 public transactionCount;

    function initialize(
        string memory name,
        string memory symbol,
        uint256 cap,
        string memory _isin,
        string memory _instrumentType,
        string memory _jurisdiction,
        address admin
    ) public virtual initializer {
        require(admin != address(0), "Admin address cannot be zero");

        __ERC20_init(name, symbol);
        __ERC20Burnable_init();
        __ERC20Pausable_init();
        __ERC20Capped_init(cap);
        __AccessControl_init();

        isin = _isin;
        instrumentType = _instrumentType;
        jurisdiction = _jurisdiction;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function addToWhitelist(address account) external onlyRole(ADMIN_ROLE) {
        whitelist[account] = true;
    }

    function removeFromWhitelist(address account) external onlyRole(ADMIN_ROLE) {
        whitelist[account] = false;
    }

    function addToBlacklist(address account) external onlyRole(ADMIN_ROLE) {
        blacklist[account] = true;
    }

    function removeFromBlacklist(address account) external onlyRole(ADMIN_ROLE) {
        blacklist[account] = false;
    }

    function revertTransaction(uint256 transactionId) external onlyRole(ADMIN_ROLE) {
        TransactionRecord memory record = _transactionRecords[transactionId];
        require(record.from != address(0) && record.to != address(0), "Invalid transaction record");

        _transfer(record.to, record.from, record.amount);
    }

    function getTransactionRecord(uint256 id) external view returns (TransactionRecord memory) {
        return _transactionRecords[id];
    }

    function _update(address from, address to, uint256 amount)
        internal
        override(ERC20Upgradeable, ERC20PausableUpgradeable, ERC20CappedUpgradeable)
    {
        require(!paused(), "ERC20Pausable: token transfer while paused");

        if (from != address(0)) {
            require(whitelist[from], "Sender is not whitelisted");
            require(!blacklist[from], "Sender is blacklisted");
        }

        if (to != address(0)) {
            require(whitelist[to], "Recipient is not whitelisted");
            require(!blacklist[to], "Recipient is blacklisted");
        }

        transactionCount += 1;
        _transactionRecords[transactionCount] = TransactionRecord({
            id: transactionCount,
            from: from,
            to: to,
            amount: amount,
            timestamp: block.timestamp
        });

        super._update(from, to, amount);
    }

}