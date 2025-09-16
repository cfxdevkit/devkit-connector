#!/usr/bin/env node

/**
 * Example script: Complete delegation flow
 * Usage: node examples/delegation-flow.js
 */

export default async function delegationFlow(node) {
  const { ethers } = await import('ethers');
  
  // Delegation contract
  const contractCode = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.19;
    
    contract DelegationManager {
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
  `;

  const abi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "address", "name": "delegator", "type": "address"},
        {"indexed": true, "internalType": "address", "name": "delegate", "type": "address"},
        {"indexed": false, "internalType": "uint256", "name": "limit", "type": "uint256"}
      ],
      "name": "DelegationCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "address", "name": "delegator", "type": "address"}
      ],
      "name": "DelegationRevoked",
      "type": "event"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "_delegate", "type": "address"},
        {"internalType": "uint256", "name": "_limit", "type": "uint256"}
      ],
      "name": "createDelegation",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "_delegator", "type": "address"}],
      "name": "getDelegation",
      "outputs": [
        {
          "components": [
            {"internalType": "address", "name": "delegate", "type": "address"},
            {"internalType": "uint256", "name": "limit", "type": "uint256"},
            {"internalType": "bool", "name": "active", "type": "bool"},
            {"internalType": "uint256", "name": "createdAt", "type": "uint256"}
          ],
          "internalType": "struct DelegationManager.Delegation",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [{"internalType": "address", "name": "", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "revokeDelegation",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const wallet1 = new ethers.Wallet(
    '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    provider
  );
  const wallet2 = new ethers.Wallet(
    '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    provider
  );

  // Deploy contract
  const factory = new ethers.ContractFactory(abi, contractCode, wallet1);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deployTxHash = contract.deploymentTransaction()?.hash || '';

  // Connect both wallets to the contract
  const contract1 = new ethers.Contract(contractAddress, abi, wallet1);
  const contract2 = new ethers.Contract(contractAddress, abi, wallet2);

  // Test delegation flow
  const delegateAddress = wallet2.address;
  const delegationLimit = ethers.parseEther('1.0'); // 1 ETH

  // Create delegation
  const createTx = await contract1.createDelegation(delegateAddress, delegationLimit);
  await createTx.wait();

  // Get delegation
  const delegation = await contract1.getDelegation(wallet1.address);

  // Revoke delegation
  const revokeTx = await contract1.revokeDelegation();
  await revokeTx.wait();

  // Check revoked delegation
  const revokedDelegation = await contract1.getDelegation(wallet1.address);

  return {
    contract: 'DelegationManager',
    address: contractAddress,
    deployTxHash,
    delegator: wallet1.address,
    delegate: delegateAddress,
    limit: delegationLimit.toString(),
    delegation: {
      delegate: delegation.delegate,
      limit: delegation.limit.toString(),
      active: delegation.active,
      createdAt: delegation.createdAt.toString()
    },
    revokedDelegation: {
      delegate: revokedDelegation.delegate,
      limit: revokedDelegation.limit.toString(),
      active: revokedDelegation.active,
      createdAt: revokedDelegation.createdAt.toString()
    },
    testPassed: delegation.active && !revokedDelegation.active
  };
}

