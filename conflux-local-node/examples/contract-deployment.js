#!/usr/bin/env node

// Contract deployment example for Conflux Local Node
// This script demonstrates how to deploy a simple contract

import { createWalletClient, http, formatEther } from "viem";

export default async function deployContract(node) {
  console.log("📦 Deploying simple contract...");

  try {
    // Simple storage contract
    const contractCode = `
      // SPDX-License-Identifier: MIT
      pragma solidity ^0.8.19;
      
      contract SimpleStorage {
          uint256 private value;
          address public owner;
          
          event ValueChanged(uint256 newValue);
          
          constructor() {
              owner = msg.sender;
          }
          
          function setValue(uint256 _value) public {
              require(msg.sender == owner, "Only owner can set value");
              value = _value;
              emit ValueChanged(_value);
          }
          
          function getValue() public view returns (uint256) {
              return value;
          }
          
          function getOwner() public view returns (address) {
              return owner;
          }
      }
    `;

    const abi = [
      {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "newValue",
            type: "uint256",
          },
        ],
        name: "ValueChanged",
        type: "event",
      },
      {
        inputs: [],
        name: "getOwner",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getValue",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "_value",
            type: "uint256",
          },
        ],
        name: "setValue",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];

    // Get EVM client and mining wallet
    const evmClient = node.getEvmClient();
    const miningWallet = node.getMiningWallet();

    if (!evmClient) {
      throw new Error("EVM client not available");
    }

    if (!miningWallet) {
      throw new Error("No mining wallet available");
    }

    console.log("👤 Deployer address:", miningWallet.address);

    // Create wallet client
    const walletClient = createWalletClient({
      account: miningWallet.privateKey,
      transport: http("http://127.0.0.1:8545"),
    });

    // Deploy contract
    console.log("🏗️  Deploying contract...");
    const hash = await walletClient.deployContract({
      abi,
      bytecode: contractCode,
      args: [],
    });

    // Wait for deployment
    const receipt = await evmClient.waitForTransactionReceipt({ hash });

    if (!receipt.contractAddress) {
      throw new Error("Contract deployment failed");
    }

    const address = receipt.contractAddress;
    const txHash = hash;

    console.log("✅ Contract deployed successfully!");
    console.log("📍 Address:", address);
    console.log("🔗 Transaction hash:", txHash);

    // Test contract functions
    console.log("🧪 Testing contract functions...");

    const owner = await evmClient.readContract({
      address,
      abi,
      functionName: "getOwner",
    });
    console.log("👤 Contract owner:", owner);

    const initialValue = await evmClient.readContract({
      address,
      abi,
      functionName: "getValue",
    });
    console.log("📊 Initial value:", initialValue.toString());

    // Set a new value
    console.log("✏️  Setting value to 42...");
    const setHash = await walletClient.writeContract({
      address,
      abi,
      functionName: "setValue",
      args: [42],
    });
    await evmClient.waitForTransactionReceipt({ hash: setHash });

    const newValue = await evmClient.readContract({
      address,
      abi,
      functionName: "getValue",
    });
    console.log("📊 New value:", newValue.toString());

    return {
      success: true,
      contract: {
        address,
        txHash,
        abi,
      },
      deployment: {
        owner,
        initialValue: initialValue.toString(),
        finalValue: newValue.toString(),
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Contract deployment failed:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}
