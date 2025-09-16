#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { ConfluxNodeWrapper, ConfluxOperations } from './ConfluxNodeWrapper';
import fs from 'fs-extra';
import path from 'path';

const program = new Command();

program
  .name('conflux-wrapper')
  .description('Silent Conflux node wrapper for ephemeral operations')
  .version('1.0.0');

// Execute script command
program
  .command('exec')
  .description('Execute a script with ephemeral node')
  .option('-s, --script <file>', 'Script file to execute')
  .option('-c, --core-port <port>', 'Core RPC port', '12537')
  .option('-e, --evm-port <port>', 'EVM RPC port', '8545')
  .option('-i, --interval <ms>', 'Block interval in ms', '1000')
  .option('-o, --output <file>', 'Output file for results')
  .action(async (options) => {
    try {
      if (!options.script) {
        console.error(chalk.red('❌ Script file is required'));
        process.exit(1);
      }

      const scriptPath = path.resolve(options.script);
      if (!await fs.pathExists(scriptPath)) {
        console.error(chalk.red(`❌ Script file not found: ${scriptPath}`));
        process.exit(1);
      }

      console.log(chalk.blue('🚀 Executing script with ephemeral node...'));

      const wrapper = new ConfluxNodeWrapper();
      
      // Load and execute script
      const scriptModule = await import(scriptPath);
      const scriptFunction = scriptModule.default || scriptModule.main || scriptModule.execute;
      
      if (typeof scriptFunction !== 'function') {
        console.error(chalk.red('❌ Script must export a function as default, main, or execute'));
        process.exit(1);
      }

      const result = await wrapper.executeScript(
        scriptFunction,
        {
          corePort: parseInt(options.corePort),
          evmPort: parseInt(options.evmPort),
          blockInterval: parseInt(options.interval),
          silent: true
        }
      );

      if (result.success) {
        console.log(chalk.green('✅ Script executed successfully!'));
        console.log(chalk.blue(`⏱️  Duration: ${result.duration}ms`));
        
        if (result.data) {
          const output = JSON.stringify(result.data, null, 2);
          console.log(chalk.cyan('📊 Result:'));
          console.log(output);
          
          if (options.output) {
            await fs.writeFile(options.output, output);
            console.log(chalk.blue(`💾 Result saved to: ${options.output}`));
          }
        }
      } else {
        console.error(chalk.red('❌ Script execution failed:'), result.error);
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('❌ Execution error:'), error);
      process.exit(1);
    }
  });

// Deploy contract command
program
  .command('deploy')
  .description('Deploy a contract with ephemeral node')
  .requiredOption('-c, --contract <file>', 'Contract file (Solidity)')
  .option('-a, --abi <file>', 'ABI file (JSON)')
  .option('-n, --name <name>', 'Contract name', 'Contract')
  .option('-p, --core-port <port>', 'Core RPC port', '12537')
  .option('-e, --evm-port <port>', 'EVM RPC port', '8545')
  .option('-o, --output <file>', 'Output file for deployment info')
  .action(async (options) => {
    try {
      const contractPath = path.resolve(options.contract);
      if (!await fs.pathExists(contractPath)) {
        console.error(chalk.red(`❌ Contract file not found: ${contractPath}`));
        process.exit(1);
      }

      const contractCode = await fs.readFile(contractPath, 'utf-8');
      
      // Simple ABI for basic contracts
      const abi = [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [{"internalType": "address", "name": "", "type": "address"}],
          "stateMutability": "view",
          "type": "function"
        }
      ];

      console.log(chalk.blue('🚀 Deploying contract with ephemeral node...'));

      const result = await ConfluxOperations.deployContract(
        contractCode,
        abi,
        [],
        {
          corePort: parseInt(options.corePort),
          evmPort: parseInt(options.evmPort),
          silent: true
        }
      );

      if (result.success && result.data) {
        console.log(chalk.green('✅ Contract deployed successfully!'));
        console.log(chalk.blue(`📍 Address: ${result.data.address}`));
        console.log(chalk.blue(`🔗 Tx Hash: ${result.data.txHash}`));
        console.log(chalk.blue(`⏱️  Duration: ${result.duration}ms`));

        const deploymentInfo = {
          name: options.name,
          address: result.data.address,
          txHash: result.data.txHash,
          timestamp: new Date().toISOString(),
          duration: result.duration
        };

        if (options.output) {
          await fs.writeFile(options.output, JSON.stringify(deploymentInfo, null, 2));
          console.log(chalk.blue(`💾 Deployment info saved to: ${options.output}`));
        }
      } else {
        console.error(chalk.red('❌ Contract deployment failed:'), result.error);
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('❌ Deployment error:'), error);
      process.exit(1);
    }
  });

