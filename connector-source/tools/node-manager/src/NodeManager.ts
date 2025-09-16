import { createServer } from '@xcfx/node';
import { http, createPublicClient } from 'cive';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

export interface NodeOptions {
  port?: string;
  ethPort?: string;
  interval?: string;
  config?: string;
}

export interface NodeStatus {
  running: boolean;
  corePort?: number;
  evmPort?: number;
  chainId?: number;
  evmChainId?: number;
  blockNumber?: number;
  peerCount?: number;
}

export class NodeManager {
  private server: any = null;
  private coreClient: any = null;
  private evmClient: any = null;
  private spinner: any = null;

  async start(options: NodeOptions = {}): Promise<void> {
    const corePort = parseInt(options.port || '12537');
    const evmPort = parseInt(options.ethPort || '8545');
    const interval = parseInt(options.interval || '1000');

    this.spinner = ora('Starting Conflux node...').start();

    try {
      // Create server configuration
      const serverConfig = {
        jsonrpcHttpPort: corePort,
        jsonrpcHttpEthPort: evmPort,
        devBlockIntervalMs: interval,
        chainId: 1111, // Core space chain ID
        evmChainId: 2222, // EVM space chain ID
        genesisSecrets: this.getGenesisSecrets(),
        genesisEvmSecrets: this.getGenesisEvmSecrets(),
        log: true,
        ...(options.config && { configFile: options.config })
      };

      // Create and start server
      this.server = await createServer(serverConfig);
      await this.server.start();

      // Create clients
      this.coreClient = createPublicClient({
        transport: http(`http://127.0.0.1:${corePort}`)
      });

      this.evmClient = createPublicClient({
        transport: http(`http://127.0.0.1:${evmPort}`)
      });

      this.spinner.succeed(chalk.green('Conflux node started successfully!'));
      
      console.log(chalk.blue(`🔗 Core RPC: http://127.0.0.1:${corePort}`));
      console.log(chalk.blue(`🔗 EVM RPC: http://127.0.0.1:${evmPort}`));
      console.log(chalk.blue(`⏱️  Block interval: ${interval}ms`));

      // Auto-deploy contracts after node starts
      await this.autoDeployContracts(corePort, evmPort);

    } catch (error) {
      this.spinner?.fail(chalk.red('Failed to start node'));
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.server) {
      this.spinner = ora('Stopping Conflux node...').start();
      try {
        await this.server.stop();
        this.server = null;
        this.coreClient = null;
        this.evmClient = null;
        this.spinner.succeed(chalk.green('Node stopped successfully!'));
      } catch (error) {
        this.spinner?.fail(chalk.red('Failed to stop node'));
        throw error;
      }
    }
  }

  async startDev(options: NodeOptions = {}): Promise<void> {
    await this.start(options);
    
    console.log(chalk.yellow('🔧 Development mode active. Press Ctrl+C to stop.'));
    
    // Keep process alive
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n🛑 Shutting down development environment...'));
      await this.stop();
      process.exit(0);
    });

    // Keep alive
    setInterval(() => {}, 1000);
  }

  async getStatus(): Promise<NodeStatus> {
    if (!this.server || !this.coreClient) {
      return { running: false };
    }

    try {
      const status = await this.coreClient.getStatus();
      return {
        running: true,
        corePort: this.server.config?.jsonrpcHttpPort,
        evmPort: this.server.config?.jsonrpcHttpEthPort,
        chainId: status.chainId,
        evmChainId: this.server.config?.evmChainId,
        blockNumber: status.blockNumber,
        peerCount: status.peerCount
      };
    } catch (error) {
      return { running: false };
    }
  }

  async reset(): Promise<void> {
    await this.stop();
    
    // Clean up data directory
    const dataDir = path.join(process.cwd(), '.conflux-dev');
    if (await fs.pathExists(dataDir)) {
      await fs.remove(dataDir);
    }
    
    console.log(chalk.green('Node data reset complete!'));
  }

  getCoreClient() {
    return this.coreClient;
  }

  getEvmClient() {
    return this.evmClient;
  }

  private getGenesisSecrets(): string[] {
    // Return test private keys for Core space
    return [
      '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    ];
  }

  private getGenesisEvmSecrets(): string[] {
    // Return test private keys for EVM space
    return [
      '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    ];
  }

  private async autoDeployContracts(corePort: number, evmPort: number): Promise<void> {
    console.log(chalk.blue('\n📦 Auto-deploying contracts...'));
    
    try {
      // Import ContractDeployer dynamically to avoid circular dependencies
      const { ContractDeployer } = await import('./ContractDeployer');
      const deployer = new ContractDeployer();
      
      // Deploy to eSpace (should work reliably)
      try {
        console.log(chalk.blue('🚀 Deploying to eSpace...'));
        const espaceResult = await deployer.deployToEspace(evmPort);
        console.log(chalk.green(`✅ eSpace contract deployed: ${espaceResult.address}`));
      } catch (error) {
        console.log(chalk.red(`❌ eSpace deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
      
      // Deploy to Core (with fallback to mock)
      try {
        console.log(chalk.blue('🚀 Deploying to Core...'));
        const coreResult = await deployer.deployToCore(corePort);
        console.log(chalk.green(`✅ Core contract deployed: ${coreResult.address}`));
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Core deployment failed, using mock: ${error instanceof Error ? error.message : 'Unknown error'}`));
        await this.createMockCoreDeployment(corePort);
      }
      
      console.log(chalk.green('🎉 Contract deployment completed!'));
      
    } catch (error) {
      console.log(chalk.red(`❌ Contract deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  private async createMockCoreDeployment(corePort: number): Promise<void> {
    console.log(chalk.blue('🔧 Creating mock Core deployment...'));
    
    const mockDeployment = {
      network: 'core',
      contract: 'SimpleDelegationCore',
      address: '0x' + Math.random().toString(16).substr(2, 40),
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
      gasUsed: '0',
      timestamp: new Date().toISOString(),
      mock: true,
      reason: 'Core deployment failed, using mock for development'
    };
    
    // Save mock deployment
    const fs = require('fs-extra');
    const path = require('path');
    const deployDir = path.join(process.cwd(), 'deployments');
    await fs.ensureDir(deployDir);
    
    const deployFile = path.join(deployDir, 'mock-core-deployment.json');
    await fs.writeJson(deployFile, mockDeployment, { spaces: 2 });
    
    console.log(chalk.yellow(`📄 Mock Core deployment saved: ${mockDeployment.address}`));
    console.log(chalk.yellow(`📄 Mock deployment info: ${deployFile}`));
  }
}
