// Browser-safe types for frontend consumption

import type { BrowserAddress } from '../utils/type-normalization';

// Browser-safe wallet information
export interface BrowserWalletInfo {
  index: number;
  address: BrowserAddress;
  privateKey: string; // Never expose in production!
  mnemonic?: string;
  balance: string; // Formatted balance as string
  balanceFormatted: string; // Human-readable balance
  isMining: boolean;
}

// Browser-safe transaction receipt
export interface BrowserTransactionReceipt {
  transactionHash: string;
  blockNumber: string;
  blockHash: string;
  from: BrowserAddress;
  to: BrowserAddress | null;
  gasUsed: string;
  status: 'success' | 'reverted';
  contractAddress?: BrowserAddress | null;
  transactionIndex: string;
  effectiveGasPrice: string;
  logs: BrowserLog[];
}

// Browser-safe log entry
export interface BrowserLog {
  address: BrowserAddress;
  topics: string[];
  data: string;
  blockNumber: string;
  blockHash: string;
  transactionHash: string;
  logIndex: string;
  transactionIndex: string;
  removed: boolean;
}

// Browser-safe block information
export interface BrowserBlock {
  number: string | null;
  hash: string;
  parentHash: string;
  timestamp: string;
  gasLimit: string;
  gasUsed: string;
  baseFeePerGas: string;
  transactions: string[]; // Transaction hashes only for simplicity
}

// Browser-safe transaction information
export interface BrowserTransaction {
  hash: string;
  from: BrowserAddress;
  to: BrowserAddress | null;
  value: string;
  gas: string;
  gasPrice: string;
  nonce: string;
  blockNumber: string | null;
  blockHash: string | null;
  transactionIndex: string | null;
}

// Browser-safe contract call result
export interface BrowserContractCallResult {
  result: string; // JSON stringified result
  gasUsed: string;
  blockNumber: string;
}

// Browser-safe deployment result
export interface BrowserDeploymentResult {
  contractName: string;
  address: BrowserAddress;
  txHash: string;
  gasUsed: string;
  timestamp: string; // ISO string
  abi: string; // JSON stringified ABI
  bytecode: string;
  deployedBytecode: string;
  network: string;
  chainId: string;
  evmChainId?: string;
  chainType: 'core' | 'evm';
}

// Browser-safe node status
export interface BrowserNodeStatus {
  running: boolean;
  corePort: string;
  evmPort: string;
  chainId: string;
  evmChainId: string;
  blockNumber: string;
  peerCount: string;
  walletMode: 'mnemonic' | 'privatekey';
  wallets: BrowserWalletInfo[];
  miningAddress: BrowserAddress | null;
}

// Browser-safe network configuration
export interface BrowserNetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: string;
  evmChainId?: string;
  currency: {
    name: string;
    symbol: string;
    decimals: string;
  };
  isTestnet: boolean;
  networkType: 'core' | 'evm';
}

// Browser-safe contract orchestrator
export interface BrowserContractOrchestrator {
  name: string;
  address: BrowserAddress;
  abi: string; // JSON stringified ABI
  bytecode: string;
  deployedBytecode: string;
  chainType: 'core' | 'evm';
  networkId: string;
  chainId: string;
  evmChainId?: string;
  network: BrowserNetworkConfig;
  methods: {
    read: string[]; // Method names
    write: string[]; // Method names
    events: string[]; // Event names
  };
  capabilities: {
    read: boolean;
    write: boolean;
    events: boolean;
  };
}

// Utility type for converting any object to browser-safe format
export type BrowserSafe<T> = {
  [K in keyof T]: T[K] extends bigint
    ? string
    : T[K] extends `0x${string}`
      ? BrowserAddress
      : T[K] extends string
        ? string
        : T[K] extends number
          ? string
          : T[K] extends boolean
            ? boolean
            : T[K] extends Date
              ? string
              : T[K] extends object
                ? BrowserSafe<T[K]>
                : string;
};
