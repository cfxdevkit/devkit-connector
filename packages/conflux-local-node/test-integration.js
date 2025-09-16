#!/usr/bin/env node

// Integration test script that starts node, tests wallets, and deploys contracts
// This runs everything in a single process to avoid container isolation issues

import { ConfluxNode } from "./dist/ConfluxNode.js";
import chalk from "chalk";

async function integrationTest() {
  console.log(chalk.blue("🚀 Starting Integration Test..."));

  const node = new ConfluxNode();

  try {
    // Start the node with wallet configuration
    console.log(chalk.blue("📡 Starting Conflux node with wallets..."));
    await node.start({
      corePort: 12537,
      evmPort: 8545,
      blockInterval: 1000,
      walletMode: "mnemonic",
      walletCount: 5,
      fundWallets: true,
      silent: true, // Disable verbose node output
    });

    console.log(chalk.green("✅ Node started successfully!"));

    // Wait a moment for the node to fully initialize
    console.log(chalk.blue("⏳ Waiting for node to initialize..."));
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Test 1: Check node status and wallets
    console.log(chalk.blue("\n🔑 Testing Wallet Functionality:"));
    const status = await node.getStatus();
    console.log(`   Running: ${status.running}`);
    console.log(`   Chain ID: ${status.chainId}`);
    console.log(`   Block Number: ${status.blockNumber}`);
    console.log(`   Wallet Mode: ${status.walletMode}`);
    console.log(`   Wallet Count: ${status.wallets?.length || 0}`);
    console.log(`   Mining Address: ${status.miningAddress}`);

    // Display wallets
    if (status.wallets && status.wallets.length > 0) {
      console.log(chalk.cyan("\n📋 Generated Wallets:"));
      status.wallets.forEach((wallet, index) => {
        const isMining = wallet.isMining ? " ⛏️" : "";
        const balance = wallet.balance ? ` (${wallet.balance} ETH)` : "";
        console.log(
          chalk.green(`   ${index}: ${wallet.address}${isMining}${balance}`)
        );
      });
    }

    // Test 2: Validate wallet funding
    console.log(chalk.blue("\n💰 Testing Wallet Funding:"));
    const evmClient = node.getEvmClient();

    if (evmClient && status.wallets && status.wallets.length > 0) {
      let fundedWallets = 0;
      let totalEVMBalance = 0n;

      for (const wallet of status.wallets) {
        try {
          const balance = await evmClient.getBalance({
            address: wallet.address,
          });
          totalEVMBalance += balance;

          if (balance > 0n) {
            fundedWallets++;
            console.log(
              chalk.green(
                `   ✅ Wallet ${wallet.address}: ${balance.toString()} wei`
              )
            );
          } else {
            console.log(
              chalk.yellow(`   ⚠️  Wallet ${wallet.address}: No balance`)
            );
          }
        } catch (error) {
          console.log(
            chalk.red(`   ❌ Wallet ${wallet.address}: Error checking balance`)
          );
        }
      }

      console.log(
        chalk.cyan(
          `   📊 Summary: ${fundedWallets}/${status.wallets.length} wallets funded`
        )
      );
      console.log(
        chalk.cyan(`   💰 Total EVM Balance: ${totalEVMBalance.toString()} wei`)
      );
    }

    // Test 3: Test EVM client operations
    console.log(chalk.blue("\n🔗 Testing EVM Client:"));
    if (evmClient) {
      try {
        const blockNumber = await evmClient.getBlockNumber();
        console.log(`   Current block: ${blockNumber}`);

        const chainId = await evmClient.getChainId();
        console.log(`   Chain ID: ${chainId}`);

        if (status.miningAddress) {
          const balance = await evmClient.getBalance({
            address: status.miningAddress,
          });
          console.log(`   Mining wallet balance: ${balance.toString()} wei`);
        }
      } catch (error) {
        console.log(chalk.red(`   EVM error: ${error.message}`));
      }
    }

    // Test 4: Test Core client operations
    console.log(chalk.blue("\n🔗 Testing Core Client:"));
    const coreClient = node.getCoreClient();
    if (coreClient) {
      try {
        const coreStatus = await coreClient.getStatus();
        console.log(
          `   Core status: ${JSON.stringify(
            coreStatus,
            (key, value) =>
              typeof value === "bigint" ? value.toString() : value,
            2
          )}`
        );
      } catch (error) {
        console.log(chalk.red(`   Core error: ${error.message}`));
      }
    }

    // Test 5: Test direct operations using the existing node
    console.log(chalk.blue("\n🔧 Testing Direct Operations:"));

    // Test getBlockInfo using the existing node
    try {
      const blockNumber = await evmClient.getBlockNumber();
      const block = await evmClient.getBlock({ blockNumber });

      console.log(chalk.green("   ✅ getBlockInfo: Success"));
      console.log(`   Block number: ${block.number}`);
      console.log(`   Block hash: ${block.hash}`);
      console.log(`   Transaction count: ${block.transactions.length}`);
    } catch (error) {
      console.log(chalk.red(`   ❌ getBlockInfo error: ${error.message}`));
    }

    // Test sendTransaction using the existing node
    try {
      const miningWallet = node.getMiningWallet();
      if (miningWallet && evmClient) {
        // Create a simple transaction
        const { createWalletClient, http } = await import("viem");

        const walletClient = createWalletClient({
          account: miningWallet.privateKey,
          transport: http(`http://127.0.0.1:8545`),
        });

        // Send a small amount to another wallet
        const recipientWallet = status.wallets[1];
        if (recipientWallet) {
          const hash = await walletClient.sendTransaction({
            to: recipientWallet.address,
            value: 1000000000000000000n, // 1 ETH in wei
            chain: null,
          });

          // Wait for transaction
          const receipt = await evmClient.waitForTransactionReceipt({ hash });

          console.log(chalk.green("   ✅ sendTransaction: Success"));
          console.log(`   Transaction hash: ${hash}`);
          console.log(`   Gas used: ${receipt.gasUsed}`);
        }
      }
    } catch (error) {
      console.log(chalk.red(`   ❌ sendTransaction error: ${error.message}`));
    }

    // Test 6: Test contract deployment using the existing node
    console.log(chalk.blue("\n📦 Testing Contract Deployment:"));

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
              require(msg.sender == owner, "Only owner can set value");
              value = _value;
          }
          
          function getValue() public view returns (uint256) {
              return value;
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
        inputs: [],
        name: "getValue",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "_value", type: "uint256" }],
        name: "setValue",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];

    try {
      const miningWallet = node.getMiningWallet();
      if (miningWallet && evmClient) {
        const { createWalletClient, http } = await import("viem");

        const walletClient = createWalletClient({
          account: miningWallet.privateKey,
          transport: http(`http://127.0.0.1:8545`),
        });

        // Deploy contract
        console.log("   🏗️  Deploying contract...");
        const hash = await walletClient.deployContract({
          abi,
          bytecode: contractCode,
          args: [],
          chain: null,
        });

        // Wait for deployment
        const receipt = await evmClient.waitForTransactionReceipt({ hash });

        if (receipt.contractAddress) {
          console.log(chalk.green("   ✅ Contract deployment: Success"));
          console.log(`   Contract address: ${receipt.contractAddress}`);
          console.log(`   Transaction hash: ${hash}`);

          // Test contract interaction
          try {
            console.log("   🧪 Testing contract functions...");

            // Get initial value
            const initialValue = await evmClient.readContract({
              address: receipt.contractAddress,
              abi,
              functionName: "getValue",
            });
            console.log(`   Initial value: ${initialValue.toString()}`);

            // Set a new value
            const setHash = await walletClient.writeContract({
              address: receipt.contractAddress,
              abi,
              functionName: "setValue",
              args: [42],
              chain: null,
            });
            await evmClient.waitForTransactionReceipt({ hash: setHash });

            // Get new value
            const newValue = await evmClient.readContract({
              address: receipt.contractAddress,
              abi,
              functionName: "getValue",
            });
            console.log(`   New value: ${newValue.toString()}`);

            console.log(chalk.green("   ✅ Contract interaction: Success"));
          } catch (error) {
            console.log(
              chalk.red(`   ❌ Contract interaction error: ${error.message}`)
            );
          }
        } else {
          console.log(
            chalk.red("   ❌ Contract deployment failed: No contract address")
          );
        }
      }
    } catch (error) {
      console.log(
        chalk.red(`   ❌ Contract deployment error: ${error.message}`)
      );
    }

    console.log(chalk.green("\n✅ Integration Test Complete!"));

    return {
      success: true,
      status,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(chalk.red("❌ Integration test failed:"), error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  } finally {
    // Clean up
    console.log(chalk.blue("\n🧹 Cleaning up..."));
    await node.stop();
    console.log(chalk.green("✅ Node stopped"));
  }
}

// Run the test
integrationTest()
  .then((result) => {
    console.log(chalk.blue("\n📊 Final Result:"));
    console.log(
      JSON.stringify(
        result,
        (key, value) => (typeof value === "bigint" ? value.toString() : value),
        2
      )
    );
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error(chalk.red("❌ Fatal error:"), error);
    process.exit(1);
  });
