// Basic types for the client package
export interface ContractConfig {
  network: 'espace' | 'core';
  rpcUrl?: string;
  contractAddress?: string;
}

export interface DelegationData {
  delegate: string;
  limit: string;
  active: boolean;
  createdAt: string;
}
