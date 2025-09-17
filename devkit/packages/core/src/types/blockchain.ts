// Blockchain-specific types aligned with viem/cive APIs

// Wallet types
export interface WalletInfo {
  index: number;
  address: `0x${string}`;
  privateKey: `0x${string}`;
  mnemonic?: string;
  balance?: bigint; // Internal: bigint for calculations
  balanceFormatted?: string; // Display: formatted string
  isMining?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Network configuration
export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  evmChainId?: number;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
  networkType?: 'core' | 'evm';
  blockExplorer?: string;
}

// Contract information
export interface ContractInfo {
  address: `0x${string}`;
  abi: AbiItem[];
  name: string;
  version?: string;
  deployedAt?: Date;
  network: string;
}

// ABI types for better type safety
export interface AbiItem {
  type: string;
  name?: string;
  inputs?: AbiInput[];
  outputs?: AbiOutput[];
  stateMutability?: string;
  anonymous?: boolean;
}

export interface AbiInput {
  name: string;
  type: string;
  indexed?: boolean;
  internalType?: string;
}

export interface AbiOutput {
  name: string;
  type: string;
  internalType?: string;
}

// Transaction types
export interface TransactionRequest {
  to: `0x${string}`;
  value?: bigint;
  data?: `0x${string}`;
  gasLimit?: bigint;
  gasPrice?: bigint;
}

export interface TransactionResponse {
  hash: `0x${string}`;
  from: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
  gasUsed: bigint;
  status: 'pending' | 'success' | 'failed';
  blockNumber?: bigint;
  confirmations?: number;
}

// Deployment result
export interface DeploymentResult {
  id: string;
  network: string;
  contract: string;
  address: `0x${string}`;
  txHash: `0x${string}`;
  gasUsed: bigint;
  timestamp: Date;
  isMock: boolean;
  blockNumber?: bigint;
  confirmations?: number;
}

// Test types
export interface TestOptions {
  network?: string;
  port?: string;
  ethPort?: string;
}

export interface TestResult {
  network: string;
  test: string;
  passed: boolean;
  duration: number;
  error?: string;
}

// Block and transaction receipt types
export interface Block {
  number: bigint | null;
  hash: `0x${string}` | null;
  parentHash: `0x${string}`;
  timestamp: bigint;
  gasLimit: bigint;
  gasUsed: bigint;
  transactions: `0x${string}`[] | Transaction[];
}

export interface Log {
  address: `0x${string}`;
  topics: `0x${string}`[];
  data: `0x${string}`;
  blockNumber: bigint | null;
  blockHash: `0x${string}` | null;
  transactionHash: `0x${string}` | null;
  transactionIndex: number | null;
  logIndex: number | null;
  removed: boolean;
}

export interface TransactionReceipt {
  transactionHash: `0x${string}`;
  blockNumber: bigint | null;
  blockHash: `0x${string}` | null;
  transactionIndex: number;
  from: `0x${string}`;
  to: `0x${string}` | null;
  gasUsed: bigint;
  effectiveGasPrice: bigint;
  status: 'success' | 'reverted';
  contractAddress: `0x${string}` | null;
  logs: Log[];
}

export interface Transaction {
  hash: `0x${string}`;
  from: `0x${string}`;
  to: `0x${string}` | null;
  value: bigint;
  gas: bigint;
  gasPrice: bigint;
  nonce: number;
  blockNumber: bigint | null;
  blockHash: `0x${string}` | null;
  transactionIndex: number | null;
}

// Contract operation types
export interface ReadContractParams {
  address: `0x${string}`;
  abi: AbiItem[];
  functionName: string;
  args?: unknown[];
}

export interface WriteContractParams {
  address: `0x${string}`;
  abi: AbiItem[];
  functionName: string;
  args?: unknown[];
  value?: bigint;
}

export interface SendTransactionParams {
  to: `0x${string}`;
  value?: bigint;
  data?: `0x${string}`;
  gas?: bigint;
  gasPrice?: bigint;
}

// Core-specific transaction types
export interface CoreTransactionRequest {
  from?: `0x${string}`;
  to: `0x${string}`;
  value?: bigint;
  data?: `0x${string}`;
  gasLimit?: bigint;
  gasPrice?: bigint;
}

export interface EvmTransactionRequest {
  from: `0x${string}`;
  to: `0x${string}`;
  value?: bigint;
  data?: `0x${string}`;
  gasLimit?: bigint;
  gasPrice?: bigint;
}

// Contract call result
export interface ContractCallResult {
  result: unknown;
  gasUsed: bigint;
  blockNumber: bigint;
}

// Unified client interface
export interface UnifiedClient {
  getBalance(params: { address: `0x${string}` }): Promise<bigint>;
  getBlockNumber(): Promise<bigint>;
  getBlock(
    params: { blockNumber: bigint } | { blockTag: 'latest' }
  ): Promise<Block>;
  getTransactionReceipt(params: {
    hash: `0x${string}`;
  }): Promise<TransactionReceipt | null>;
  sendTransaction(params: TransactionRequest): Promise<`0x${string}`>;
  call(params: {
    to: `0x${string}`;
    data: `0x${string}`;
  }): Promise<`0x${string}`>;
  getNetworkId(): Promise<number>;
  getGasPrice(): Promise<bigint>;
  estimateGas(params: TransactionRequest): Promise<bigint>;

  // Contract operations
  readContract(params: ReadContractParams): Promise<unknown>;
  writeContract(params: WriteContractParams): Promise<`0x${string}`>;

  // Network-specific operations
  getEpochNumber?(): Promise<number>; // Core-specific
  getChainId?(): Promise<number>; // EVM-specific
}

// RPC client interfaces (kept for backward compatibility)
export interface EvmClient extends UnifiedClient {
  getChainId(): Promise<number>;
  // EVM-specific methods
  readContract(params: ReadContractParams): Promise<unknown>;
  writeContract(params: WriteContractParams): Promise<`0x${string}`>;
  sendTransaction(params: SendTransactionParams): Promise<`0x${string}`>;
}

export interface CoreClient extends UnifiedClient {
  getEpochNumber(): Promise<number>;
  // Core-specific methods
  sendTransaction(params: CoreTransactionRequest): Promise<`0x${string}`>;
  call(params: {
    to: `0x${string}`;
    data: `0x${string}`;
  }): Promise<`0x${string}`>;
}
