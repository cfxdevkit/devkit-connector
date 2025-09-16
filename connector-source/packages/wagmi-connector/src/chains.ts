import { defineChain } from 'viem'

export const confluxESpace = defineChain({
  id: 1030,
  name: 'Conflux eSpace',
  network: 'conflux-espace',
  nativeCurrency: {
    decimals: 18,
    name: 'Conflux',
    symbol: 'CFX',
  },
  rpcUrls: {
    default: {
      http: ['https://evm.confluxrpc.com'],
    },
    public: {
      http: ['https://evm.confluxrpc.com'],
    },
  },
  blockExplorers: {
    default: { name: 'ConfluxScan', url: 'https://evm.confluxscan.net' },
  },
})

export const confluxESpaceTestnet = defineChain({
  id: 71,
  name: 'Conflux eSpace Testnet',
  network: 'conflux-espace-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Conflux',
    symbol: 'CFX',
  },
  rpcUrls: {
    default: {
      http: ['https://evmtestnet.confluxrpc.com'],
    },
    public: {
      http: ['https://evmtestnet.confluxrpc.com'],
    },
  },
  blockExplorers: {
    default: { name: 'ConfluxScan Testnet', url: 'https://evmtestnet.confluxscan.net' },
  },
  testnet: true,
})

export const confluxCore = defineChain({
  id: 1029,
  name: 'Conflux Core',
  network: 'conflux-core',
  nativeCurrency: {
    decimals: 18,
    name: 'Conflux',
    symbol: 'CFX',
  },
  rpcUrls: {
    default: {
      http: ['https://main.confluxrpc.com'],
    },
    public: {
      http: ['https://main.confluxrpc.com'],
    },
  },
  blockExplorers: {
    default: { name: 'ConfluxScan Core', url: 'https://confluxscan.net' },
  },
})

export const confluxCoreTestnet = defineChain({
  id: 1,
  name: 'Conflux Core Testnet',
  network: 'conflux-core-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Conflux',
    symbol: 'CFX',
  },
  rpcUrls: {
    default: {
      http: ['https://test.confluxrpc.com'],
    },
    public: {
      http: ['https://test.confluxrpc.com'],
    },
  },
  blockExplorers: {
    default: { name: 'ConfluxScan Core Testnet', url: 'https://testnet.confluxscan.net' },
  },
  testnet: true,
})
