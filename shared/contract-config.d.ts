// Auto-generated contract configuration types
// Generated: 2025-12-22T08:05:29.346Z

export interface ContractConfig {
  name: string;
  address: string;
  network: string;
  source: 'legacy' | 'ignition';
  abi: any[];
  functions: number;
  events: number;
  metadata: Record<string, any>;
  artifact?: {
    contractName: string;
    sourceName: string;
    bytecode: string | null;
    deployedBytecode: string | null;
  };
}

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  type: 'eSpace' | 'core';
}

export interface Config {
  metadata: {
    generated: string;
    version: string;
    sources: string[];
  };
  networks: Record<string, NetworkConfig>;
  contracts: Record<string, ContractConfig>;
}

// Contract addresses (for convenience)
export const CONTRACT_ADDRESSES = {
  COUNTER: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const,
  DELEGATION: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as const,
  DELEGATIONMANAGER: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as const,
  COUNTER: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const,
} as const;

// Contract names
export const CONTRACT_NAMES = {
  COUNTER: 'counter' as const,
  DELEGATION: 'delegation' as const,
  DELEGATIONMANAGER: 'DelegationManager' as const,
  COUNTER: 'Counter' as const,
} as const;
