// Core types for the minimal server
export interface DeploymentResult {
  network: string;
  contract: string;
  address: string;
  txHash: string;
  gasUsed: string;
  timestamp: string;
  mock: boolean;
}

export interface ContractCallResult {
  success: boolean;
  data?: unknown;
  error?: string;
  transactionHash?: string;
  gasUsed?: string;
  mock?: boolean;
}

export interface ContractStatus {
  espace: {
    deployed: boolean;
    address?: string;
    mock: boolean;
  };
  core: {
    deployed: boolean;
    address?: string;
    mock: boolean;
  };
}

export interface NetworkInfo {
  espace: {
    chainId: number;
    blockNumber: number;
    gasPrice: string;
  };
  core: {
    networkId: number;
    epochNumber: number;
  };
}

export interface ContractServiceConfig {
  espaceRpcUrl: string;
  coreRpcUrl: string;
  privateKey: string;
  deploymentsPath: string;
}

// Counter-specific types
export interface CounterStatus {
  count: string;
  maxCount: string;
  address: string;
}

export interface CounterOperation {
  operation: string;
  value?: number;
  values?: number[];
  newCount: string;
}
