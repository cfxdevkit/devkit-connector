// Contract factory for creating browser-safe contract instances

import type { ContractOrchestrator, NetworkConfig } from '@conflux-devkit/core';
import { createContractError } from '@conflux-devkit/core';
import { CoreClient } from '../rpc/CoreClient';
import { EvmClient } from '../rpc/EvmClient';
import { browserContractManager } from './BrowserContractManager';
import type { BrowserContractWrapper } from './BrowserContractWrapper';

export class ContractFactory {
  /**
   * Create contract wrapper from orchestrator
   */
  static createContract(
    orchestrator: ContractOrchestrator,
    networkConfig: NetworkConfig,
    privateKey?: `0x${string}`
  ): BrowserContractWrapper {
    try {
      let evmClient: EvmClient | undefined;
      let coreClient: CoreClient | undefined;

      // Create appropriate client based on chain type
      if (orchestrator.chainType === 'evm') {
        evmClient = new EvmClient(networkConfig, privateKey);
      } else if (orchestrator.chainType === 'core') {
        coreClient = new CoreClient(networkConfig);
      }

      // Register contract with manager
      const wrapper = browserContractManager.registerContract(
        orchestrator,
        evmClient,
        coreClient
      );

      return wrapper;
    } catch (error) {
      throw createContractError('Failed to create contract', {
        contractId: orchestrator.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Create contract from address and ABI
   */
  static createContractFromAddress(
    address: `0x${string}`,
    abi: any[],
    networkConfig: NetworkConfig,
    contractName: string = 'UnknownContract',
    privateKey?: `0x${string}`
  ): BrowserContractWrapper {
    try {
      // Create minimal orchestrator
      const orchestrator: ContractOrchestrator = {
        id: `${contractName}-${networkConfig.networkType || 'evm'}-${networkConfig.name}`,
        name: contractName,
        address,
        chainType: networkConfig.networkType || 'evm',
        networkId: `${networkConfig.networkType || 'evm'}-${networkConfig.name}`,
        chainId: networkConfig.chainId,
        evmChainId: networkConfig.evmChainId,

        metadata: {
          name: contractName,
          description: `Contract at ${address}`,
          category: 'custom',
          tags: ['imported'],
        },

        abi,
        bytecode: '0x',
        deployedBytecode: '0x',

        methods: {
          read: [],
          write: [],
          events: [],
          constructor: null,
        },

        deployment: {
          transactionHash:
            '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
          blockNumber: 0n,
          gasUsed: 0n,
          deployedAt: new Date(),
          isVerified: false,
        },

        types: {
          generated: false,
        },

        ui: {
          displayName: contractName,
          description: `Contract at ${address}`,
          category: 'custom',
          tags: ['imported'],
          isActive: true,
          usageCount: 0,
        },

        capabilities: {
          canRead: false,
          canWrite: false,
          canReceive: false,
          canFallback: false,
          hasEvents: false,
          isUpgradeable: false,
          isPausable: false,
          isOwnable: false,
        },

        network: {
          name: networkConfig.name,
          rpcUrl: networkConfig.rpcUrl,
          isTestnet: networkConfig.isTestnet,
          currency: networkConfig.currency,
        },
      };

      // Extract methods and events from ABI
      ContractFactory.extractContractInterface(orchestrator, abi);

      // Create contract wrapper
      return ContractFactory.createContract(
        orchestrator,
        networkConfig,
        privateKey
      );
    } catch (error) {
      throw createContractError('Failed to create contract from address', {
        address,
        contractName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Create multiple contracts from orchestrators
   */
  static createMultipleContracts(
    orchestrators: ContractOrchestrator[],
    networkConfig: NetworkConfig,
    privateKey?: `0x${string}`
  ): BrowserContractWrapper[] {
    const wrappers: BrowserContractWrapper[] = [];

    for (const orchestrator of orchestrators) {
      try {
        const wrapper = ContractFactory.createContract(
          orchestrator,
          networkConfig,
          privateKey
        );
        wrappers.push(wrapper);
      } catch (error) {
        console.error(`Failed to create contract ${orchestrator.name}:`, error);
      }
    }

    return wrappers;
  }

  /**
   * Create contract from JSON data
   */
  static createContractFromJSON(
    jsonData: string,
    networkConfig: NetworkConfig,
    privateKey?: `0x${string}`
  ): BrowserContractWrapper {
    try {
      const data = JSON.parse(jsonData);

      // Validate required fields
      if (!data.address || !data.abi) {
        throw new Error('Missing required fields: address and abi');
      }

      return ContractFactory.createContractFromAddress(
        data.address,
        data.abi,
        networkConfig,
        data.name || 'ImportedContract',
        privateKey
      );
    } catch (error) {
      throw createContractError('Failed to create contract from JSON', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Extract contract interface from ABI
   */
  private static extractContractInterface(
    orchestrator: ContractOrchestrator,
    abi: any[]
  ): void {
    const methods: any[] = [];
    const events: any[] = [];
    let contractConstructor: any = null;

    for (const item of abi) {
      if (item.type === 'function') {
        const method = {
          name: item.name,
          type: 'function',
          stateMutability: item.stateMutability,
          inputs: item.inputs || [],
          outputs: item.outputs || [],
          category: ContractFactory.categorizeMethod(item),
          isPayable: item.stateMutability === 'payable',
          isView: item.stateMutability === 'view',
          isPure: item.stateMutability === 'pure',
        };
        methods.push(method);
      } else if (item.type === 'event') {
        const event = {
          name: item.name,
          inputs: item.inputs || [],
          anonymous: item.anonymous || false,
          category: ContractFactory.categorizeEvent(item),
        };
        events.push(event);
      } else if (item.type === 'constructor') {
        contractConstructor = {
          name: 'constructor',
          type: 'constructor',
          stateMutability: item.stateMutability || 'nonpayable',
          inputs: item.inputs || [],
          outputs: [],
          category: 'constructor',
        };
      }
    }

    // Categorize methods
    const readMethods = methods.filter(m => m.category === 'read');
    const writeMethods = methods.filter(m => m.category === 'write');

    // Update orchestrator
    orchestrator.methods = {
      read: readMethods,
      write: writeMethods,
      events: events,
      constructor: contractConstructor,
    };

    // Update capabilities
    orchestrator.capabilities = {
      canRead: readMethods.length > 0,
      canWrite: writeMethods.length > 0,
      canReceive: abi.some(item => item.type === 'receive'),
      canFallback: abi.some(item => item.type === 'fallback'),
      hasEvents: events.length > 0,
      isUpgradeable: abi.some(
        item => item.name === 'upgrade' || item.name === 'implementation'
      ),
      isPausable: abi.some(
        item => item.name === 'pause' || item.name === 'unpause'
      ),
      isOwnable: abi.some(
        item => item.name === 'owner' || item.name === 'transferOwnership'
      ),
    };
  }

  /**
   * Categorize method based on name and state mutability
   */
  private static categorizeMethod(
    item: any
  ): 'read' | 'write' | 'event' | 'constructor' {
    if (item.stateMutability === 'view' || item.stateMutability === 'pure') {
      return 'read';
    }
    return 'write';
  }

  /**
   * Categorize event based on name
   */
  private static categorizeEvent(
    item: any
  ): 'transfer' | 'mint' | 'burn' | 'approval' | 'custom' {
    const name = item.name.toLowerCase();
    if (name.includes('transfer')) return 'transfer';
    if (name.includes('mint')) return 'mint';
    if (name.includes('burn')) return 'burn';
    if (name.includes('approval') || name.includes('approve'))
      return 'approval';
    return 'custom';
  }

  /**
   * Get contract by ID
   */
  static getContract(id: string): BrowserContractWrapper | undefined {
    return browserContractManager.getContract(id);
  }

  /**
   * Get contract by address
   */
  static getContractByAddress(
    address: string
  ): BrowserContractWrapper | undefined {
    return browserContractManager.getContractByAddress(address);
  }

  /**
   * List all contracts
   */
  static listContracts() {
    return browserContractManager.listContracts();
  }

  /**
   * Search contracts
   */
  static searchContracts(query: string, filters?: any) {
    return browserContractManager.searchContracts(query, filters);
  }

  /**
   * Get contract statistics
   */
  static getStatistics() {
    return browserContractManager.getStatistics();
  }

  /**
   * Clear all contracts
   */
  static clearAllContracts(): void {
    browserContractManager.clearAllContracts();
  }
}
