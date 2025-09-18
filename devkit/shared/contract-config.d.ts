// Import NetworkConfig from core package to ensure consistency
export type { NetworkConfig } from '@conflux-devkit/core';

export interface ContractConfig {
  address: string;
  abi: import('@conflux-devkit/core').AbiItem[];
  networks: string[];
}

export interface ContractConfiguration {
  networks: Record<string, NetworkConfig>;
  contracts: Record<string, ContractConfig>;
  generatedAt: string;
}

declare const contractConfig: ContractConfiguration;
export default contractConfig;
