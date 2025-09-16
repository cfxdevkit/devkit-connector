#!/usr/bin/env ts-node

import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from 'ethers';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

interface DeploymentResult {
  network: string;
  contract: string;
  address: string;
  txHash: string;
  gasUsed: string;
  timestamp: string;
  mock: boolean;
  abi?: any[];
}

interface DeploymentConfig {
  contractName: string;
  constructorArgs?: any[];
  gasLimit?: number;
  gasPrice?: string;
}

export class TypeScriptDeployer {
  private hre: HardhatRuntimeEnvironment;
  private deployments: Map<string, DeploymentResult> = new Map();

  constructor(hre: HardhatRuntimeEnvironment) {
    this.hre = hre;
  }

  async initialize(networkName: string = 'localEspace'): Promise<void> {
    console.log(chalk.blue(`🚀 Initializing TypeScript Deployer on ${networkName}...`));
    
    // Ensure we're on the correct network
    if (this.hre.network.name !== networkName) {
      console.log(chalk.yellow(`⚠️  Switching from ${this.hre.network.name} to ${networkName}`));
    }

    // Load existing deployments
    await this.loadExistingDeployments();
    
    console.log(chalk.green(`✅ TypeScript Deployer initialized on ${this.hre.network.name}`));
  }

  async compileContracts(): Promise<boolean> {
    try {
      console.log(chalk.blue('🔨 Compiling contracts...'));
      await this.hre.run('compile');
      console.log(chalk.green('✅ Contracts compiled successfully'));
      return true;
    } catch (error: any) {
      console.error(chalk.red(`❌ Compilation failed: ${error.message}`));
      return false;
    }
  }

  async deployContract(config: DeploymentConfig): Promise<DeploymentResult | null> {
    try {
      console.log(chalk.blue(`📦 Deploying ${config.contractName}...`));

      // Get contract factory
      const ContractFactory = await (this.hre as any).ethers.getContractFactory(config.contractName);
      
      // Prepare deployment options
      const deployOptions: any = {};
      if (config.gasLimit) deployOptions.gasLimit = config.gasLimit;
      if (config.gasPrice) {
        deployOptions.gasPrice = ethers.parseUnits(config.gasPrice, 'gwei');
      }

      // Deploy contract
      const contract = await ContractFactory.deploy(
        ...(config.constructorArgs || []),
        deployOptions
      );

      // Wait for deployment
      await contract.waitForDeployment();
      const deploymentTx = contract.deploymentTransaction();
      const receipt = deploymentTx ? await deploymentTx.wait() : null;

      // Get contract ABI
      const contractInterface = ContractFactory.interface;

      const deployment: DeploymentResult = {
        network: this.hre.network.name,
        contract: config.contractName,
        address: await contract.getAddress(),
        txHash: deploymentTx?.hash || '',
        gasUsed: receipt?.gasUsed?.toString() || '0',
        timestamp: new Date().toISOString(),
        mock: false,
        abi: contractInterface.format('json') as any[]
      };

      // Store deployment
      this.deployments.set(`${config.contractName}_${this.hre.network.name}`, deployment);

      console.log(chalk.green(`✅ ${config.contractName} deployed successfully!`));
      console.log(chalk.cyan(`   Address: ${await contract.getAddress()}`));
      console.log(chalk.cyan(`   Tx Hash: ${deploymentTx?.hash || 'unknown'}`));
      console.log(chalk.cyan(`   Gas Used: ${receipt?.gasUsed?.toString() || '0'}`));

      return deployment;
    } catch (error: any) {
      console.error(chalk.red(`❌ Failed to deploy ${config.contractName}: ${error.message}`));
      return null;
    }
  }

  async testContract(deployment: DeploymentResult): Promise<boolean> {
    try {
      console.log(chalk.blue(`🧪 Testing contract at ${deployment.address}...`));

      // Get contract instance
      const contract = await (this.hre as any).ethers.getContractAt(
        deployment.contract,
        deployment.address
      );

      if (deployment.contract === 'DelegationManager') {
        // Test DelegationManager methods
        console.log(chalk.blue('   Testing owner() method...'));
        const owner = await contract.owner();
        console.log(chalk.green(`   ✅ Owner: ${owner}`));

        console.log(chalk.blue('   Testing paused() method...'));
        const paused = await contract.paused();
        console.log(chalk.green(`   ✅ Paused: ${paused}`));
      } else if (deployment.contract === 'Counter') {
        // Test Counter methods
        console.log(chalk.blue('   Testing getCount() method...'));
        const count = await contract.getCount();
        console.log(chalk.green(`   ✅ Count: ${count}`));

        console.log(chalk.blue('   Testing getMaxCount() method...'));
        const maxCount = await contract.getMaxCount();
        console.log(chalk.green(`   ✅ Max Count: ${maxCount}`));
      }

      console.log(chalk.green(`✅ Contract tests passed!`));
      return true;
    } catch (error: any) {
      console.error(chalk.red(`❌ Contract tests failed: ${error.message}`));
      return false;
    }
  }

