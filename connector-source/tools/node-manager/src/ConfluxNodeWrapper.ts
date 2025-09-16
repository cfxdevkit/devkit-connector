import { createServer } from '@xcfx/node';
import { http, createPublicClient } from 'cive';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

export interface NodeConfig {
  corePort?: number;
  evmPort?: number;
  blockInterval?: number;
  chainId?: number;
  evmChainId?: number;
  dataDir?: string;
  silent?: boolean;
}

export interface ExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
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

export class ConfluxNodeWrapper {
  private server: any = null;
  private coreClient: any = null;
  private evmClient: any = null;
  private spinner: any = null;
  private originalConsole: any = {};
  private isSilent: boolean = false;

  constructor() {
    this.setupConsoleOverride();
  }

  private setupConsoleOverride() {
    // Store original console methods
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    };
  }

  private enableSilentMode() {
    this.isSilent = true;
    // Override console methods to suppress output
    console.log = () => {};
    console.error = () => {};
    console.warn = () => {};
    console.info = () => {};
    console.debug = () => {};
  }

  private disableSilentMode() {
    this.isSilent = false;
    // Restore original console methods
    Object.assign(console, this.originalConsole);
  }

  async start(config: NodeConfig = {}): Promise<void> {
    const {
      corePort = 12537,
      evmPort = 8545,
      blockInterval = 1000,
      chainId = 1111,
      evmChainId = 2222,
      dataDir = '.conflux-dev',
      silent = false
    } = config;

    if (silent) {
      this.enableSilentMode();
    }

    try {
      // Create server configuration
      const serverConfig = {
        jsonrpcHttpPort: corePort,
        jsonrpcHttpEthPort: evmPort,
        devBlockIntervalMs: blockInterval,
        chainId,
        evmChainId,
        genesisSecrets: this.getGenesisSecrets(),
        genesisEvmSecrets: this.getGenesisEvmSecrets(),
        log: !silent, // Disable internal logging if silent
        dataDir,
        ...(silent && { 
          // Additional silent configuration
          logLevel: 'error',
          disableLogging: true
        })
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

      if (!silent) {
        console.log(chalk.green('✅ Conflux node started successfully!'));
        console.log(chalk.blue(`🔗 Core RPC: http://127.0.0.1:${corePort}`));
        console.log(chalk.blue(`🔗 EVM RPC: http://127.0.0.1:${evmPort}`));
      }

    } catch (error) {
      if (!silent) {
        console.error(chalk.red('❌ Failed to start node:'), error);
      }
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.server) {
        await this.server.stop();
        this.server = null;
        this.coreClient = null;
        this.evmClient = null;
      }
    } catch (error) {
      // Ignore errors during shutdown
    } finally {
      this.disableSilentMode();
    }
  }

  async executeWithNode<T>(
    operation: (node: ConfluxNodeWrapper) => Promise<T>,
    config: NodeConfig = {}
  ): Promise<ExecutionResult<T>> {
    const startTime = Date.now();
    let result: T | undefined;
    let error: string | undefined;

    try {
      // Start node silently
      await this.start({ ...config, silent: true });

      // Wait for node to be ready
      await this.waitForNodeReady();

      // Execute operation
      result = await operation(this);

    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      console.error('Execution error:', error);
    } finally {
      // Always cleanup
      try {
        await this.stop();
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    const duration = Date.now() - startTime;

    return {
      success: !error,
      data: result,
      error,
      duration
    };
  }

  async executeScript<T>(
    script: (node: ConfluxNodeWrapper) => Promise<T>,
    config: NodeConfig = {}
  ): Promise<ExecutionResult<T>> {
    return this.executeWithNode(script, config);
  }

  async executeCompleteFlow<T>(
    flow: (node: ConfluxNodeWrapper) => Promise<T>,
    config: NodeConfig = {}
  ): Promise<ExecutionResult<T>> {
    return this.executeWithNode(flow, config);
  }

  private async waitForNodeReady(timeout: number = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        if (this.coreClient && this.evmClient) {
          // Test EVM client first (more reliable)
          await this.evmClient.getBlockNumber();
          
          // Test Core client (may fail, that's ok)
          try {
            await this.coreClient.getStatus();
          } catch (error) {
            // Core client may not be ready, but EVM is enough
          }
          
          return; // Node is ready
        }
      } catch (error) {
        // Node not ready yet, wait a bit
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    throw new Error(`Node failed to become ready within ${timeout}ms timeout`);
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

  getCoreClient() {
    return this.coreClient;
  }

  getEvmClient() {
    return this.evmClient;
  }

  private getGenesisSecrets(): string[] {
    return [
      '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    ];
  }

  private getGenesisEvmSecrets(): string[] {
    return [
      '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    ];
  }
}

// Utility functions for common operations
export class ConfluxOperations {
  static async deployContract(
    contractCode: string,
    abi: any[],
    constructorArgs: any[] = [],
    config: NodeConfig = {}
  ): Promise<ExecutionResult<{ address: string; txHash: string }>> {
    const wrapper = new ConfluxNodeWrapper();
    
    return wrapper.executeScript(async (node) => {
      const { ethers } = await import('ethers');
      
      const provider = new ethers.JsonRpcProvider(`http://127.0.0.1:${config.evmPort || 8545}`);
      const wallet = new ethers.Wallet(
        '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        provider
      );

      const factory = new ethers.ContractFactory(abi, contractCode, wallet);
      const contract = await factory.deploy(...constructorArgs);
      await contract.waitForDeployment();

      const address = await contract.getAddress();
      const txHash = contract.deploymentTransaction()?.hash || '';

      return { address, txHash };
    }, config);
  }

  static async callContractMethod(
    contractAddress: string,
    abi: any[],
    methodName: string,
    args: any[] = [],
    config: NodeConfig = {}
  ): Promise<ExecutionResult<any>> {
    const wrapper = new ConfluxNodeWrapper();
    
    return wrapper.executeScript(async (node) => {
      const { ethers } = await import('ethers');
      
      const provider = new ethers.JsonRpcProvider(`http://127.0.0.1:${config.evmPort || 8545}`);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      
      return await contract[methodName](...args);
    }, config);
  }

  static async sendTransaction(
    to: string,
    value: string = '0',
    data: string = '0x',
    config: NodeConfig = {}
  ): Promise<ExecutionResult<{ txHash: string; receipt: any }>> {
    const wrapper = new ConfluxNodeWrapper();
    
    return wrapper.executeScript(async (node) => {
      const { ethers } = await import('ethers');
      
      const provider = new ethers.JsonRpcProvider(`http://127.0.0.1:${config.evmPort || 8545}`);
      const wallet = new ethers.Wallet(
        '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        provider
      );

      const tx = await wallet.sendTransaction({
        to,
        value: ethers.parseEther(value),
        data
      });

      const receipt = await tx.wait();

      return { txHash: tx.hash, receipt };
    }, config);
  }

  static async getBlockInfo(blockNumber?: number, config: NodeConfig = {}): Promise<ExecutionResult<any>> {
    const wrapper = new ConfluxNodeWrapper();
    
    return wrapper.executeScript(async (node) => {
      const { ethers } = await import('ethers');
      
      const provider = new ethers.JsonRpcProvider(`http://127.0.0.1:${config.evmPort || 8545}`);
      
      if (blockNumber) {
        return await provider.getBlock(blockNumber);
      } else {
        return await provider.getBlock('latest');
      }
    }, config);
  }

  static async runCompleteDeploymentFlow(
    contracts: Array<{ name: string; code: string; abi: any[]; args?: any[] }>,
    config: NodeConfig = {}
  ): Promise<ExecutionResult<Array<{ name: string; address: string; txHash: string }>>> {
    const wrapper = new ConfluxNodeWrapper();
    
    return wrapper.executeCompleteFlow(async (node) => {
      const { ethers } = await import('ethers');
      
      const provider = new ethers.JsonRpcProvider(`http://127.0.0.1:${config.evmPort || 8545}`);
      const wallet = new ethers.Wallet(
        '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        provider
      );

      const results = [];

      for (const contract of contracts) {
        const factory = new ethers.ContractFactory(contract.abi, contract.code, wallet);
        const deployed = await factory.deploy(...(contract.args || []));
        await deployed.waitForDeployment();

        const address = await deployed.getAddress();
        const txHash = deployed.deploymentTransaction()?.hash || '';

        results.push({
          name: contract.name,
          address,
          txHash
        });
      }

      return results;
    }, config);
  }
}
