// Common types used across the devkit
export interface WalletInfo {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface ContractInfo {
  address: string;
  abi: unknown[];
  name: string;
  version?: string;
}

export interface DeploymentConfig {
  contracts: ContractInfo[];
  networks: NetworkConfig[];
}

// Wallet types
export type WalletType = 'mnemonic' | 'privateKey';

export interface WalletConfig {
  type: WalletType;
  value: string;
  index?: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Transaction types
export interface TransactionRequest {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
}

export interface TransactionResponse {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  status: 'pending' | 'success' | 'failed';
}
