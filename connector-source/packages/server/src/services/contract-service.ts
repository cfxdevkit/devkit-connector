import { ethers } from 'ethers';
import { Conflux } from 'js-conflux-sdk';
import fs from 'fs-extra';
import path from 'path';
import { DeploymentResult, ContractCallResult, ContractStatus, NetworkInfo, ContractServiceConfig } from '../types';

export interface ContractConfig {
  espaceRpcUrl: string;
  coreRpcUrl: string;
  privateKey: string;
  deploymentsPath: string;
}

export class ContractService {
  private espaceProvider: ethers.JsonRpcProvider;
  private coreConflux: Conflux;
  private espaceWallet: ethers.Wallet;
  private coreAccount: any;
  private deployments: Map<string, DeploymentResult> = new Map();

  constructor(config: ContractServiceConfig) {
    // Initialize eSpace (EVM) connection
    this.espaceProvider = new ethers.JsonRpcProvider(config.espaceRpcUrl);
    this.espaceWallet = new ethers.Wallet(config.privateKey, this.espaceProvider);

    // Initialize Core connection
    this.coreConflux = new Conflux({
      url: config.coreRpcUrl,
      networkId: 1111
    });
    this.coreAccount = this.coreConflux.wallet.addPrivateKey(config.privateKey);

    // Load deployments
    this.loadDeployments(config.deploymentsPath);
  }

