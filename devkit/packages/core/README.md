# @conflux-devkit/core

Core types, constants, schemas, and utilities for Conflux blockchain development.

## 🎯 Overview

The core package provides the foundational types, constants, and utilities that all other packages depend on. It defines the unified type system and provides essential functionality for Conflux blockchain development.

## 📦 Features

- **Unified Type System** - Comprehensive TypeScript types for all Conflux operations
- **Network Configuration** - Support for 6 Conflux network combinations
- **Validation Schemas** - Zod schemas for runtime validation
- **Constants** - Network IDs, addresses, and configuration defaults
- **Utilities** - Type normalization and browser-safe conversions
- **API Types** - Standardized API response patterns

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CORE PACKAGE                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     TYPES       │    │   CONSTANTS     │    │    SCHEMAS      │
│                 │    │                 │    │                 │
│  • NodeConfig   │    │  • Network IDs  │    │  • Zod schemas  │
│  • WalletInfo   │    │  • Chain IDs    │    │  • Validation   │
│  • NetworkConfig│    │  • RPC URLs     │    │  • Type guards  │
│  • Transaction  │    │  • Addresses    │    │  • Parsers      │
│  • Contract     │    │  • Defaults     │    │  • Transformers │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    UTILITIES    │    │   API TYPES     │    │  BROWSER TYPES  │
│                 │    │                 │    │                 │
│  • Normalization│    │  • ApiResponse  │    │  • BrowserWallet│
│  • Conversion   │    │  • ApiError     │    │  • BrowserTx    │
│  • Validation   │    │  • ResponseMeta │    │  • BrowserBlock │
│  • Formatting   │    │  • Error Classes│    │  • BrowserContract│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Usage

### Basic Types

```typescript
import type {
  NodeConfig,
  WalletInfo,
  NetworkConfig,
} from '@conflux-devkit/core';

// Node configuration
const config: NodeConfig = {
  corePort: 12537,
  evmPort: 8545,
  chainId: 2029,
  evmChainId: 2030,
  network: 'local',
  // ... other properties
};

// Wallet information
const wallet: WalletInfo = {
  address: '0x1234...',
  privateKey: '0xabcd...',
  balance: 1000000000000000000n,
  // ... other properties
};
```

### Network Configuration

```typescript
import {
  createDefaultXcfxConfig,
  getNetworkConfig,
} from '@conflux-devkit/core';

// Get default configuration
const defaultConfig = createDefaultXcfxConfig();

// Get specific network configuration
const mainnetConfig = getNetworkConfig('mainnet', 'core');
const testnetConfig = getNetworkConfig('testnet', 'evm');
```

### Type Normalization

```typescript
import {
  normalizeAddress,
  normalizeBigInt,
  toBrowserWalletInfo,
} from '@conflux-devkit/core';

// Normalize addresses
const normalizedAddress = normalizeAddress('0x1234...');

// Normalize big integers
const normalizedBigInt = normalizeBigInt(1000000000000000000n);

// Convert to browser-safe types
const browserWallet = toBrowserWalletInfo(walletInfo);
```

### API Response Types

```typescript
import {
  createApiResponse,
  createSuccessResponse,
  createErrorResponse,
} from '@conflux-devkit/core';

// Create API responses
const successResponse = createSuccessResponse(data);
const errorResponse = createErrorResponse(error);
```

## 📋 Supported Networks

| Network | Type | Chain ID | EVM Chain ID | RPC Port | EVM Port |
| ------- | ---- | -------- | ------------ | -------- | -------- |
| Mainnet | Core | 1029     | 1030         | 12537    | 8545     |
| Mainnet | EVM  | 1029     | 1030         | 12537    | 8545     |
| Testnet | Core | 2029     | 2030         | 12537    | 8545     |
| Testnet | EVM  | 2029     | 2030         | 12537    | 8545     |
| Local   | Core | 2029     | 2030         | 12537    | 8545     |
| Local   | EVM  | 2029     | 2030         | 12537    | 8545     |

## 🔧 API Reference

### Core Types

- `NodeConfig` - Node configuration interface
- `WalletInfo` - Wallet information interface
- `NetworkConfig` - Network configuration interface
- `TransactionRequest` - Transaction request interface
- `TransactionResponse` - Transaction response interface
- `ContractOrchestrator` - Contract orchestration interface

### Constants

- `NETWORK_IDS` - Network identifier constants
- `CHAIN_IDS` - Chain ID constants
- `RPC_URLS` - RPC URL constants
- `DEFAULT_CONFIG` - Default configuration constants

### Utilities

- `normalizeAddress()` - Normalize address format
- `normalizeBigInt()` - Normalize big integer
- `toBrowserWalletInfo()` - Convert to browser-safe wallet info
- `createApiResponse()` - Create API response
- `validateNodeConfig()` - Validate node configuration

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test
pnpm test -- --grep "normalizeAddress"
```

## 📚 Examples

See the [examples](./examples/) directory for usage examples and patterns.

## 🤝 Contributing

1. Follow the TypeScript coding standards
2. Add tests for new functionality
3. Update documentation
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.
