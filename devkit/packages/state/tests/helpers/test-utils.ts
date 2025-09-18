// Test utilities for state package

import type { AppState } from '../../src/types/state';

/**
 * Create a mock wallet for testing
 */
export function createMockWallet(
  overrides: Partial<AppState['wallets'][0]> = {}
) {
  return {
    index: 0,
    address: '0x1234567890abcdef1234567890abcdef12345678',
    privateKey:
      '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    mnemonic:
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    balance: 0n,
    balanceFormatted: '0.0 CFX',
    isMining: false,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
    ...overrides,
  };
}

/**
 * Create a mock contract for testing
 */
export function createMockContract(
  overrides: Partial<AppState['contracts'][0]> = {}
) {
  return {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    name: 'TestContract',
    abi: [],
    bytecode: '0x1234',
    deployedAt: new Date('2023-01-01T00:00:00Z'),
    network: 'testnet',
    ...overrides,
  };
}

/**
 * Create a mock network config for testing
 */
export function createMockNetworkConfig(overrides: any = {}) {
  return {
    name: 'Test Network',
    chainId: 2029,
    rpcUrl: 'https://test.confluxrpc.com',
    currency: {
      name: 'Conflux',
      symbol: 'CFX',
      decimals: 18,
    },
    isTestnet: true,
    networkType: 'evm' as const,
    ...overrides,
  };
}

/**
 * Create a mock notification for testing
 */
export function createMockNotification(
  overrides: Partial<AppState['notifications'][0]> = {}
) {
  return {
    id: 'test-notification',
    type: 'success' as const,
    title: 'Test Notification',
    message: 'Test message',
    timestamp: new Date('2023-01-01T00:00:00Z'),
    ...overrides,
  };
}

/**
 * Create a mock contract call for testing
 */
export function createMockContractCall(
  overrides: Partial<AppState['contractCalls'][0]> = {}
) {
  return {
    id: 'test-call',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    methodName: 'testMethod',
    args: ['arg1', 'arg2'],
    result: null,
    error: null,
    status: 'pending' as const,
    timestamp: new Date('2023-01-01T00:00:00Z'),
    ...overrides,
  };
}

/**
 * Create a mock app state for testing
 */
export function createMockAppState(
  overrides: Partial<AppState> = {}
): AppState {
  return {
    wallets: [],
    contracts: [],
    nodeStatus: null,
    currentNetwork: null,
    isLoading: false,
    error: null,
    notifications: [],
    modals: {
      wallet: { isOpen: false },
      contract: { isOpen: false },
      node: { isOpen: false },
    },
    contractCalls: [],
    ...overrides,
  };
}
