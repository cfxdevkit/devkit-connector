// Simple Delegation Contract for Conflux eSpace
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SimpleDelegationEspace is Ownable, ReentrancyGuard {
    struct Delegation {
        address delegate;
        uint256 limit;
        bool active;
        uint256 createdAt;
        uint256 lastUsed;
    }
    
    mapping(address => Delegation) public delegations;
    mapping(address => uint256) public usage;
    
    uint256 public constant MAX_DELEGATION_LIMIT = 1000 ether;
    uint256 public totalDelegations;
    
    event DelegationCreated(address indexed delegator, address indexed delegate, uint256 limit);
    event DelegationRevoked(address indexed delegator);
    event DelegationUsed(address indexed delegator, address indexed delegate, uint256 amount);
    
    constructor() {
        // eSpace specific initialization
    }
    
    function createDelegation(address _delegate, uint256 _limit) external nonReentrant {
        require(_delegate != address(0), "Invalid delegate");
        require(_limit > 0 && _limit <= MAX_DELEGATION_LIMIT, "Invalid limit");
        require(!delegations[msg.sender].active, "Delegation already exists");
        
        delegations[msg.sender] = Delegation({
            delegate: _delegate,
            limit: _limit,
            active: true,
            createdAt: block.timestamp,
            lastUsed: 0
        });
        
        totalDelegations++;
        emit DelegationCreated(msg.sender, _delegate, _limit);
    }
    
    function revokeDelegation() external {
        require(delegations[msg.sender].active, "No active delegation");
        
        delegations[msg.sender].active = false;
        totalDelegations--;
        emit DelegationRevoked(msg.sender);
    }
    
    function useDelegation(address _delegator, uint256 _amount) external {
        Delegation storage delegation = delegations[_delegator];
        require(delegation.active, "No active delegation");
        require(msg.sender == delegation.delegate, "Unauthorized delegate");
        require(usage[_delegator] + _amount <= delegation.limit, "Exceeds delegation limit");
        
        usage[_delegator] += _amount;
        delegation.lastUsed = block.timestamp;
        
        emit DelegationUsed(_delegator, msg.sender, _amount);
    }
    
    function getDelegation(address _delegator) external view returns (Delegation memory) {
        return delegations[_delegator];
    }
    
    function getUsage(address _delegator) external view returns (uint256) {
        return usage[_delegator];
    }
    
    function getRemainingLimit(address _delegator) external view returns (uint256) {
        Delegation memory delegation = delegations[_delegator];
        if (!delegation.active) return 0;
        return delegation.limit - usage[_delegator];
    }
}
