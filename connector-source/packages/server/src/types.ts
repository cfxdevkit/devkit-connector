// Local types for server
export interface DeploymentResult {
  network: 'espace' | 'core';
  contract: string;
  address: string;
  txHash: string;
  gasUsed: string;
  timestamp: string;
  mock?: boolean;
  reason?: string;
}

export interface ContractCallResult {
  success: boolean;
  data?: any;
  error?: string;
  transactionHash?: string;
  gasUsed?: string;
  mock?: boolean;
}

export interface DelegationData {
  delegate: string;
  limit: string;
  active: boolean;
  createdAt: string;
}

export interface ContractStatus {
  espace: {
    deployed: boolean;
    address?: string;
    mock?: boolean;
  };
  core: {
    deployed: boolean;
    address?: string;
    mock?: boolean;
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
