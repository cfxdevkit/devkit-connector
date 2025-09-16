#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { WalletManager } from './commands/wallet';
import { DatabaseManager } from './commands/database';
import { ContractManager } from './commands/contracts';

const program = new Command();

program
  .name('conflux-wallet')
  .description('CLI tools for Conflux Dual Wallet System')
  .version('1.0.0');

// Wallet commands
program
  .command('wallet')
  .description('Wallet management commands')
  .option('-m, --mode <mode>', 'Wallet mode (server-managed|user-delegated)')
  .action(async (options) => {
    const spinner = ora('Managing wallet...').start();
    try {
      await WalletManager.handle(options);
      spinner.succeed('Wallet operation completed');
    } catch (error) {
      spinner.fail(`Wallet operation failed: ${error.message}`);
      process.exit(1);
    }
  });

// Database commands
program
  .command('db')
  .description('Database management commands')
  .option('-a, --action <action>', 'Action (migrate|seed|reset)')
  .action(async (options) => {
    const spinner = ora('Managing database...').start();
    try {
      await DatabaseManager.handle(options);
      spinner.succeed('Database operation completed');
    } catch (error) {
      spinner.fail(`Database operation failed: ${error.message}`);
      process.exit(1);
    }
  });

// Contract commands
program
  .command('contracts')
  .description('Contract management commands')
  .option('-a, --action <action>', 'Action (compile|deploy|test)')
  .option('-n, --network <network>', 'Network (mainnet|testnet)')
  .action(async (options) => {
    const spinner = ora('Managing contracts...').start();
    try {
      await ContractManager.handle(options);
      spinner.succeed('Contract operation completed');
    } catch (error) {
      spinner.fail(`Contract operation failed: ${error.message}`);
      process.exit(1);
    }
  });

// Global error handler
program.on('command:*', () => {
  console.error(chalk.red('Invalid command: %s'), program.args.join(' '));
  console.log(chalk.yellow('See --help for available commands'));
  process.exit(1);
});

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
