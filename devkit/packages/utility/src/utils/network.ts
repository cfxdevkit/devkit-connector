import type { NetworkConfig } from '../types';

/**
 * Default network configurations
 */
export const DEFAULT_NETWORKS: NetworkConfig[] = [
  {
    name: 'Conflux Testnet',
    rpcUrl: 'https://test.confluxrpc.com',
    chainId: 1,
    currency: {
      name: 'Conflux',
      symbol: 'CFX',
      decimals: 18,
    },
  },
  {
    name: 'Conflux Mainnet',
    rpcUrl: 'https://main.confluxrpc.com',
    chainId: 1029,
    currency: {
      name: 'Conflux',
      symbol: 'CFX',
      decimals: 18,
    },
  },
  {
    name: 'Local Development',
    rpcUrl: 'http://localhost:12537',
    chainId: 2030,
    currency: {
      name: 'Conflux',
      symbol: 'CFX',
      decimals: 18,
    },
  },
];

/**
 * Get network by chain ID
 */
export function getNetworkByChainId(
  chainId: number
): NetworkConfig | undefined {
  return DEFAULT_NETWORKS.find((network) => network.chainId === chainId);
}

/**
 * Get network by name
 */
export function getNetworkByName(name: string): NetworkConfig | undefined {
  return DEFAULT_NETWORKS.find(
    (network) => network.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Validate network configuration
 */
export function validateNetworkConfig(config: NetworkConfig): boolean {
  return !!(
    config.name &&
    config.rpcUrl &&
    config.chainId &&
    config.currency &&
    config.currency.name &&
    config.currency.symbol &&
    typeof config.currency.decimals === 'number'
  );
}