  async saveDeployments(): Promise<void> {
    const deploymentsDir = path.join(process.cwd(), '../../tools/node-manager/deployments');
    
    // Ensure directory exists
    await fs.ensureDir(deploymentsDir);

    // Save each deployment
    for (const [key, deployment] of this.deployments.entries()) {
      const filename = `${deployment.network}.json`;
      const filepath = path.join(deploymentsDir, filename);
      
      // Remove ABI from saved deployment (too large for JSON)
      const { abi, ...deploymentWithoutABI } = deployment;
      
      await fs.writeJson(filepath, deploymentWithoutABI, { spaces: 2 });
      console.log(chalk.green(`💾 Saved ${deployment.network} deployment to ${filepath}`));
    }
  }

  private async loadExistingDeployments(): Promise<void> {
    const deploymentsDir = path.join(process.cwd(), '../../tools/node-manager/deployments');
    
    if (await fs.pathExists(deploymentsDir)) {
      const files = await fs.readdir(deploymentsDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filepath = path.join(deploymentsDir, file);
          const deployment = await fs.readJson(filepath);
          
          if (deployment.network && deployment.address) {
            this.deployments.set(`${deployment.contract}_${deployment.network}`, deployment);
            console.log(chalk.blue(`📄 Loaded existing ${deployment.network} deployment: ${deployment.address}`));
          }
        }
      }
    }
  }

  async deployAndTest(config: DeploymentConfig): Promise<DeploymentResult | null> {
    // Compile contracts first
    if (!(await this.compileContracts())) {
      return null;
    }

    // Deploy contract
    const deployment = await this.deployContract(config);
    if (!deployment) {
      return null;
    }

    // Test contract
    if (!(await this.testContract(deployment))) {
      console.log(chalk.yellow('⚠️  Contract deployed but tests failed'));
    }

    // Save deployment
    await this.saveDeployments();

    return deployment;
  }

  getDeployments(): Map<string, DeploymentResult> {
    return this.deployments;
  }

  getDeployment(contractName: string, network: string): DeploymentResult | undefined {
    return this.deployments.get(`${contractName}_${network}`);
  }
}

// Main execution function
async function main() {
  const hre = require('hardhat');
  const deployer = new TypeScriptDeployer(hre);
  
  const network = process.argv[2] || 'localEspace';
  
  try {
    await deployer.initialize(network);
    
    // Deploy DelegationManager
    console.log(chalk.blue('🚀 Deploying DelegationManager...'));
    const delegationConfig: DeploymentConfig = {
      contractName: 'DelegationManager',
      constructorArgs: [],
      gasLimit: 5000000, // 5M gas limit
      gasPrice: '1' // 1 gwei
    };
    
    const delegationDeployment = await deployer.deployAndTest(delegationConfig);
    
    // Deploy Counter
    console.log(chalk.blue('🚀 Deploying Counter...'));
    const counterConfig: DeploymentConfig = {
      contractName: 'Counter',
      constructorArgs: [],
      gasLimit: 2000000, // 2M gas limit
      gasPrice: '1' // 1 gwei
    };
    
    const counterDeployment = await deployer.deployAndTest(counterConfig);
    
    if (delegationDeployment && counterDeployment) {
      console.log(chalk.green('🎉 All deployments completed successfully!'));
      console.log(chalk.cyan(`DelegationManager Address: ${delegationDeployment.address}`));
      console.log(chalk.cyan(`Counter Address: ${counterDeployment.address}`));
    } else {
      console.log(chalk.red('❌ Some deployments failed'));
      process.exit(1);
    }
  } catch (error: any) {
    console.error(chalk.red(`❌ Deployment error: ${error.message}`));
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export default TypeScriptDeployer;
