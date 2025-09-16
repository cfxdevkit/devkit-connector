// Wallet Demo Script
// This script demonstrates the wallet functionality of the Conflux Local Node

import { formatEther } from "viem";

export default async function walletDemo(node) {
  console.log("🔑 Wallet Demo Starting...");

  // Get wallet manager
  const walletManager = node.getWalletManager();
  if (!walletManager) {
    throw new Error("Wallet manager not available");
  }

  // Get node status with wallet info
  const status = await node.getStatus();
  console.log(`\n📊 Node Status:`);
  console.log(`   Wallet Mode: ${status.walletMode}`);
  console.log(`   Mining Address: ${status.miningAddress}`);
  console.log(`   Total Wallets: ${status.wallets?.length || 0}`);

  // Display all wallets
  console.log(`\n🔑 Wallets:`);
  const wallets = node.getWallets();
  wallets.forEach((wallet, index) => {
    const isMining = wallet.isMining ? " ⛏️" : "";
    const balance = wallet.balance ? ` (${wallet.balance} CFX)` : "";
    console.log(`   ${index}: ${wallet.address}${isMining}${balance}`);
  });

  // Get mining wallet
  const miningWallet = node.getMiningWallet();
  if (miningWallet) {
    console.log(`\n⛏️  Mining Wallet:`);
    console.log(`   Address: ${miningWallet.address}`);
    console.log(`   Private Key: ${miningWallet.privateKey}`);
    console.log(`   Balance: ${miningWallet.balance || "Unknown"} CFX`);
  }

  // Test wallet operations
  console.log(`\n🧪 Testing Wallet Operations:`);

  // Get wallet by address
  if (wallets.length > 0) {
    const firstWallet = wallets[0];
    const foundWallet = node.getWalletByAddress(firstWallet.address);
    console.log(`   Found wallet by address: ${foundWallet ? "✅" : "❌"}`);
  }

  // Create new wallet (if in mnemonic mode)
  if (walletManager.getWalletMode() === "mnemonic") {
    try {
      const newWallet = walletManager.createNewWallet();
      console.log(`   Created new wallet: ${newWallet.address}`);
    } catch (error) {
      console.log(`   Cannot create new wallet: ${error.message}`);
    }
  }

  // Export wallet information
  const walletExport = walletManager.exportWallets();
  console.log(`\n📤 Wallet Export:`);
  console.log(`   Mode: ${walletExport.mode}`);
  console.log(`   Mnemonic: ${walletExport.mnemonic ? "Set" : "Not set"}`);
  console.log(`   Private Key: ${walletExport.privateKey ? "Set" : "Not set"}`);
  console.log(`   Wallet Count: ${walletExport.wallets.length}`);

  // Test with EVM client
  console.log(`\n🔗 Testing with EVM Client:`);
  const evmClient = node.getEvmClient();
  if (evmClient) {
    try {
      const network = await evmClient.getNetwork();
      console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})`);

      // Get balance of first wallet
      if (wallets.length > 0) {
        const balance = await evmClient.getBalance({
          address: wallets[0].address,
        });
        console.log(`   First wallet balance: ${formatEther(balance)} ETH`);
      }
    } catch (error) {
      console.log(`   EVM client error: ${error.message}`);
    }
  }

  // Test with Core client
  console.log(`\n🔗 Testing with Core Client:`);
  const coreClient = node.getCoreClient();
  if (coreClient) {
    try {
      const status = await coreClient.getStatus();
      console.log(`   Chain ID: ${status.chainId}`);
      console.log(`   Block Number: ${status.blockNumber}`);
      console.log(`   Peer Count: ${status.peerCount}`);
    } catch (error) {
      console.log(`   Core client error: ${error.message}`);
    }
  }

  console.log(`\n✅ Wallet Demo Complete!`);

  return {
    walletMode: status.walletMode,
    miningAddress: status.miningAddress,
    walletCount: wallets.length,
    wallets: wallets.map((w) => ({
      index: w.index,
      address: w.address,
      isMining: w.isMining,
      balance: w.balance,
    })),
  };
}
