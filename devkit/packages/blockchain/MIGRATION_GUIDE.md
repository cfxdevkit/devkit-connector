# Blockchain Package Migration Guide

## 🎯 **Streamlined Network Configuration**

The blockchain package has been streamlined to use the centralized 6 Conflux network states from the core package. This eliminates hardcoded network configurations and provides a consistent interface across all blockchain operations.

## 🔄 **Before vs After**

### **❌ Before (Hardcoded Configuration)**

```typescript
// Old way - hardcoded network configuration
const networkConfig: NetworkConfig = {
  name: 'Conflux eSpace Mainnet',
  rpcUrl: 'https://evm.confluxrpc.com',
  chainId: 1029,
  evmChainId: 1030,
  currency: {
    name: 'Conflux',
    symbol: 'CFX',
    decimals: 18,
  },
  isTestnet: false,
  networkType: 'evm',
};

const evmClient = new EvmClient(networkConfig, privateKey);
const coreClient = new CoreClient(networkConfig);
const walletManager = new WalletManager();
```

### **✅ After (Centralized Configuration)**

```typescript
// New way - using centralized network management
import {
  EvmClient,
  CoreClient,
  WalletManager,
  networkManager,
} from '@conflux-devkit/blockchain';

// Create clients using static factory methods
const evmClient = EvmClient.createMainnet(privateKey);
const coreClient = CoreClient.createMainnet();
const walletManager = WalletManager.createMainnet();

// Or use specific network IDs
const evmTestnet = EvmClient.createFromNetworkId('evm-testnet', privateKey);
const coreLocal = CoreClient.createFromNetworkId('core-local');
```

## 🚀 **New Features**

### **1. Network Manager**

```typescript
import { networkManager } from '@conflux-devkit/blockchain';

// Get all available networks
const allNetworks = networkManager.getAllNetworks();

// Get specific network types
const coreNetworks = networkManager.getCoreNetworks();
const evmNetworks = networkManager.getEvmNetworks();

// Get networks by environment
const localNetwork = networkManager.getLocalNetwork('evm');
const testnetNetwork = networkManager.getTestnetNetwork('core');
const mainnetNetwork = networkManager.getMainnetNetwork('evm');

// Lookup networks
const networkById = networkManager.getNetwork('evm-mainnet');
const networkByChainId = networkManager.getNetworkByChainId(1029);
const networkByEvmChainId = networkManager.getNetworkByEvmChainId(1030);
const networkByName = networkManager.getNetworkByName('Conflux eSpace Mainnet');
```

### **2. Static Factory Methods**

All client classes now provide static factory methods for easy instantiation:

#### **EvmClient**

```typescript
// Environment-specific creation
const localClient = EvmClient.createLocal(privateKey);
const testnetClient = EvmClient.createTestnet(privateKey);
const mainnetClient = EvmClient.createMainnet(privateKey);

// Network ID-based creation
const customClient = EvmClient.createFromNetworkId('evm-testnet', privateKey);
```

#### **CoreClient**

```typescript
// Environment-specific creation
const localClient = CoreClient.createLocal();
const testnetClient = CoreClient.createTestnet();
const mainnetClient = CoreClient.createMainnet();

// Network ID-based creation
const customClient = CoreClient.createFromNetworkId('core-mainnet');
```

#### **WalletManager**

```typescript
// Environment-specific creation
const localManager = WalletManager.createLocal();
const testnetManager = WalletManager.createTestnet();
const mainnetManager = WalletManager.createMainnet();

// Network ID-based creation
const customManager = WalletManager.createForNetwork('evm-mainnet');
```

## 📋 **Available Network IDs**

The system provides 6 predefined Conflux network configurations:

| Network ID     | Type | Environment | Chain ID | EVM Chain ID | Description            |
| -------------- | ---- | ----------- | -------- | ------------ | ---------------------- |
| `evm-local`    | EVM  | Local       | 2029     | 2030         | Conflux eSpace Local   |
| `evm-testnet`  | EVM  | Testnet     | 1        | 71           | Conflux eSpace Testnet |
| `evm-mainnet`  | EVM  | Mainnet     | 1029     | 1030         | Conflux eSpace Mainnet |
| `core-local`   | Core | Local       | 2029     | -            | Conflux Core Local     |
| `core-testnet` | Core | Testnet     | 1        | -            | Conflux Core Testnet   |
| `core-mainnet` | Core | Mainnet     | 1029     | -            | Conflux Core Mainnet   |

## 🔧 **Migration Steps**

### **Step 1: Update Imports**

```typescript
// Old
import {
  EvmClient,
  CoreClient,
  WalletManager,
} from '@conflux-devkit/blockchain';

// New
import {
  EvmClient,
  CoreClient,
  WalletManager,
  networkManager,
} from '@conflux-devkit/blockchain';
```

### **Step 2: Replace Hardcoded Configurations**

```typescript
// Old
const networkConfig = {
  name: 'Conflux eSpace Mainnet',
  rpcUrl: 'https://evm.confluxrpc.com',
  chainId: 1029,
  evmChainId: 1030,
  // ... more hardcoded values
};

// New
const network = networkManager.getMainnetNetwork('evm');
// or
const network = networkManager.getNetwork('evm-mainnet');
```

### **Step 3: Use Static Factory Methods**

```typescript
// Old
const evmClient = new EvmClient(networkConfig, privateKey);
const coreClient = new CoreClient(networkConfig);
const walletManager = new WalletManager();

// New
const evmClient = EvmClient.createMainnet(privateKey);
const coreClient = CoreClient.createMainnet();
const walletManager = WalletManager.createMainnet();
```

### **Step 4: Update Network Lookups**

```typescript
// Old
const network = networks.find(n => n.chainId === 1029);

// New
const network = networkManager.getNetworkByChainId(1029);
// or
const network = networkManager.getNetworkByEvmChainId(1030);
```

## 🎯 **Benefits**

1. **Centralized Configuration**: All network configurations are managed in one place
2. **Type Safety**: Full TypeScript support with proper type checking
3. **Consistency**: Same interface across all blockchain operations
4. **Maintainability**: Easy to update network configurations globally
5. **Validation**: Built-in network configuration validation
6. **Flexibility**: Support for both environment-based and ID-based network selection

## 📚 **Examples**

See `src/examples/NetworkUsageExample.ts` for comprehensive usage examples.

## ⚠️ **Breaking Changes**

- Constructor-based client creation is still supported but deprecated
- Static factory methods are the recommended approach
- Network configuration objects should be obtained from `networkManager`
- Hardcoded network configurations should be replaced with centralized ones

## 🔄 **Backward Compatibility**

The old constructor-based approach is still supported for backward compatibility, but new code should use the static factory methods and centralized network management.
