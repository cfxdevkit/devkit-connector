#!/usr/bin/env node

// Operations test for Conflux Local Node
// This script demonstrates using ConfluxOperations for contract deployment

export default async function operationsTest(node) {
  console.log("🔧 ConfluxOperations Test Starting...");

  try {
    // Import ConfluxOperations (this will be available in the node context)
    const { ConfluxOperations } = await import('/usr/src/app/dist/ConfluxOperations.js');
    
    console.log("✅ ConfluxOperations imported successfully");

    // Test 1: Get block info
    console.log("\n📦 Testing getBlockInfo...");
    const blockResult = await ConfluxOperations.getBlockInfo(undefined, {
      evmPort: 8545,
    });
    
    if (blockResult.success) {
      console.log("✅ Block info retrieved:", {
        number: blockResult.data?.number?.toString(),
        hash: blockResult.data?.hash,
        timestamp: blockResult.data?.timestamp?.toString(),
      });
    } else {
      console.log("❌ Block info failed:", blockResult.error);
    }

    // Test 2: Send a simple transaction
    console.log("\n💸 Testing sendTransaction...");
    const miningWallet = node.getMiningWallet();
    
    if (miningWallet) {
      const txResult = await ConfluxOperations.sendTransaction(
        miningWallet.address, // Send to self
        "1000000000000000000", // 1 ETH in wei
        "0x", // No data
        { evmPort: 8545 }
      );
      
      if (txResult.success) {
        console.log("✅ Transaction sent:", {
          txHash: txResult.data?.txHash,
          receipt: txResult.data?.receipt ? "Present" : "Missing",
        });
      } else {
        console.log("❌ Transaction failed:", txResult.error);
      }
    } else {
      console.log("⚠️  No mining wallet available for transaction test");
    }

    console.log("\n✅ ConfluxOperations Test Complete!");

    return {
      success: true,
      tests: {
        blockInfo: blockResult.success,
        transaction: miningWallet ? (txResult?.success || false) : null,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Operations test failed:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}
