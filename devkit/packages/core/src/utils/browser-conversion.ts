// Browser-safe conversion utilities

import type {
  Block,
  ContractCallResult,
  DeploymentResult,
  NetworkConfig,
  Transaction,
  TransactionReceipt,
  WalletInfo,
} from '../types/blockchain';
import type {
  BrowserBlock,
  BrowserContractCallResult,
  BrowserContractOrchestrator,
  BrowserDeploymentResult,
  BrowserNetworkConfig,
  BrowserNodeStatus,
  BrowserTransaction,
  BrowserTransactionReceipt,
  BrowserWalletInfo,
} from '../types/browser-safe';
import type { ContractOrchestrator } from '../types/contract-orchestration';
import type { NodeStatus } from '../types/node';
import {
  createBrowserSafeObject,
  normalizeAddress,
  normalizeBigInt,
  normalizeBlockNumber,
  normalizeTxHash,
} from './type-normalization';

/**
 * Convert WalletInfo to browser-safe format
 */
export function toBrowserWalletInfo(wallet: WalletInfo): BrowserWalletInfo {
  return {
    index: wallet.index,
    address: normalizeAddress(wallet.address),
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic,
    balance: wallet.balance ? normalizeBigInt(wallet.balance) : '0',
    balanceFormatted: wallet.balanceFormatted || '0',
    isMining: wallet.isMining || false,
  };
}

/**
 * Convert TransactionReceipt to browser-safe format
 */
export function toBrowserTransactionReceipt(
  receipt: TransactionReceipt
): BrowserTransactionReceipt {
  return {
    transactionHash: normalizeTxHash(receipt.transactionHash),
    blockNumber: normalizeBlockNumber(receipt.blockNumber || 0),
    blockHash: receipt.blockHash || '',
    from: normalizeAddress(receipt.from),
    to: receipt.to ? normalizeAddress(receipt.to) : null,
    gasUsed: normalizeBigInt(receipt.gasUsed),
    status: receipt.status,
    contractAddress: receipt.contractAddress
      ? normalizeAddress(receipt.contractAddress)
      : null,
    transactionIndex: normalizeBigInt(receipt.transactionIndex || 0),
    effectiveGasPrice: normalizeBigInt(receipt.effectiveGasPrice || 0),
    logs: receipt.logs.map((log) => ({
      address: normalizeAddress(log.address),
      topics: log.topics,
      data: log.data,
      blockNumber: normalizeBlockNumber(log.blockNumber || 0),
      transactionHash: normalizeTxHash(log.transactionHash || ''),
      logIndex: normalizeBigInt(log.logIndex || 0),
      transactionIndex: normalizeBigInt(log.transactionIndex || 0),
    })),
  };
}

/**
 * Convert Block to browser-safe format
 */
export function toBrowserBlock(block: Block): BrowserBlock {
  return {
    number: block.number ? normalizeBlockNumber(block.number) : null,
    hash: block.hash || '',
    parentHash: block.parentHash,
    timestamp: normalizeBigInt(block.timestamp),
    gasLimit: normalizeBigInt(block.gasLimit),
    gasUsed: normalizeBigInt(block.gasUsed),
    transactions: block.transactions.map((tx) =>
      typeof tx === 'string' ? tx : normalizeTxHash(tx.hash)
    ),
  };
}

/**
 * Convert Transaction to browser-safe format
 */
export function toBrowserTransaction(
  transaction: Transaction
): BrowserTransaction {
  return {
    hash: normalizeTxHash(transaction.hash),
    from: normalizeAddress(transaction.from),
    to: transaction.to ? normalizeAddress(transaction.to) : null,
    value: normalizeBigInt(transaction.value),
    gas: normalizeBigInt(transaction.gas),
    gasPrice: normalizeBigInt(transaction.gasPrice),
    nonce: normalizeBigInt(transaction.nonce),
    blockNumber: transaction.blockNumber
      ? normalizeBlockNumber(transaction.blockNumber)
      : null,
    blockHash: transaction.blockHash,
    transactionIndex: transaction.transactionIndex
      ? normalizeBigInt(transaction.transactionIndex)
      : null,
  };
}

/**
 * Convert ContractCallResult to browser-safe format
 */