// Call contract method command
program
  .command('call')
  .description('Call a contract method with ephemeral node')
  .requiredOption('-a, --address <address>', 'Contract address')
  .requiredOption('-m, --method <method>', 'Method name to call')
  .option('-p, --params <params>', 'Method parameters (JSON array)', '[]')
  .option('-e, --evm-port <port>', 'EVM RPC port', '8545')
  .option('-o, --output <file>', 'Output file for result')
  .action(async (options) => {
    try {
      const params = JSON.parse(options.params);
      
      console.log(chalk.blue('🚀 Calling contract method with ephemeral node...'));

      const result = await ConfluxOperations.callContractMethod(
        options.address,
        [
          {
            "inputs": [],
            "name": options.method,
            "outputs": [{"internalType": "string", "name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        options.method,
        params,
        {
          evmPort: parseInt(options.evmPort),
          silent: true
        }
      );

      if (result.success) {
        console.log(chalk.green('✅ Method called successfully!'));
        console.log(chalk.blue(`📊 Result: ${JSON.stringify(result.data)}`));
        console.log(chalk.blue(`⏱️  Duration: ${result.duration}ms`));

        if (options.output) {
          await fs.writeFile(options.output, JSON.stringify(result.data, null, 2));
          console.log(chalk.blue(`💾 Result saved to: ${options.output}`));
        }
      } else {
        console.error(chalk.red('❌ Method call failed:'), result.error);
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('❌ Call error:'), error);
      process.exit(1);
    }
  });

// Run complete flow command
program
  .command('flow')
  .description('Run a complete deployment flow with ephemeral node')
  .requiredOption('-f, --flow <file>', 'Flow configuration file (JSON)')
  .option('-p, --core-port <port>', 'Core RPC port', '12537')
  .option('-e, --evm-port <port>', 'EVM RPC port', '8545')
  .option('-o, --output <file>', 'Output file for results')
  .action(async (options) => {
    try {
      const flowPath = path.resolve(options.flow);
      if (!await fs.pathExists(flowPath)) {
        console.error(chalk.red(`❌ Flow file not found: ${flowPath}`));
        process.exit(1);
      }

      const flowConfig = await fs.readJson(flowPath);
      
      console.log(chalk.blue('🚀 Running complete flow with ephemeral node...'));

      const result = await ConfluxOperations.runCompleteDeploymentFlow(
        flowConfig.contracts,
        {
          corePort: parseInt(options.corePort),
          evmPort: parseInt(options.evmPort),
          silent: true
        }
      );

      if (result.success && result.data) {
        console.log(chalk.green('✅ Flow completed successfully!'));
        console.log(chalk.blue(`📊 Deployed ${result.data.length} contracts:`));
        
        result.data.forEach((contract, index) => {
          console.log(chalk.cyan(`  ${index + 1}. ${contract.name}: ${contract.address}`));
        });
        
        console.log(chalk.blue(`⏱️  Duration: ${result.duration}ms`));

        if (options.output) {
          await fs.writeFile(options.output, JSON.stringify(result.data, null, 2));
          console.log(chalk.blue(`💾 Results saved to: ${options.output}`));
        }
      } else {
        console.error(chalk.red('❌ Flow execution failed:'), result.error);
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('❌ Flow error:'), error);
      process.exit(1);
    }
  });

// Test node wrapper
program
  .command('test')
  .description('Test the node wrapper functionality')
  .option('-p, --core-port <port>', 'Core RPC port', '12537')
  .option('-e, --evm-port <port>', 'EVM RPC port', '8545')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🧪 Testing node wrapper...'));

      const wrapper = new ConfluxNodeWrapper();
      
      const result = await wrapper.executeScript(async (node) => {
        const status = await node.getStatus();
        const coreClient = node.getCoreClient();
        const evmClient = node.getEvmClient();
        
        return {
          status,
          coreClient: !!coreClient,
          evmClient: !!evmClient,
          timestamp: new Date().toISOString()
        };
      }, {
        corePort: parseInt(options.corePort),
        evmPort: parseInt(options.evmPort),
        silent: true
      });

      if (result.success) {
        console.log(chalk.green('✅ Node wrapper test passed!'));
        console.log(chalk.blue(`📊 Status: ${JSON.stringify(result.data, null, 2)}`));
        console.log(chalk.blue(`⏱️  Duration: ${result.duration}ms`));
      } else {
        console.error(chalk.red('❌ Node wrapper test failed:'), result.error);
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('❌ Test error:'), error);
      process.exit(1);
    }
  });

program.parse();