  private loadDeployments(deploymentsPath: string): void {
    try {
      if (fs.existsSync(deploymentsPath)) {
        const files = fs.readdirSync(deploymentsPath);
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            const filePath = path.join(deploymentsPath, file);
            const deployment = fs.readJsonSync(filePath);
            
            if (deployment.network && deployment.address) {
              // Use contract name as key if available, otherwise use network
              const key = deployment.contract || deployment.network;
              this.deployments.set(key, deployment);
              console.log(`📄 Loaded ${key} deployment: ${deployment.address}`);
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load deployments:', error);
    }
  }

  // eSpace Contract Interactions
  async callEspaceContract(method: string, params: any[] = []): Promise<ContractCallResult> {
    try {
      const deployment = this.deployments.get('espace');
      if (!deployment) {
        return {
          success: false,
          error: 'No eSpace contract deployment found'
        };
      }

      // Simple delegation contract ABI
      const contractABI = [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "delegator",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "delegate",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "limit",
              "type": "uint256"
            }
          ],
          "name": "DelegationCreated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "delegator",
              "type": "address"
            }
          ],
          "name": "DelegationRevoked",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_delegate",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_limit",
              "type": "uint256"
            }
          ],
          "name": "createDelegation",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_delegator",
              "type": "address"
            }
          ],
          "name": "getDelegation",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "delegate",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "limit",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "createdAt",
                  "type": "uint256"
                }
              ],
              "internalType": "struct SimpleDelegationEspace.Delegation",
              "name": "",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "revokeDelegation",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];

      const contract = new ethers.Contract(deployment.address, contractABI, this.espaceWallet);

      let result;
      if (method === 'createDelegation') {
        const tx = await contract.createDelegation(params[0], params[1]);
        const receipt = await tx.wait();
        
        result = {
          success: true,
          data: {
            delegator: this.espaceWallet.address,
            delegate: params[0],
            limit: params[1].toString()
          },
          transactionHash: receipt.hash,
          gasUsed: receipt.gasUsed.toString()
        };
      } else if (method === 'revokeDelegation') {
        const tx = await contract.revokeDelegation();
        const receipt = await tx.wait();
        
        result = {
          success: true,
          data: {
            delegator: this.espaceWallet.address
          },
          transactionHash: receipt.hash,
          gasUsed: receipt.gasUsed.toString()
        };
      } else if (method === 'getDelegation') {
        const delegation = await contract.getDelegation(params[0]);
        
        result = {
          success: true,
          data: {
            delegate: delegation.delegate,
            limit: delegation.limit.toString(),
            active: delegation.active,
            createdAt: delegation.createdAt.toString()
          }
        };
      } else if (method === 'owner') {
        const owner = await contract.owner();
        
        result = {
          success: true,
          data: {
            owner: owner
          }
        };
      } else {
        return {
          success: false,
          error: `Unknown method: ${method}`
        };
      }

      return result;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Core Contract Interactions (with mock fallback)
  async callCoreContract(method: string, params: any[] = []): Promise<ContractCallResult> {
    try {
      const deployment = this.deployments.get('core');
      if (!deployment) {
        return {
          success: false,
          error: 'No Core contract deployment found'
        };
      }

      // Check if this is a mock deployment
      if (deployment.mock) {
        return this.handleMockCoreCall(method, params, deployment);
      }

      // Real Core contract interaction would go here
      // For now, return mock response
      return this.handleMockCoreCall(method, params, deployment);

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private handleMockCoreCall(method: string, params: any[], deployment: DeploymentResult): ContractCallResult {
    // Mock responses for Core contract calls
    const mockResponses: Record<string, any> = {
      'createDelegation': {
        success: true,
        data: {
          delegator: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          delegate: params[0],
          limit: params[1].toString()
        },
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        gasUsed: '21000',
        mock: true
      },
      'revokeDelegation': {
        success: true,
        data: {
          delegator: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
        },
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        gasUsed: '21000',
        mock: true
      },
      'getDelegation': {
        success: true,
        data: {
          delegate: '0x' + Math.random().toString(16).substr(2, 40),
          limit: '1000000000000000000', // 1 ETH
          active: true,
          createdAt: Math.floor(Date.now() / 1000).toString()
        },
        mock: true
      },
      'owner': {
        success: true,
        data: {
          owner: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
        },
        mock: true
      }
    };

    const response = mockResponses[method];
    if (response) {
      return response;
    }

    return {
      success: false,
      error: `Unknown method: ${method}`,
      mock: true
    };
  }

  // Get contract status
  async getContractStatus(): Promise<ContractStatus> {
    const espaceDeployment = this.deployments.get('espace');
    const coreDeployment = this.deployments.get('core');

    return {
      espace: {
        deployed: !!espaceDeployment,
        address: espaceDeployment?.address,
        mock: espaceDeployment?.mock || false
      },
      core: {
        deployed: !!coreDeployment,
        address: coreDeployment?.address,
        mock: coreDeployment?.mock || false
      }
    };
  }

  // Get network info
  async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const espaceNetwork = await this.espaceProvider.getNetwork();
      const espaceBlockNumber = await this.espaceProvider.getBlockNumber();
      const espaceGasPrice = await this.espaceProvider.getFeeData();

      const coreStatus = await this.coreConflux.getStatus();

      return {
        espace: {
          chainId: Number(espaceNetwork.chainId),
          blockNumber: espaceBlockNumber,
          gasPrice: espaceGasPrice.gasPrice?.toString() || '0'
        },
        core: {
          networkId: this.coreConflux.networkId,
          epochNumber: coreStatus.epochNumber
        }
      };
    } catch (error) {
      throw new Error(`Failed to get network info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Counter contract methods
  async getCounterStatus(): Promise<{ count: string; maxCount: string; address: string }> {
    try {
      const counterDeployment = this.deployments.get('counter');
      if (!counterDeployment) {
        throw new Error('Counter contract not deployed');
      }

      // Counter ABI (simplified)
      const counterABI = [
        'function getCount() view returns (uint256)',
        'function getMaxCount() view returns (uint256)'
      ];

      const counterContract = new ethers.Contract(counterDeployment.address, counterABI, this.espaceProvider);
      
      const count = await counterContract.getCount();
      const maxCount = await counterContract.getMaxCount();

      return {
        count: count.toString(),
        maxCount: maxCount.toString(),
        address: counterDeployment.address
      };
    } catch (error) {
      throw new Error(`Failed to get counter status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addToCounter(value: number): Promise<ContractCallResult> {
    try {
      const counterDeployment = this.deployments.get('counter');
      if (!counterDeployment) {
        throw new Error('Counter contract not deployed');
      }

      const counterABI = [
        'function add(uint256 value) external'
      ];

      const counterContract = new ethers.Contract(counterDeployment.address, counterABI, this.espaceWallet);
      
      const tx = await counterContract.add(value);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt?.gasUsed?.toString() || '0',
        data: {
          operation: 'add',
          value: value,
          newCount: await this.getCounterStatus().then(status => status.count)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async subtractFromCounter(value: number): Promise<ContractCallResult> {
    try {
      const counterDeployment = this.deployments.get('counter');
      if (!counterDeployment) {
        throw new Error('Counter contract not deployed');
      }

      const counterABI = [
        'function subtract(uint256 value) external'
      ];

      const counterContract = new ethers.Contract(counterDeployment.address, counterABI, this.espaceWallet);
      
      const tx = await counterContract.subtract(value);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt?.gasUsed?.toString() || '0',
        data: {
          operation: 'subtract',
          value: value,
          newCount: await this.getCounterStatus().then(status => status.count)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async multiplyCounter(value: number): Promise<ContractCallResult> {
    try {
      const counterDeployment = this.deployments.get('counter');
      if (!counterDeployment) {
        throw new Error('Counter contract not deployed');
      }

      const counterABI = [
        'function multiply(uint256 value) external'
      ];

      const counterContract = new ethers.Contract(counterDeployment.address, counterABI, this.espaceWallet);
      
      const tx = await counterContract.multiply(value);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt?.gasUsed?.toString() || '0',
        data: {
          operation: 'multiply',
          value: value,
          newCount: await this.getCounterStatus().then(status => status.count)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async divideCounter(value: number): Promise<ContractCallResult> {
    try {
      const counterDeployment = this.deployments.get('counter');
      if (!counterDeployment) {
        throw new Error('Counter contract not deployed');
      }

      const counterABI = [
        'function divide(uint256 value) external'
      ];

      const counterContract = new ethers.Contract(counterDeployment.address, counterABI, this.espaceWallet);
      
      const tx = await counterContract.divide(value);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt?.gasUsed?.toString() || '0',
        data: {
          operation: 'divide',
          value: value,
          newCount: await this.getCounterStatus().then(status => status.count)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async resetCounter(): Promise<ContractCallResult> {
    try {
      const counterDeployment = this.deployments.get('counter');
      if (!counterDeployment) {
        throw new Error('Counter contract not deployed');
      }

      const counterABI = [
        'function reset() external'
      ];

      const counterContract = new ethers.Contract(counterDeployment.address, counterABI, this.espaceWallet);
      
      const tx = await counterContract.reset();
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt?.gasUsed?.toString() || '0',
        data: {
          operation: 'reset',
          newCount: '0'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async batchAddToCounter(values: number[]): Promise<ContractCallResult> {
    try {
      const counterDeployment = this.deployments.get('counter');
      if (!counterDeployment) {
        throw new Error('Counter contract not deployed');
      }

      const counterABI = [
        'function batchAdd(uint256[] calldata values) external'
      ];

      const counterContract = new ethers.Contract(counterDeployment.address, counterABI, this.espaceWallet);
      
      const tx = await counterContract.batchAdd(values);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt?.gasUsed?.toString() || '0',
        data: {
          operation: 'batchAdd',
          values: values,
          newCount: await this.getCounterStatus().then(status => status.count)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async batchSubtractFromCounter(values: number[]): Promise<ContractCallResult> {
    try {
      const counterDeployment = this.deployments.get('counter');
      if (!counterDeployment) {
        throw new Error('Counter contract not deployed');
      }

      const counterABI = [
        'function batchSubtract(uint256[] calldata values) external'
      ];

      const counterContract = new ethers.Contract(counterDeployment.address, counterABI, this.espaceWallet);
      
      const tx = await counterContract.batchSubtract(values);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt?.gasUsed?.toString() || '0',
        data: {
          operation: 'batchSubtract',
          values: values,
          newCount: await this.getCounterStatus().then(status => status.count)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}