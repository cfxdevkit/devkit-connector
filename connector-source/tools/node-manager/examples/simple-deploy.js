#!/usr/bin/env node

/**
 * Example script: Deploy a simple contract
 * Usage: node examples/simple-deploy.js
 */

export default async function deploySimpleContract(node) {
  const { ethers } = await import('ethers');
  
  // Simple storage contract
  const contractCode = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.19;
    
    contract SimpleStorage {
        uint256 private value;
        address public owner;
        
        constructor() {
            owner = msg.sender;
        }
        
        function setValue(uint256 _value) public {
            value = _value;
        }
        
        function getValue() public view returns (uint256) {
            return value;
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
      "inputs": [],
      "name": "owner",
      "outputs": [{"internalType": "address", "name": "", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256", "name": "_value", "type": "uint256"}],
      "name": "setValue",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getValue",
      "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // Get EVM client
  const evmClient = node.getEvmClient();
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const wallet = new ethers.Wallet(
    '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    provider
  );

  // Deploy contract
  const factory = new ethers.ContractFactory(abi, contractCode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const txHash = contract.deploymentTransaction()?.hash || '';

  // Test the contract
  const initialValue = await contract.getValue();
  await contract.setValue(42);
  const newValue = await contract.getValue();

  return {
    contract: 'SimpleStorage',
    address,
    txHash,
    initialValue: initialValue.toString(),
    newValue: newValue.toString(),
    testPassed: newValue.toString() === '42'
  };
}

