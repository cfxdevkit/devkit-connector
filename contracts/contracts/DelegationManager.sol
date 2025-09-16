// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DelegationManager
 * @dev Simple delegation contract for Conflux eSpace
 * @notice Allows users to delegate spending limits to other addresses
 */
contract DelegationManager is Ownable {
    struct Delegation {
        address delegate;
        uint256 limit;
        bool active;
        uint256 createdAt;
    }

    mapping(address => Delegation) public delegations;

    event DelegationCreated(address indexed delegator, address indexed delegate, uint256 limit);
    event DelegationRevoked(address indexed delegator);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create a delegation
     * @param _delegate The address to delegate to
     * @param _limit The spending limit in wei
     */
    function createDelegation(address _delegate, uint256 _limit) external {
        require(_delegate != address(0), "Invalid delegate address");
        require(_limit > 0, "Limit must be greater than 0");
        require(!delegations[msg.sender].active, "Delegation already exists");

        delegations[msg.sender] = Delegation({
            delegate: _delegate,
            limit: _limit,
            active: true,
            createdAt: block.timestamp
        });

        emit DelegationCreated(msg.sender, _delegate, _limit);
    }

    /**
     * @dev Revoke the current delegation
     */
    function revokeDelegation() external {
        require(delegations[msg.sender].active, "No active delegation");

        delegations[msg.sender].active = false;

        emit DelegationRevoked(msg.sender);
    }

    /**
     * @dev Get delegation information
     * @param _delegator The delegator address
     * @return The delegation struct
     */
    function getDelegation(address _delegator) external view returns (Delegation memory) {
        return delegations[_delegator];
    }

    /**
     * @dev Check if an address has an active delegation
     * @param _delegator The delegator address
     * @return True if has active delegation
     */
    function hasActiveDelegation(address _delegator) external view returns (bool) {
        return delegations[_delegator].active;
    }

    /**
     * @dev Get delegation count (for statistics)
     * @return Total number of delegations created
     */
    function getDelegationCount() external view returns (uint256) {
        // This is a simplified implementation
        // In a real contract, you'd track this properly
        return 0;
    }
}

