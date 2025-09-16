#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { NodeManager } from './NodeManager';
import { ContractDeployer } from './ContractDeployer';
import { TestRunner } from './TestRunner';

const program = new Command();
const nodeManager = new NodeManager();
const contractDeployer = new ContractDeployer();
const testRunner = new TestRunner();

program
  .name('conflux-node-manager')
  .description('Local Conflux node management for development and testing')
  .version('1.0.0');

program
  .command('start')
  .description('Start local Conflux node')
  .option('-p, --port <port>', 'RPC port for Core space', '12537')
  .option('-e, --eth-port <port>', 'RPC port for EVM space', '8545')
  .option('-i, --interval <ms>', 'Block generation interval in ms', '1000')
  .option('-c, --config <file>', 'Configuration file path')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🚀 Starting Conflux node...'));
      await nodeManager.start(options);
      console.log(chalk.green('✅ Node started successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to start node:'), error);
      process.exit(1);
    }
  });

program
  .command('stop')
  .description('Stop local Conflux node')
  .action(async () => {
    try {
      console.log(chalk.blue('🛑 Stopping Conflux node...'));
      await nodeManager.stop();
      console.log(chalk.green('✅ Node stopped successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to stop node:'), error);
      process.exit(1);
    }
  });

program
  .command('dev')
  .description('Start development environment with auto-reload')
  .option('-p, --port <port>', 'RPC port for Core space', '12537')
  .option('-e, --eth-port <port>', 'RPC port for EVM space', '8545')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🔧 Starting development environment...'));
      await nodeManager.startDev(options);
    } catch (error) {
      console.error(chalk.red('❌ Failed to start dev environment:'), error);
      process.exit(1);
    }
  });

program
  .command('deploy')
  .description('Deploy contracts to local node')
  .option('-n, --network <network>', 'Network to deploy to (espace|core|both)', 'both')
  .option('-p, --port <port>', 'RPC port for Core space', '12537')
  .option('-e, --eth-port <port>', 'RPC port for EVM space', '8545')
  .action(async (options) => {
    try {
      console.log(chalk.blue('📦 Deploying contracts...'));
      await contractDeployer.deploy(options);
      console.log(chalk.green('✅ Contracts deployed successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to deploy contracts:'), error);
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Run contract tests against local node')
  .option('-n, --network <network>', 'Network to test (espace|core|both)', 'both')
  .option('-p, --port <port>', 'RPC port for Core space', '12537')
  .option('-e, --eth-port <port>', 'RPC port for EVM space', '8545')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🧪 Running contract tests...'));
      await testRunner.runTests(options);
      console.log(chalk.green('✅ Tests completed successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Tests failed:'), error);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Check node status')
  .action(async () => {
    try {
      const status = await nodeManager.getStatus();
      console.log(chalk.blue('📊 Node Status:'));
      console.log(JSON.stringify(status, null, 2));
    } catch (error) {
      console.error(chalk.red('❌ Failed to get status:'), error);
      process.exit(1);
    }
  });

program
  .command('reset')
  .description('Reset local node data')
  .action(async () => {
    try {
      console.log(chalk.blue('🔄 Resetting node data...'));
      await nodeManager.reset();
      console.log(chalk.green('✅ Node data reset successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to reset node:'), error);
      process.exit(1);
    }
  });

program.parse();
