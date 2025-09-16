#!/usr/bin/env ts-node

import { createPublicClient, createWalletClient, http, parseEther, formatEther, getContract, type Hash, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

// Define local Conflux eSpace chain
const localConfluxEspace = defineChain({
  id: 2222,
  name: 'Local Conflux eSpace',
  network: 'localConfluxEspace',
  nativeCurrency: {
    decimals: 18,
    name: 'Conflux',
    symbol: 'CFX',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
  blockExplorers: {
    default: { name: 'Local Explorer', url: 'http://localhost:3000' },
  },
  testnet: true,
});

interface DeploymentResult {
  network: string;
  contract: string;
  address: `0x${string}`;
  txHash: Hash;
  gasUsed: string;
  timestamp: string;
  mock: boolean;
  abi?: any[];
}

interface DeploymentConfig {
  contractName: string;
  constructorArgs?: any[];
  gasLimit?: bigint;
  gasPrice?: bigint;
}

// DelegationManager ABI (minimal for deployment and testing)
const DELEGATION_MANAGER_ABI = [
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
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export class ViemDeployer {
  private publicClient: any;
  private walletClient: any;
  private account: any;
  private deployments: Map<string, DeploymentResult> = new Map();
  private rpcUrl: string;
  private privateKey: `0x${string}`;

  constructor(rpcUrl: string = 'http://127.0.0.1:8545', privateKey: `0x${string}` = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef') {
    this.rpcUrl = rpcUrl;
    this.privateKey = privateKey;
    
    // Create clients
    this.publicClient = createPublicClient({
      chain: localConfluxEspace,
      transport: http(rpcUrl)
    });

    this.account = privateKeyToAccount(privateKey);
    
    this.walletClient = createWalletClient({
      chain: localConfluxEspace,
      transport: http(rpcUrl),
      account: this.account
    });
  }

  async initialize(networkName: string = 'localEspace'): Promise<void> {
    console.log(chalk.blue(`🚀 Initializing Viem Deployer on ${networkName}...`));
    
    // Load existing deployments
    await this.loadExistingDeployments();
    
    console.log(chalk.green(`✅ Viem Deployer initialized on ${networkName}`));
  }

  async compileContracts(): Promise<boolean> {
    try {
      console.log(chalk.blue('🔨 Compiling contracts...'));
      
      // Use hardhat to compile
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      await execAsync('npx hardhat compile', { cwd: process.cwd() });
      
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

      // Read contract bytecode from artifacts
      const artifactPath = path.join(process.cwd(), 'artifacts/contracts/DelegationManager.sol/DelegationManager.json');
      const artifact = await fs.readJson(artifactPath);
      
      if (!artifact.bytecode || artifact.bytecode === '0x') {
        throw new Error('Contract bytecode not found. Make sure to compile first.');
      }

      // Deploy contract
      const hash = await this.walletClient.deployContract({
        abi: artifact.abi,
        bytecode: artifact.bytecode as `0x${string}`,
        args: config.constructorArgs || [],
        gas: config.gasLimit || 5000000n,
        gasPrice: config.gasPrice || 1000000000n, // 1 gwei
      });

      console.log(chalk.blue(`   Transaction hash: ${hash}`));

      // Wait for deployment
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      
      if (!receipt.contractAddress) {
        throw new Error('Contract deployment failed - no contract address in receipt');
      }

      const deployment: DeploymentResult = {
        network: 'localEspace',
        contract: config.contractName,
        address: receipt.contractAddress,
        txHash: hash,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: new Date().toISOString(),
        mock: false,
        abi: artifact.abi
      };

      // Store deployment
      this.deployments.set(`${config.contractName}_localEspace`, deployment);

      console.log(chalk.green(`✅ ${config.contractName} deployed successfully!`));
      console.log(chalk.cyan(`   Address: ${receipt.contractAddress}`));
      console.log(chalk.cyan(`   Tx Hash: ${hash}`));
      console.log(chalk.cyan(`   Gas Used: ${receipt.gasUsed.toString()}`));

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
      const contract = getContract({
        address: deployment.address,
        abi: DELEGATION_MANAGER_ABI,
        client: this.publicClient
      });

      // Test basic contract methods
      console.log(chalk.blue('   Testing owner() method...'));
      const owner = await this.publicClient.readContract({
        address: deployment.address,
        abi: DELEGATION_MANAGER_ABI,
        functionName: 'owner'
      });
      console.log(chalk.green(`   ✅ Owner: ${owner}`));

      console.log(chalk.blue('   Testing paused() method...'));
      const paused = await this.publicClient.readContract({
        address: deployment.address,
        abi: DELEGATION_MANAGER_ABI,
        functionName: 'paused'
      });
      console.log(chalk.green(`   ✅ Paused: ${paused}`));

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
  const network = process.argv[2] || 'localEspace';
  const rpcUrl = process.env.CONFLUX_ESPACE_RPC_URL || 'http://127.0.0.1:8545';
  const privateKey = process.env.PRIVATE_KEY as `0x${string}` || '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  
  const deployer = new ViemDeployer(rpcUrl, privateKey);
  
  try {
    await deployer.initialize(network);
    
    const config: DeploymentConfig = {
      contractName: 'DelegationManager',
      constructorArgs: [],
      gasLimit: 5000000n, // 5M gas limit
      gasPrice: 1000000000n // 1 gwei
    };
    
    const deployment = await deployer.deployAndTest(config);
    
    if (deployment) {
      console.log(chalk.green('🎉 Deployment completed successfully!'));
      console.log(chalk.cyan(`Contract Address: ${deployment.address}`));
      console.log(chalk.cyan(`Transaction Hash: ${deployment.txHash}`));
    } else {
      console.log(chalk.red('❌ Deployment failed'));
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

export default ViemDeployer;
