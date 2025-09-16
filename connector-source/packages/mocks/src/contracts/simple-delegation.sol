// Simple Delegation Contract Mock
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleDelegation {
    struct Delegation {
        address delegate;
        uint256 limit;
        bool active;
        uint256 createdAt;
    }
    
    mapping(address => Delegation) public delegations;
    address public owner;
    
    event DelegationCreated(address indexed delegator, address indexed delegate, uint256 limit);
    event DelegationRevoked(address indexed delegator);
    
    constructor() {
        owner = msg.sender;
    }
    
    function createDelegation(address _delegate, uint256 _limit) external {
        require(_delegate != address(0), "Invalid delegate");
        require(_limit > 0, "Limit must be positive");
        
        delegations[msg.sender] = Delegation({
            delegate: _delegate,
            limit: _limit,
            active: true,
            createdAt: block.timestamp
        });
        
        emit DelegationCreated(msg.sender, _delegate, _limit);
    }
    
    function revokeDelegation() external {
        require(delegations[msg.sender].active, "No active delegation");
        
        delegations[msg.sender].active = false;
        emit DelegationRevoked(msg.sender);
    }
    
    function getDelegation(address _delegator) external view returns (Delegation memory) {
        return delegations[_delegator];
    }
}
