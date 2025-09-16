// Contract-related types for server-side interactions

export interface ContractDeployment {
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

export interface ContractAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  transactionHash?: string;
  gasUsed?: string;
  mock?: boolean;
  details?: any;
}

export interface CreateDelegationRequest {
  delegate: string;
  limit: string;
}

export interface GetDelegationRequest {
  delegator: string;
}

export interface ContractHealthStatus {
  success: boolean;
  status: 'healthy' | 'unhealthy';
  contracts: ContractStatus;
  networks: NetworkInfo;
  timestamp: string;
  error?: string;
}
