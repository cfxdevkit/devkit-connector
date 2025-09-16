// Wallet Modes Demo Script
// This script demonstrates both mnemonic and private key wallet modes

import { formatEther } from "viem";

export default async function walletModesDemo(node) {
  console.log("🔑 Wallet Modes Demo Starting...");

  // Get wallet manager
  const walletManager = node.getWalletManager();
  if (!walletManager) {
    throw new Error("Wallet manager not available");
  }

  // Get node status
  const status = await node.getStatus();
  console.log(`\n📊 Node Configuration:`);
  console.log(`   Wallet Mode: ${status.walletMode}`);
  console.log(`   Mining Address: ${status.miningAddress}`);
  console.log(`   Total Wallets: ${status.wallets?.length || 0}`);

  // Display wallet information based on mode
  if (status.walletMode === "mnemonic") {
    console.log(`\n🔑 Mnemonic Mode - Multiple Wallets:`);
    console.log(
      `   Mnemonic: ${
        walletManager.getMnemonic() || "Using default test mnemonic"
      }`
    );
    console.log(`   Wallet Count: ${status.wallets?.length || 0}`);

    // Show first few wallets
    const wallets = node.getWallets();
    console.log(`\n📋 First 5 Wallets:`);
    wallets.slice(0, 5).forEach((wallet, index) => {
      const isMining = wallet.isMining ? " ⛏️" : "";
      const balance = wallet.balance ? ` (${wallet.balance} CFX)` : "";
      console.log(`   ${index}: ${wallet.address}${isMining}${balance}`);
    });

    if (wallets.length > 5) {
      console.log(`   ... and ${wallets.length - 5} more wallets`);
    }

    // Test creating a new wallet
    try {
      const newWallet = walletManager.createNewWallet();
      console.log(`\n➕ Created new wallet: ${newWallet.address}`);
    } catch (error) {
      console.log(`\n❌ Cannot create new wallet: ${error.message}`);
    }
  } else if (status.walletMode === "privatekey") {
    console.log(`\n🔑 Private Key Mode - Single Wallet:`);
    console.log(
      `   Private Key: ${walletManager.getPrivateKey()?.substring(0, 10)}...`
    );
    console.log(`   Wallet Count: 1`);

    const miningWallet = node.getMiningWallet();
    if (miningWallet) {
      console.log(`\n📋 Mining Wallet:`);
      console.log(`   Address: ${miningWallet.address}`);
      console.log(
        `   Private Key: ${miningWallet.privateKey.substring(0, 10)}...`
      );
      console.log(`   Balance: ${miningWallet.balance || "Unknown"} CFX`);
    }
  }

  // Test wallet operations
  console.log(`\n🧪 Testing Wallet Operations:`);

  // Test getting wallet by index
  const firstWallet = node.getWallets()[0];
  if (firstWallet) {
    console.log(`   ✅ First wallet: ${firstWallet.address}`);

    // Test getting wallet by address
    const foundWallet = node.getWalletByAddress(firstWallet.address);
    console.log(`   ✅ Found wallet by address: ${foundWallet ? "Yes" : "No"}`);
  }

  // Test with different clients
  console.log(`\n🔗 Testing with Clients:`);

  // EVM Client test
  const evmClient = node.getEvmClient();
  if (evmClient && firstWallet) {
    try {
      const balance = await evmClient.getBalance(firstWallet.address);
      console.log(`   EVM Balance: ${ethers.formatEther(balance)} ETH`);
    } catch (error) {
      console.log(`   EVM Error: ${error.message}`);
    }
  }

  // Core Client test
  const coreClient = node.getCoreClient();
  if (coreClient) {
    try {
      const coreStatus = await coreClient.getStatus();
      console.log(`   Core Chain ID: ${coreStatus.chainId}`);
      console.log(`   Core Block: ${coreStatus.blockNumber}`);
    } catch (error) {
      console.log(`   Core Error: ${error.message}`);
    }
  }

  // Export wallet data
  console.log(`\n📤 Wallet Export:`);
  const exportData = walletManager.exportWallets();
  console.log(`   Mode: ${exportData.mode}`);
  console.log(`   Wallet Count: ${exportData.wallets.length}`);

  if (exportData.mnemonic) {
    console.log(`   Mnemonic: ${exportData.mnemonic.substring(0, 20)}...`);
  }

  if (exportData.privateKey) {
    console.log(`   Private Key: ${exportData.privateKey.substring(0, 10)}...`);
  }

  console.log(`\n✅ Wallet Modes Demo Complete!`);

  return {
    mode: status.walletMode,
    miningAddress: status.miningAddress,
    walletCount: status.wallets?.length || 0,
    wallets:
      status.wallets?.map((w) => ({
        index: w.index,
        address: w.address,
        isMining: w.isMining,
        balance: w.balance,
      })) || [],
  };
}
