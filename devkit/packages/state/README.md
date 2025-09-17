# @conflux-devkit/state

> **State management with Zustand for Conflux DevKit applications**

[![npm version](https://img.shields.io/npm/v/@conflux-devkit/state)](https://www.npmjs.com/package/@conflux-devkit/state)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🎯 Overview

The state package provides comprehensive state management for Conflux DevKit applications using Zustand. It includes real blockchain integration, persistent storage, and real-time updates for wallets, contracts, nodes, and network operations.

## ✨ Features

- **📊 Real State Management**: Zustand-powered state with persistence
- **🔗 Blockchain Integration**: Real wallet and contract operations
- **💾 Persistent Storage**: Automatic state persistence across sessions
- **🔄 Real-time Updates**: Live updates for blockchain data
- **🌐 Network Management**: Multi-network support and switching
- **📱 UI State**: Modal, notification, and UI state management
- **🔌 Event System**: Event-driven architecture for state changes
- **🛠️ Service Integration**: Real blockchain service integration

## 📦 Installation

```bash
pnpm add @conflux-devkit/state
# or
npm install @conflux-devkit/state
# or
yarn add @conflux-devkit/state
```

## 🚀 Quick Start

```typescript
import { useAppStore } from '@conflux-devkit/state';

function MyComponent() {
  const {
    // State
    isConnected,
    wallets,
    contracts,
    node,
    network,

    // Actions
    connect,
    createWallet,
    deployContract,
    startNode
  } = useAppStore();

  // Connect to network
  const handleConnect = async () => {
    await connect({ chainId: 2029 });
  };

  // Create wallet
  const handleCreateWallet = async () => {
    const wallet = await createWallet();
    console.log('Wallet created:', wallet.address);
  };

  // Deploy contract
  const handleDeployContract = async () => {
    const contract = await deployContract({
      name: 'MyContract',
      bytecode: '0x...',
      abi: [...],
      args: []
    });
    console.log('Contract deployed:', contract.address);
  };

  return (
    <div>
      <button onClick={handleConnect}>
        {isConnected ? 'Connected' : 'Connect'}
      </button>
      <button onClick={handleCreateWallet}>
        Create Wallet
      </button>
      <button onClick={handleDeployContract}>
        Deploy Contract
      </button>
    </div>
  );
}
```

## 📚 API Reference

### Store State

#### `AppState`

```typescript
interface AppState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Wallet state
  wallets: {
    wallets: BrowserWalletInfo[];
    activeWallet: BrowserWalletInfo | null;
    isCreating: boolean;
    isRefreshing: boolean;
    balance: string;
    error: string | null;
  };

  // Contract state
  contracts: {
    deployed: BrowserContractOrchestrator[];
    activeContract: BrowserContractOrchestrator | null;
    isDeploying: boolean;
    isCalling: boolean;
    error: string | null;
  };

  // Node state
  node: {
    isRunning: boolean;
    isStarting: boolean;
    isStopping: boolean;
    status: BrowserNodeStatus | null;
    error: string | null;
    lastHealthCheck: Date | null;
  };

  // Network state
  network: {
    current: BrowserNetworkConfig | null;
    isSwitching: boolean;
    switchError: string | null;
  };

  // UI state
  ui: {
    sidebarOpen: boolean;
    activeTab: string;
    loading: boolean;
    notifications: NotificationState[];
    modals: ModalState[];
  };
}
```

### Store Actions

#### Connection Actions

```typescript
// Connect to network
connect(config: Partial<NodeConfig>): Promise<void>;

// Disconnect from network
disconnect(): Promise<void>;

// Set connection error
setConnectionError(error: string | null): void;
```

#### Wallet Actions

```typescript
// Create new wallet
createWallet(mnemonic?: string): Promise<BrowserWalletInfo>;

// Import wallet from private key
importWallet(privateKey: string): Promise<BrowserWalletInfo>;

// Select active wallet
selectWallet(address: string): void;

// Refresh wallet balance
refreshWalletBalance(address: string): Promise<void>;

// Send transaction
sendTransaction(to: string, value: string, privateKey: string): Promise<`0x${string}`>;
```

#### Contract Actions

```typescript
// Deploy contract
deployContract(config: ContractDeploymentConfig): Promise<BrowserContractOrchestrator>;

// Select active contract
selectContract(address: string): void;

// Call contract method
callContractMethod(params: ContractCallParams): Promise<ContractCallState>;

// Subscribe to contract events
subscribeToEvents(contractAddress: string, eventName?: string): void;

// Unsubscribe from contract events
unsubscribeFromEvents(contractAddress: string, eventName?: string): void;
```

#### Node Actions

```typescript
// Start node
startNode(config?: Partial<NodeConfig>): Promise<void>;

// Stop node
stopNode(): Promise<void>;

// Restart node
restartNode(config?: Partial<NodeConfig>): Promise<void>;

// Update node status
updateNodeStatus(status: BrowserNodeStatus): void;

// Set node error
setNodeError(error: string | null): void;
```

#### Network Actions

```typescript
// Switch network
switchNetwork(networkId: string): Promise<void>;

// Get available networks
getAvailableNetworks(): BrowserNetworkConfig[];
```

#### UI Actions

```typescript
// Toggle sidebar
toggleSidebar(): void;

// Set active tab
setActiveTab(tab: string): void;

// Add notification
addNotification(notification: Omit<NotificationState, 'id' | 'timestamp'>): void;

// Remove notification
removeNotification(id: string): void;

// Open modal
openModal(modal: Omit<ModalState, 'id'>): string;

// Close modal
closeModal(id: string): void;

// Set loading state
setLoading(loading: boolean): void;
```

### Service Integration

#### `RealWalletService`

```typescript
class RealWalletService {
  // Set network for wallet operations
  setNetwork(networkId: string): void;

  // Create wallet with real blockchain integration
  createWallet(mnemonic?: string): Promise<BrowserWalletInfo>;

  // Import wallet with real blockchain integration
  importWallet(privateKey: string): Promise<BrowserWalletInfo>;

  // Get real balance from blockchain
  getBalance(address: string): Promise<string>;

  // Get formatted balance
  getFormattedBalance(address: string): Promise<string>;

  // Send real transaction
  sendTransaction(
    to: string,
    value: string,
    privateKey: string
  ): Promise<`0x${string}`>;
}
```

#### `RealContractService`

```typescript
class RealContractService {
  // Set network for contract operations
  setNetwork(networkId: string): void;

  // Deploy contract with real blockchain integration
  deployContract(
    contractName: string,
    bytecode: `0x${string}`,
    abi: AbiItem[],
    args: unknown[],
    privateKey: string
  ): Promise<BrowserContractOrchestrator>;

  // Call contract method with real blockchain integration
  callContractMethod(
    contractAddress: string,
    methodName: string,
    args: unknown[],
    privateKey?: string
  ): Promise<ContractCallResult>;

  // Send contract transaction
  sendContractTransaction(
    contractAddress: string,
    methodName: string,
    args: unknown[],
    privateKey: string
  ): Promise<`0x${string}`>;

  // Get contract code
  getContractCode(contractAddress: string): Promise<string>;
}
```

## 🧪 Examples

### Basic State Usage

```typescript
import { useAppStore } from '@conflux-devkit/state';

function WalletComponent() {
  const { wallets, createWallet, refreshWalletBalance } = useAppStore();

  const handleCreateWallet = async () => {
    try {
      const wallet = await createWallet();
      console.log('Wallet created:', wallet.address);
    } catch (error) {
      console.error('Failed to create wallet:', error);
    }
  };

  const handleRefreshBalance = async (address: string) => {
    try {
      await refreshWalletBalance(address);
      console.log('Balance refreshed');
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  return (
    <div>
      <button onClick={handleCreateWallet}>
        Create Wallet
      </button>
      {wallets.wallets.map(wallet => (
        <div key={wallet.address}>
          <p>Address: {wallet.address}</p>
          <p>Balance: {wallet.balanceFormatted}</p>
          <button onClick={() => handleRefreshBalance(wallet.address)}>
            Refresh Balance
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Contract Management

```typescript
import { useAppStore } from '@conflux-devkit/state';

function ContractComponent() {
  const { contracts, deployContract, callContractMethod } = useAppStore();

  const handleDeployContract = async () => {
    try {
      const contract = await deployContract({
        name: 'MyToken',
        bytecode: '0x608060405234801561001057600080fd5b50...',
        abi: [
          {
            "type": "function",
            "name": "totalSupply",
            "inputs": [],
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view"
          }
        ],
        args: []
      });
      console.log('Contract deployed:', contract.address);
    } catch (error) {
      console.error('Failed to deploy contract:', error);
    }
  };

  const handleCallMethod = async (contractAddress: string) => {
    try {
      const result = await callContractMethod({
        contractAddress,
        methodName: 'totalSupply',
        args: []
      });
      console.log('Method result:', result);
    } catch (error) {
      console.error('Failed to call method:', error);
    }
  };

  return (
    <div>
      <button onClick={handleDeployContract}>
        Deploy Contract
      </button>
      {contracts.deployed.map(contract => (
        <div key={contract.address}>
          <p>Contract: {contract.name}</p>
          <p>Address: {contract.address}</p>
          <button onClick={() => handleCallMethod(contract.address)}>
            Call totalSupply
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Network Management

```typescript
import { useAppStore } from '@conflux-devkit/state';

function NetworkComponent() {
  const { network, switchNetwork, getAvailableNetworks } = useAppStore();

  const handleSwitchNetwork = async (networkId: string) => {
    try {
      await switchNetwork(networkId);
      console.log('Network switched to:', networkId);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const availableNetworks = getAvailableNetworks();

  return (
    <div>
      <p>Current Network: {network.current?.name || 'None'}</p>
      <select onChange={(e) => handleSwitchNetwork(e.target.value)}>
        <option value="">Select Network</option>
        {availableNetworks.map(net => (
          <option key={net.chainId} value={net.chainId}>
            {net.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### Event Handling

```typescript
import { useAppStore } from '@conflux-devkit/state';

function EventComponent() {
  const { subscribeToEvents, unsubscribeFromEvents } = useAppStore();

  useEffect(() => {
    const contractAddress = '0x1234567890abcdef...';

    // Subscribe to all events
    subscribeToEvents(contractAddress);

    // Subscribe to specific event
    subscribeToEvents(contractAddress, 'Transfer');

    return () => {
      // Cleanup subscriptions
      unsubscribeFromEvents(contractAddress);
    };
  }, [subscribeToEvents, unsubscribeFromEvents]);

  return <div>Event subscriptions active</div>;
}
```

## 🔧 Configuration

### Store Configuration

```typescript
import { createAppStore } from '@conflux-devkit/state';

const store = createAppStore({
  // Custom configuration
  persist: true,
  devtools: process.env.NODE_ENV === 'development',
});
```

### Persistence Configuration

```typescript
// The store automatically persists to localStorage
// Customize persistence behavior
const store = createAppStore({
  persist: {
    name: 'conflux-devkit-state',
    storage: localStorage,
    partialize: state => ({
      wallets: state.wallets,
      network: state.network,
      ui: state.ui,
    }),
  },
});
```

## 🔗 Dependencies

- **zustand**: State management
- **zustand/middleware**: Persistence and immer
- **@conflux-devkit/core**: Core types and utilities
- **@conflux-devkit/blockchain**: Blockchain interactions
- **bip32**: HD wallet key derivation
- **bip39**: Mnemonic generation
- **viem**: EVM interactions

## 📊 Bundle Size

- **Minified**: ~35KB
- **Gzipped**: ~12KB
- **Tree-shakeable**: Import only what you need

## 🚨 Security Notes

- **Private Keys**: Never expose private keys in client-side code
- **State Persistence**: Sensitive data is not persisted by default
- **Network Security**: Always verify network configurations
- **Transaction Validation**: Validate all transaction parameters

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Part of the Conflux DevKit ecosystem** 🚀