export function toBrowserContractCallResult(
  result: ContractCallResult
): BrowserContractCallResult {
  return {
    result: JSON.stringify(result.result),
    gasUsed: normalizeBigInt(result.gasUsed),
    blockNumber: normalizeBlockNumber(result.blockNumber),
  };
}

/**
 * Convert DeploymentResult to browser-safe format
 */
export function toBrowserDeploymentResult(
  result: DeploymentResult
): BrowserDeploymentResult {
  return {
    contractName: result.contract,
    address: normalizeAddress(result.address),
    txHash: normalizeTxHash(result.txHash),
    gasUsed: normalizeBigInt(result.gasUsed),
    timestamp:
      result.timestamp instanceof Date
        ? result.timestamp.toISOString()
        : result.timestamp,
    abi: '[]', // Default empty ABI since it's not in DeploymentResult
    bytecode: '0x', // Default empty bytecode
    deployedBytecode: '0x', // Default empty deployed bytecode
    network: result.network,
    chainId: '0', // Default since it's not in DeploymentResult
    evmChainId: undefined, // Not available in DeploymentResult
    chainType: 'evm', // Default to EVM since it's not specified
  };
}

/**
 * Convert NodeStatus to browser-safe format
 */
export function toBrowserNodeStatus(status: NodeStatus): BrowserNodeStatus {
  return {
    running: status.running,
    corePort: normalizeBigInt(status.corePort || 0),
    evmPort: normalizeBigInt(status.evmPort || 0),
    chainId: normalizeBigInt(status.chainId || 0),
    evmChainId: normalizeBigInt(status.evmChainId || 0),
    blockNumber: normalizeBlockNumber(status.blockNumber || 0),
    peerCount: normalizeBigInt(status.peerCount || 0),
    walletMode: status.walletMode || 'mnemonic',
    wallets: (status.wallets || []).map(toBrowserWalletInfo),
    miningAddress: status.miningAddress
      ? normalizeAddress(status.miningAddress)
      : null,
  };
}

/**
 * Convert NetworkConfig to browser-safe format
 */
export function toBrowserNetworkConfig(
  config: NetworkConfig
): BrowserNetworkConfig {
  return {
    name: config.name,
    rpcUrl: config.rpcUrl,
    chainId: normalizeBigInt(config.chainId),
    evmChainId: config.evmChainId
      ? normalizeBigInt(config.evmChainId)
      : undefined,
    currency: {
      name: config.currency.name,
      symbol: config.currency.symbol,
      decimals: normalizeBigInt(config.currency.decimals),
    },
    isTestnet: config.isTestnet,
    networkType: config.networkType || 'evm',
  };
}

/**
 * Convert ContractOrchestrator to browser-safe format
 */
export function toBrowserContractOrchestrator(
  orchestrator: ContractOrchestrator
): BrowserContractOrchestrator {
  return {
    name: orchestrator.name,
    address: normalizeAddress(orchestrator.address),
    abi: JSON.stringify(orchestrator.abi),
    bytecode: orchestrator.bytecode,
    deployedBytecode: orchestrator.deployedBytecode,
    chainType: orchestrator.chainType,
    networkId: orchestrator.networkId,
    chainId: normalizeBigInt(orchestrator.chainId),
    evmChainId: orchestrator.evmChainId
      ? normalizeBigInt(orchestrator.evmChainId)
      : undefined,
    network: toBrowserNetworkConfig({
      ...orchestrator.network,
      chainId: orchestrator.chainId,
      evmChainId: orchestrator.evmChainId,
      networkType: orchestrator.chainType,
    } as NetworkConfig),
    methods: {
      read: orchestrator.methods.read.map((m: any) => m.name),
      write: orchestrator.methods.write.map((m: any) => m.name),
      events: orchestrator.methods.events.map((e: any) => e.name),
    },
    capabilities: {
      read: orchestrator.capabilities.canRead,
      write: orchestrator.capabilities.canWrite,
      events: orchestrator.capabilities.hasEvents,
    },
  };
}

/**
 * Generic function to convert any object to browser-safe format
 */
export function toBrowserSafe<T extends Record<string, any>>(
  data: T,
  addressFields: (keyof T)[] = [],
  bigintFields: (keyof T)[] = [],
  hashFields: (keyof T)[] = []
): Record<string, string> {
  return createBrowserSafeObject(data, addressFields, bigintFields, hashFields);
}
