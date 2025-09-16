#!/usr/bin/env node

// Simple test script for Conflux Local Node
// This script demonstrates basic functionality

export default async function simpleTest(node) {
  console.log("🧪 Running simple test...");

  try {
    // Get node status
    const status = await node.getStatus();
    console.log("📊 Node status:", status);

    // Get clients
    const coreClient = node.getCoreClient();
    const evmClient = node.getEvmClient();

    console.log("✅ Core client available:", !!coreClient);
    console.log("✅ EVM client available:", !!evmClient);

    // Test EVM client
    if (evmClient) {
      try {
        const blockNumber = await evmClient.getBlockNumber();
        console.log("📦 Current block number:", blockNumber.toString());
      } catch (error) {
        console.log("⚠️  EVM client test failed:", error.message);
      }
    }

    // Test Core client
    if (coreClient) {
      try {
        const coreStatus = await coreClient.getStatus();
        console.log("🔗 Core status:", coreStatus);
      } catch (error) {
        console.log("⚠️  Core client test failed:", error.message);
      }
    }

    return {
      success: true,
      status,
      timestamp: new Date().toISOString(),
      message: "Simple test completed successfully",
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
