// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title DelegationManager
 * @dev Manages wallet delegation for Conflux eSpace (EVM-compatible)
 * @author Conflux Dual Wallet Team
 */
contract DelegationManager is ReentrancyGuard, Ownable, Pausable {
    using ECDSA for bytes32;

    constructor() Ownable(msg.sender) {}

    // Events
    event DelegationCreated(
        address indexed delegator,
        address indexed delegate,
        uint256 indexed delegationId,
        uint256 expiresAt,
        uint256 dailyLimit,
        uint256 perTxLimit
    );
    
    event DelegationRevoked(
        address indexed delegator,
        address indexed delegate,
        uint256 indexed delegationId
    );
    
    event TransactionExecuted(
        address indexed delegate,
        address indexed to,
        uint256 value,
        bytes data,
        uint256 indexed delegationId
    );
    
    event LimitsUpdated(
        uint256 indexed delegationId,
        uint256 newDailyLimit,
        uint256 newPerTxLimit
    );

    // Structs
    struct Delegation {
        address delegator;
        address delegate;
        uint256 expiresAt;
        uint256 dailyLimit;
        uint256 perTxLimit;
        uint256 dailySpent;
        uint256 lastResetDay;
        bool isActive;
    }

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        uint256 nonce;
        uint256 deadline;
    }

    // State variables
    mapping(uint256 => Delegation) public delegations;
    mapping(address => uint256[]) public userDelegations;
    mapping(address => uint256) public nonces;
    mapping(bytes32 => bool) public usedHashes;
    
    uint256 public nextDelegationId = 1;
    uint256 public constant MAX_DELEGATION_DURATION = 365 days;
    uint256 public constant MIN_DELEGATION_DURATION = 1 hours;

    // Modifiers
    modifier onlyDelegate(uint256 delegationId) {
        require(
            delegations[delegationId].delegate == msg.sender,
            "DelegationManager: not authorized delegate"
        );
        require(
            delegations[delegationId].isActive,
            "DelegationManager: delegation not active"
        );
        _;
    }

    modifier validDelegation(uint256 delegationId) {
        require(
            delegations[delegationId].delegator != address(0),
            "DelegationManager: delegation does not exist"
        );
        _;
    }


    /**
     * @dev Create a new delegation
     * @param delegate Address of the delegate
     * @param duration Duration of delegation in seconds
     * @param dailyLimit Daily spending limit in wei
     * @param perTxLimit Per-transaction limit in wei
     */
    function createDelegation(
        address delegate,
        uint256 duration,
        uint256 dailyLimit,
        uint256 perTxLimit
    ) external whenNotPaused returns (uint256) {
        require(delegate != address(0), "DelegationManager: invalid delegate");
        require(delegate != msg.sender, "DelegationManager: cannot delegate to self");
        require(
            duration >= MIN_DELEGATION_DURATION && duration <= MAX_DELEGATION_DURATION,
            "DelegationManager: invalid duration"
        );
        require(dailyLimit > 0, "DelegationManager: daily limit must be > 0");
        require(perTxLimit > 0, "DelegationManager: per-tx limit must be > 0");
        require(perTxLimit <= dailyLimit, "DelegationManager: per-tx limit exceeds daily limit");

        uint256 delegationId = nextDelegationId++;
        uint256 expiresAt = block.timestamp + duration;

        delegations[delegationId] = Delegation({
            delegator: msg.sender,
            delegate: delegate,
            expiresAt: expiresAt,
            dailyLimit: dailyLimit,
            perTxLimit: perTxLimit,
            dailySpent: 0,
            lastResetDay: block.timestamp / 1 days,
            isActive: true
        });

        userDelegations[msg.sender].push(delegationId);
        userDelegations[delegate].push(delegationId);

        emit DelegationCreated(
            msg.sender,
            delegate,
            delegationId,
            expiresAt,
            dailyLimit,
            perTxLimit
        );

        return delegationId;
    }

    /**
     * @dev Revoke a delegation
     * @param delegationId ID of the delegation to revoke
     */
    function revokeDelegation(uint256 delegationId) 
        external 
        validDelegation(delegationId) 
    {
        Delegation storage delegation = delegations[delegationId];
        require(
            delegation.delegator == msg.sender || delegation.delegate == msg.sender,
            "DelegationManager: not authorized to revoke"
        );

        delegation.isActive = false;

        emit DelegationRevoked(
            delegation.delegator,
            delegation.delegate,
            delegationId
        );
    }

    /**
     * @dev Execute a transaction through delegation
     * @param delegationId ID of the delegation
     * @param transaction Transaction details
     * @param signature Signature from the delegator
     */
    function executeTransaction(
        uint256 delegationId,
        Transaction calldata transaction,
        bytes calldata signature
    ) external 
        onlyDelegate(delegationId)
        validDelegation(delegationId)
        nonReentrant
        whenNotPaused
    {
        Delegation storage delegation = delegations[delegationId];
        
        require(
            block.timestamp <= delegation.expiresAt,
            "DelegationManager: delegation expired"
        );
        require(
            block.timestamp <= transaction.deadline,
            "DelegationManager: transaction deadline passed"
        );
        require(
            transaction.value <= delegation.perTxLimit,
            "DelegationManager: transaction exceeds per-tx limit"
        );

        // Reset daily spending if it's a new day
        uint256 currentDay = block.timestamp / 1 days;
        if (currentDay > delegation.lastResetDay) {
            delegation.dailySpent = 0;
            delegation.lastResetDay = currentDay;
        }

        require(
            delegation.dailySpent + transaction.value <= delegation.dailyLimit,
            "DelegationManager: transaction exceeds daily limit"
        );

        // Verify signature
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                delegationId,
                transaction.to,
                transaction.value,
                transaction.data,
                transaction.nonce,
                transaction.deadline,
                address(this)
            )
        );
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        
        require(
            ECDSA.recover(ethSignedMessageHash, signature) == delegation.delegator,
            "DelegationManager: invalid signature"
        );

        // Check nonce
        require(
            transaction.nonce == nonces[delegation.delegator]++,
            "DelegationManager: invalid nonce"
        );

        // Check for replay attacks
        bytes32 txHash = keccak256(
            abi.encodePacked(
                delegationId,
                transaction.to,
                transaction.value,
                transaction.data,
                transaction.nonce
            )
        );
        require(!usedHashes[txHash], "DelegationManager: transaction already executed");
        usedHashes[txHash] = true;

        // Update daily spent
        delegation.dailySpent += transaction.value;

        // Execute transaction
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "DelegationManager: transaction execution failed");

        emit TransactionExecuted(
            msg.sender,
            transaction.to,
            transaction.value,
            transaction.data,
            delegationId
        );
    }

    /**
     * @dev Update delegation limits
     * @param delegationId ID of the delegation
     * @param newDailyLimit New daily limit
     * @param newPerTxLimit New per-transaction limit
     */
    function updateLimits(
        uint256 delegationId,
        uint256 newDailyLimit,
        uint256 newPerTxLimit
    ) external validDelegation(delegationId) {
        Delegation storage delegation = delegations[delegationId];
        require(
            delegation.delegator == msg.sender,
            "DelegationManager: not authorized to update limits"
        );
        require(newDailyLimit > 0, "DelegationManager: daily limit must be > 0");
        require(newPerTxLimit > 0, "DelegationManager: per-tx limit must be > 0");
        require(newPerTxLimit <= newDailyLimit, "DelegationManager: per-tx limit exceeds daily limit");

        delegation.dailyLimit = newDailyLimit;
        delegation.perTxLimit = newPerTxLimit;

        emit LimitsUpdated(delegationId, newDailyLimit, newPerTxLimit);
    }

    /**
     * @dev Get delegation details
     * @param delegationId ID of the delegation
     * @return delegation Delegation struct
     */
    function getDelegation(uint256 delegationId) 
        external 
        view 
        validDelegation(delegationId) 
        returns (Delegation memory) 
    {
        return delegations[delegationId];
    }

    /**
     * @dev Get user's delegations
     * @param user Address of the user
     * @return delegationIds Array of delegation IDs
     */
    function getUserDelegations(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userDelegations[user];
    }

    /**
     * @dev Check if a transaction can be executed
     * @param delegationId ID of the delegation
     * @param value Transaction value
     * @return canExecute Whether the transaction can be executed
     * @return reason Reason if cannot execute
     */
    function canExecuteTransaction(uint256 delegationId, uint256 value) 
        external 
        view 
        validDelegation(delegationId) 
        returns (bool canExecute, string memory reason) 
    {
        Delegation memory delegation = delegations[delegationId];
        
        if (!delegation.isActive) {
            return (false, "Delegation not active");
        }
        
        if (block.timestamp > delegation.expiresAt) {
            return (false, "Delegation expired");
        }
        
        if (value > delegation.perTxLimit) {
            return (false, "Exceeds per-transaction limit");
        }
        
        uint256 currentDay = block.timestamp / 1 days;
        uint256 dailySpent = currentDay > delegation.lastResetDay ? 0 : delegation.dailySpent;
        
        if (dailySpent + value > delegation.dailyLimit) {
            return (false, "Exceeds daily limit");
        }
        
        return (true, "");
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Receive function to accept ETH
    receive() external payable {}
}
