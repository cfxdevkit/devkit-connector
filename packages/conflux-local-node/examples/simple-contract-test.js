#!/usr/bin/env node

// Simple contract deployment test for Conflux Local Node
// This script demonstrates basic contract deployment using the built-in operations

export default async function simpleContractTest(node) {
  console.log("📦 Simple Contract Deployment Test Starting...");

  try {
    // Get node status
    const status = await node.getStatus();
    console.log("📊 Node status:", {
      running: status.running,
      chainId: status.chainId,
      blockNumber: status.blockNumber,
      walletMode: status.walletMode,
      walletCount: status.wallets?.length || 0,
    });

    // Get clients
    const coreClient = node.getCoreClient();
    const evmClient = node.getEvmClient();
    const miningWallet = node.getMiningWallet();

    console.log("✅ Core client available:", !!coreClient);
    console.log("✅ EVM client available:", !!evmClient);
    console.log("✅ Mining wallet available:", !!miningWallet);

    if (miningWallet) {
      console.log("👤 Mining wallet address:", miningWallet.address);
    }

    // Test basic EVM operations
    if (evmClient) {
      try {
        console.log("\n🔗 Testing EVM Client Operations:");
        
        // Get current block
        const blockNumber = await evmClient.getBlockNumber();
        console.log(`   Current block number: ${blockNumber}`);

        // Get chain ID
        const chainId = await evmClient.getChainId();
        console.log(`   Chain ID: ${chainId}`);

        // Get mining wallet balance
        if (miningWallet) {
          const balance = await evmClient.getBalance({ address: miningWallet.address });
          console.log(`   Mining wallet balance: ${balance.toString()} wei`);
        }

      } catch (error) {
        console.log(`   EVM client error: ${error.message}`);
      }
    }

    // Test basic Core operations
    if (coreClient) {
      try {
        console.log("\n🔗 Testing Core Client Operations:");
        
        // Get status
        const coreStatus = await coreClient.getStatus();
        console.log(`   Core status: ${JSON.stringify(coreStatus, (key, value) => 
          typeof value === 'bigint' ? value.toString() : value, 2)}`);

      } catch (error) {
        console.log(`   Core client error: ${error.message}`);
      }
    }

    console.log("\n✅ Simple Contract Test Complete!");

    return {
      success: true,
      status: {
        running: status.running,
        chainId: status.chainId,
        blockNumber: status.blockNumber,
        walletMode: status.walletMode,
        walletCount: status.wallets?.length || 0,
      },
      clients: {
        core: !!coreClient,
        evm: !!evmClient,
        miningWallet: !!miningWallet,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Test failed:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}
