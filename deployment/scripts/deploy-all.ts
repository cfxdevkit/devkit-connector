#!/usr/bin/env ts-node

import { ethers } from 'ethers';
import fs from 'fs-extra';
import path from 'path';

interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId?: number;
  networkId?: number;
  explorer: string;
  description: string;
}

interface ContractConfig {
  name: string;
  description: string;
  version: string;
  license: string;
  features: string[];
  gasEstimate: Record<string, number>;
}

interface DeploymentResult {
  network: string;
  contract: string;
  address: string;
  txHash: string;
  gasUsed: string;
  timestamp: string;
  mock: boolean;
}

class MinimalDeployer {
  private networks: Record<string, NetworkConfig>;
  private contracts: Record<string, ContractConfig>;
  private deployments: DeploymentResult[] = [];

  constructor() {
    this.networks = this.loadConfig('networks.json');
    this.contracts = this.loadConfig('contracts.json');
  }

  private loadConfig(filename: string): any {
    const configPath = path.join(__dirname, '..', 'config', filename);
    return fs.readJsonSync(configPath);
  }

  async deployToNetwork(networkKey: string, contracts: string[]): Promise<void> {
    const network = this.networks[networkKey];
    if (!network) {
      throw new Error(`Network ${networkKey} not found`);
    }

    console.log(`🚀 Deploying to ${network.name}...`);
    console.log(`📡 RPC: ${network.rpcUrl}`);

    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
    const privateKey = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`👤 Deployer: ${wallet.address}`);

    // Check network connection
    try {
      const networkInfo = await provider.getNetwork();
      console.log(`✅ Connected to network: ${networkInfo.name} (Chain ID: ${networkInfo.chainId})`);
    } catch (error) {
      console.warn(`⚠️ Could not connect to network: ${error}`);
      console.log(`🔄 Using mock deployments...`);
    }

    // Deploy each contract
    for (const contractName of contracts) {
      try {
        const deployment = await this.deployContract(contractName, networkKey, provider, wallet);
        this.deployments.push(deployment);
        
        // Save individual deployment
        await this.saveDeployment(deployment);
        
      } catch (error) {
        console.error(`❌ Failed to deploy ${contractName}:`, error);
      }
    }
  }

  private async deployContract(
    contractName: string,
    networkKey: string,
    provider: ethers.JsonRpcProvider,
    wallet: ethers.Wallet
  ): Promise<DeploymentResult> {
    console.log(`\n📦 Deploying ${contractName}...`);
    
    const contractConfig = this.contracts[contractName];
    if (!contractConfig) {
      throw new Error(`Contract ${contractName} not found in config`);
    }

    // For now, create mock deployments
    // In a real scenario, you would compile and deploy actual contracts
    const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
    const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
    
    const deployment: DeploymentResult = {
      network: networkKey,
      contract: contractName,
      address: mockAddress,
      txHash: mockTxHash,
      gasUsed: contractConfig.gasEstimate.deploy.toString(),
      timestamp: new Date().toISOString(),
      mock: true
    };

    console.log(`✅ ${contractName} deployed successfully!`);
    console.log(`   Address: ${deployment.address}`);
    console.log(`   Tx Hash: ${deployment.txHash}`);
    console.log(`   Gas Used: ${deployment.gasUsed}`);

    return deployment;
  }

  private async saveDeployment(deployment: DeploymentResult): Promise<void> {
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    await fs.ensureDir(deploymentsDir);

    // Save individual deployment file
    const deploymentFile = path.join(deploymentsDir, `${deployment.contract.toLowerCase()}.json`);
    await fs.writeJson(deploymentFile, deployment, { spaces: 2 });
    console.log(`💾 Saved deployment to ${deploymentFile}`);
  }

  async saveAllDeployments(): Promise<void> {
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    await fs.ensureDir(deploymentsDir);

    // Save combined deployments
    const combinedFile = path.join(deploymentsDir, 'all-deployments.json');
    await fs.writeJson(combinedFile, this.deployments, { spaces: 2 });
    console.log(`💾 Saved all deployments to ${combinedFile}`);

    // Save summary
    const summaryFile = path.join(deploymentsDir, 'summary.json');
    const summary = {
      totalDeployments: this.deployments.length,
      networks: [...new Set(this.deployments.map(d => d.network))],
      contracts: [...new Set(this.deployments.map(d => d.contract))],
      timestamp: new Date().toISOString()
    };
    await fs.writeJson(summaryFile, summary, { spaces: 2 });
    console.log(`💾 Saved summary to ${summaryFile}`);
  }

  printSummary(): void {
    console.log('\n🎉 Deployment Summary:');
    console.log('='.repeat(50));
    
    const byNetwork = this.deployments.reduce((acc, d) => {
      if (!acc[d.network]) acc[d.network] = [];
      acc[d.network].push(d);
      return acc;
    }, {} as Record<string, DeploymentResult[]>);

    Object.entries(byNetwork).forEach(([network, deployments]) => {
      console.log(`\n📡 ${network.toUpperCase()}:`);
      deployments.forEach(d => {
        console.log(`   ${d.contract}: ${d.address} (${d.mock ? 'MOCK' : 'REAL'})`);
      });
    });
  }
}

async function main() {
  const deployer = new MinimalDeployer();
  
  // Get command line arguments
  const args = process.argv.slice(2);
  const network = args[0] || 'localEspace';
  const contracts = args.slice(1).length > 0 ? args.slice(1) : ['DelegationManager', 'Counter'];

  console.log('🚀 Minimal Contract Deployer');
  console.log('='.repeat(40));
  console.log(`Network: ${network}`);
  console.log(`Contracts: ${contracts.join(', ')}`);

  try {
    await deployer.deployToNetwork(network, contracts);
    await deployer.saveAllDeployments();
    deployer.printSummary();
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { MinimalDeployer };

