export interface DeploymentConfig {
  network: string;
  contractName: string;
  constructorArgs?: any[];
  libraries?: Record<string, string>;
  gasLimit?: number;
  gasPrice?: string;
}

export interface ContractInstance {
  address: string;
  contract: any;
  deploymentTx: string;
  network: string;
  contractName: string;
}

export interface OperationResult {
  success: boolean;
  data?: any;
  error?: string;
  txHash?: string;
  gasUsed?: number;
}

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
