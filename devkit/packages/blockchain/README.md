# @conflux-devkit/blockchain

Blockchain operations, RPC clients, contract management, and wallet operations for Conflux development.

## 🎯 Overview

The blockchain package provides comprehensive blockchain operations including RPC clients, contract management, wallet operations, and network management. It builds on top of the core package and provides the main blockchain functionality.

## 📦 Features

- **RPC Clients** - Unified interface for Core and EVM operations
- **Contract Management** - Deployment, interaction, and orchestration
- **Wallet Operations** - Creation, management, and funding
- **Network Management** - Multi-network support and switching
- **API Types** - Normalized response types for browser compatibility
- **Type Normalization** - Browser-safe data conversion

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            BLOCKCHAIN PACKAGE                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   RPC CLIENTS   │    │   CONTRACTS     │    │    WALLETS      │
│                 │    │                 │    │                 │
│  • CoreClient   │    │  • ContractMgr  │    │  • WalletMgr    │
│  • EvmClient    │    │  • ContractDep  │    │  • WalletOps    │
│  • UnifiedClient│    │  • ContractWrap │    │  • WalletFund   │
│  • Mock Clients │    │  • ContractReg  │    │  • WalletVal    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    NETWORKS     │    │   API TYPES     │    │   UTILITIES     │
│                 │    │                 │    │                 │
│  • NetworkMgr   │    │  • ApiResponse  │    │  • Normalization│
│  • NetworkOps   │    │  • ApiError     │    │  • Conversion   │
│  • NetworkVal   │    │  • ResponseMeta │    │  • Validation   │
│  • NetworkSw    │    │  • Error Classes│    │  • Formatting   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Usage

### RPC Clients

```typescript
import {
  CoreClient,
  EvmClient,
  UnifiedClient,
} from '@conflux-devkit/blockchain';

// Create clients
const coreClient = new CoreClient('http://localhost:12537');
const evmClient = new EvmClient('http://localhost:8545');
const unifiedClient = new UnifiedClient(coreClient, evmClient);

// Use clients
const balance = await evmClient.getBalance({ address: '0x1234...' });
const blockNumber = await coreClient.getBlockNumber();
```

### Contract Management

```typescript
import { ContractManager, ContractDeployer } from '@conflux-devkit/blockchain';

// Deploy contract
const deployer = new ContractDeployer();
const result = await deployer.deploy('MyContract', constructorArgs);

// Manage contracts
const manager = new ContractManager();
await manager.registerContract('MyContract', result.address, abi);
const contract = manager.getContract('MyContract');
```

### Wallet Operations

```typescript
import { WalletManager } from '@conflux-devkit/blockchain';

// Create wallet manager
const walletManager = new WalletManager(config);

// Create wallet
const wallet = walletManager.createNewWallet();

// Fund wallet
await walletManager.fundWallet(wallet.address, 1000000000000000000n);

// Get balance
const balance = await walletManager.getBalance(wallet.address);
```

### Network Management

```typescript
import { NetworkManager } from '@conflux-devkit/blockchain';

// Create network manager
const networkManager = new NetworkManager();

// Switch network
await networkManager.switchNetwork('testnet', 'evm');

// Get network info
const info = await networkManager.getNetworkInfo();
```

## 📋 API Reference

### RPC Clients

- `CoreClient` - Conflux Core RPC client
- `EvmClient` - EVM-compatible RPC client
- `UnifiedClient` - Unified client interface
- `MockCoreClient` - Mock client for testing
- `MockEvmClient` - Mock client for testing

### Contract Management

- `ContractManager` - Contract lifecycle management
- `ContractDeployer` - Contract deployment
- `ContractWrapper` - Contract interaction wrapper
- `ContractRegistry` - Contract registration and lookup

### Wallet Operations

- `WalletManager` - Wallet creation and management
- `WalletOperations` - Wallet operations
- `WalletFunding` - Wallet funding operations
- `WalletValidation` - Wallet validation

### Network Management

- `NetworkManager` - Network management
- `NetworkOperations` - Network operations
- `NetworkValidation` - Network validation
- `NetworkSwitching` - Network switching

## 🔧 Configuration

### Network Configuration

```typescript
import { getNetworkConfig } from '@conflux-devkit/blockchain';

// Get network configuration
const config = getNetworkConfig('testnet', 'evm');
```

### Client Configuration

```typescript
import { createClientConfig } from '@conflux-devkit/blockchain';

// Create client configuration
const clientConfig = createClientConfig({
  coreRpcUrl: 'http://localhost:12537',
  evmRpcUrl: 'http://localhost:8545',
  network: 'local',
  chainType: 'evm',
});
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test
pnpm test -- --grep "ContractManager"
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
