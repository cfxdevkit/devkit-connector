// Functional EVM RPC client implementation using viem

import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import type {
  EvmClient as IEvmClient,
  NetworkConfig,
  Block,
  TransactionReceipt,
  ReadContractParams,
  WriteContractParams,
  SendTransactionParams,
  TransactionRequest,
} from '@conflux-devkit/core';
import { networkManager } from '../network';
import {
  normalizeAddress,
  normalizeBigInt,
  normalizeTxHash,
  normalizeBlockNumber,
} from '@conflux-devkit/core';

export class EvmClient implements IEvmClient {
  private client: ReturnType<typeof createPublicClient>;
  private walletClient: ReturnType<typeof createWalletClient> | null = null;
  private networkConfig: NetworkConfig;

  constructor(network: NetworkConfig, privateKey?: `0x${string}`) {
    this.networkConfig = network;

    // Create public client
    this.client = createPublicClient({
      transport: http(network.rpcUrl),
    });

    // Create wallet client if private key provided
    if (privateKey) {
      const account = privateKeyToAccount(privateKey);
      this.walletClient = createWalletClient({
        account,
        transport: http(network.rpcUrl),
      });
    }
  }

  /**
   * Create EVM client using network manager
   */
  static createFromNetworkId(
    networkId: string,
    privateKey?: `0x${string}`
  ): EvmClient {
    const network = networkManager.getNetwork(networkId);
    if (!network) {
      throw new Error(`Network not found: ${networkId}`);
    }
    return new EvmClient(network, privateKey);
  }

  static createLocal(privateKey?: `0x${string}`): EvmClient {
    const network = networkManager.getLocalNetwork('evm');
    if (!network) {
      throw new Error('EVM local network not found');
    }
    return new EvmClient(network, privateKey);
  }

  static createTestnet(privateKey?: `0x${string}`): EvmClient {
    const network = networkManager.getTestnetNetwork('evm');
    if (!network) {
      throw new Error('EVM testnet network not found');
    }
    return new EvmClient(network, privateKey);
  }

  static createMainnet(privateKey?: `0x${string}`): EvmClient {
    const network = networkManager.getMainnetNetwork('evm');
    if (!network) {
      throw new Error('EVM mainnet network not found');
    }
    return new EvmClient(network, privateKey);
  }

  // Functional implementations using viem
  async getBalance(params: { address: `0x${string}` }): Promise<bigint> {
    const normalizedAddress = normalizeAddress(params.address);
    if (!normalizedAddress.startsWith('0x')) {
      throw new Error(`Invalid EVM address format: ${normalizedAddress}`);
    }
    return await this.client.getBalance({
      address: normalizedAddress as Address,
    });
  }

  async getBlockNumber(): Promise<bigint> {
    return await this.client.getBlockNumber();
  }

  async getBlock(
    params: { blockNumber: bigint } | { blockTag: 'latest' }
  ): Promise<Block> {
    const block = await this.client.getBlock(params);
    return {
      number: block.number ? BigInt(block.number.toString()) : null,
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: BigInt(block.timestamp.toString()),
      gasLimit: block.gasLimit,
      gasUsed: block.gasUsed,
      // miner: block.miner, // Not in our Block interface
      transactions: [], // Simplified for now
    };
  }

  async getTransactionReceipt(params: {
    hash: `0x${string}`;
  }): Promise<TransactionReceipt | null> {
    const receipt = await this.client.getTransactionReceipt({
      hash: params.hash,
    });
    if (!receipt) return null;

    return {
      transactionHash: receipt.transactionHash as `0x${string}`,
      blockNumber: receipt.blockNumber
        ? BigInt(receipt.blockNumber.toString())
        : null,
      blockHash: receipt.blockHash || '',
      from: receipt.from as `0x${string}`,
      to: receipt.to ? (receipt.to as `0x${string}`) : null,
      gasUsed: receipt.gasUsed,
      status: receipt.status === 'success' ? 'success' : 'reverted',
      contractAddress: receipt.contractAddress
        ? (receipt.contractAddress as `0x${string}`)
        : null,
      transactionIndex: receipt.transactionIndex,
      effectiveGasPrice: receipt.effectiveGasPrice || 0n,
      logs: [], // Simplified for now
    };
  }

  async sendTransaction(params: TransactionRequest): Promise<`0x${string}`> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized - private key required');
    }

    // Simplified implementation
    throw new Error(
      'sendTransaction not implemented - use viem directly for now'
    );
  }

  async call(params: {
    to: `0x${string}`;
    data: `0x${string}`;
  }): Promise<`0x${string}`> {
    const result = await this.client.call({
      to: params.to as Address,
      data: params.data,
    });
    return result as unknown as `0x${string}`;
  }

  async getNetworkId(): Promise<number> {
    return await this.client.getChainId();
  }

  async getGasPrice(): Promise<bigint> {
    return await this.client.getGasPrice();
  }

  async readContract(params: ReadContractParams): Promise<unknown> {
    return await this.client.readContract({
      address: params.address as Address,
      abi: params.abi,
      functionName: params.functionName,
      args: params.args,
    });
  }

  async writeContract(params: WriteContractParams): Promise<`0x${string}`> {
    // Simplified implementation
    throw new Error(
      'writeContract not implemented - use viem directly for now'
    );
  }

  async getChainId(): Promise<number> {
    return await this.client.getChainId();
  }

  async estimateGas(params: TransactionRequest): Promise<bigint> {
    return await this.client.estimateGas({
      to: params.to as Address,
      value: params.value || 0n,
      data: params.data || '0x',
    });
  }
}
