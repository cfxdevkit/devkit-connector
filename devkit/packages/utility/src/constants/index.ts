// Common constants used across the devkit

export const CHAIN_IDS = {
  CONFLUX_TESTNET: 1,
  CONFLUX_MAINNET: 1029,
  LOCAL_DEVELOPMENT: 2030,
} as const;

export const CURRENCY_SYMBOLS = {
  CFX: 'CFX',
  DCFX: 'DCFX',
} as const;

export const WALLET_TYPES = {
  MNEMONIC: 'mnemonic',
  PRIVATE_KEY: 'privateKey',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

export const API_ENDPOINTS = {
  WALLET: '/api/wallet',
  TRANSACTION: '/api/transaction',
  CONTRACT: '/api/contract',
  NETWORK: '/api/network',
} as const;

export const DEFAULT_GAS_LIMITS = {
  SIMPLE_TRANSFER: 21000,
  CONTRACT_CALL: 100000,
  CONTRACT_DEPLOYMENT: 500000,
} as const;

export const DEFAULT_GAS_PRICES = {
  LOW: '1000000000', // 1 gwei
  MEDIUM: '2000000000', // 2 gwei
  HIGH: '5000000000', // 5 gwei
} as const;
