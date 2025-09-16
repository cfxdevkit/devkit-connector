#!/usr/bin/env node

/**
 * Example usage of @conflux-local/node library
 * 
 * This demonstrates how to use the conflux-local-node package
 * as an importable library in another project.
 */

import { ConfluxNode } from '@conflux-local/node';
import chalk from 'chalk';

async function main() {
  console.log(chalk.blue('🚀 Example: Using @conflux-local/node as a library'));
  
  const node = new ConfluxNode();
  
  try {
    // Start the node with custom configuration
    console.log(chalk.blue('📡 Starting Conflux node...'));
    await node.start({
      walletMode: 'mnemonic',
      walletCount: 3,
      fundWallets: true,
      silent: true, // Disable verbose output
    });
    
    console.log(chalk.green('✅ Node started successfully!'));
    
    // Get node status
    const status = await node.getStatus();
    console.log(chalk.cyan('\n📊 Node Status:'));
    console.log(`   Running: ${status.running}`);
    console.log(`   Chain ID: ${status.chainId}`);
    console.log(`   Block Number: ${status.blockNumber}`);
    console.log(`   Wallet Mode: ${status.walletMode}`);
    console.log(`   Wallet Count: ${status.wallets?.length || 0}`);
    
    // Display wallets
    if (status.wallets && status.wallets.length > 0) {
      console.log(chalk.cyan('\n🔑 Generated Wallets:'));
      status.wallets.forEach((wallet, index) => {
        const isMining = wallet.isMining ? ' ⛏️' : '';
        const balance = wallet.balance ? ` (${wallet.balance} ETH)` : '';
        console.log(chalk.green(`   ${index}: ${wallet.address}${isMining}${balance}`));
      });
    }
    
    // Test EVM client
    const evmClient = node.getEvmClient();
    if (evmClient) {
      console.log(chalk.cyan('\n🔗 Testing EVM Client:'));
      try {
        const blockNumber = await evmClient.getBlockNumber();
        console.log(`   Current block: ${blockNumber}`);
        
        const chainId = await evmClient.getChainId();
        console.log(`   Chain ID: ${chainId}`);
      } catch (error) {
        console.log(chalk.red(`   Error: ${error.message}`));
      }
    }
    
    // Test Core client
    const coreClient = node.getCoreClient();
    if (coreClient) {
      console.log(chalk.cyan('\n🔗 Testing Core Client:'));
      try {
        const coreStatus = await coreClient.getStatus();
        console.log(`   Core Chain ID: ${coreStatus.chainId}`);
        console.log(`   Block Number: ${coreStatus.blockNumber}`);
      } catch (error) {
        console.log(chalk.red(`   Error: ${error.message}`));
      }
    }
    
    console.log(chalk.green('\n✅ Example completed successfully!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Example failed:'), error);
  } finally {
    // Clean up
    console.log(chalk.blue('\n🧹 Cleaning up...'));
    await node.stop();
    console.log(chalk.green('✅ Node stopped'));
  }
}

// Run the example
main().catch(console.error);
