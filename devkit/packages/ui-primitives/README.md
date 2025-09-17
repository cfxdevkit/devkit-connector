# @conflux-devkit/ui-primitives

> **React hooks, context providers, and UI primitives for Conflux DevKit applications**

[![npm version](https://img.shields.io/npm/v/@conflux-devkit/ui-primitives)](https://www.npmjs.com/package/@conflux-devkit/ui-primitives)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🎯 Overview

The UI primitives package provides React hooks, context providers, and UI utilities for building Conflux DevKit applications. It offers a clean abstraction layer over the state management system with React-specific optimizations and patterns.

## ✨ Features

- **🎣 React Hooks**: Custom hooks for all DevKit functionality
- **🌐 Context Providers**: React context for state management
- **📱 UI State**: Modal, notification, and UI state management
- **🔄 Real-time Updates**: Live updates with React optimizations
- **🎨 Theme Support**: Built-in theming and styling utilities
- **📊 Data Hooks**: Specialized hooks for blockchain data
- **🛠️ Utilities**: React-specific utility functions
- **⚡ Performance**: Optimized with React best practices

## 📦 Installation

```bash
pnpm add @conflux-devkit/ui-primitives
# or
npm install @conflux-devkit/ui-primitives
# or
yarn add @conflux-devkit/ui-primitives
```

## 🚀 Quick Start

```typescript
import React from 'react';
import {
  ConfluxProvider,
  useWallets,
  useContracts,
  useNode,
  useNetwork
} from '@conflux-devkit/ui-primitives';

function App() {
  return (
    <ConfluxProvider>
      <WalletComponent />
      <ContractComponent />
      <NodeComponent />
    </ConfluxProvider>
  );
}

function WalletComponent() {
  const { wallets, createWallet, refreshBalance } = useWallets();

  const handleCreateWallet = async () => {
    await createWallet();
  };

  return (
    <div>
      <button onClick={handleCreateWallet}>
        Create Wallet
      </button>
      {wallets.map(wallet => (
        <div key={wallet.address}>
          <p>{wallet.address}</p>
          <p>{wallet.balanceFormatted}</p>
        </div>
      ))}
    </div>
  );
}
```

## 📚 API Reference

### Context Providers

#### `ConfluxProvider`

```typescript
interface ConfluxProviderProps {
  children: React.ReactNode;
  config?: {
    persist?: boolean;
    devtools?: boolean;
  };
}

function ConfluxProvider({
  children,
  config,
}: ConfluxProviderProps): JSX.Element;
```

#### `UIContext`

```typescript
interface UIContextValue {
  // UI state
  sidebarOpen: boolean;
  activeTab: string;
  loading: boolean;

  // Actions
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  setLoading: (loading: boolean) => void;

  // Notifications
  addNotification: (
    notification: Omit<NotificationState, 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;

  // Modals
  openModal: (modal: Omit<ModalState, 'id'>) => string;
  closeModal: (id: string) => void;
}
```

### Hooks

#### Wallet Hooks

##### `useWallets`

```typescript
function useWallets(): {
  // State
  wallets: BrowserWalletInfo[];
  activeWallet: BrowserWalletInfo | null;
  isCreating: boolean;
  isRefreshing: boolean;
  balance: string;
  error: string | null;

  // Actions
  createWallet: (mnemonic?: string) => Promise<BrowserWalletInfo>;
  importWallet: (privateKey: string) => Promise<BrowserWalletInfo>;
  selectWallet: (address: string) => void;
  refreshBalance: (address: string) => Promise<void>;
  sendTransaction: (
    to: string,
    value: string,
    privateKey: string
  ) => Promise<`0x${string}`>;
};
```

##### `useWallet`

```typescript
function useWallet(address: string): {
  wallet: BrowserWalletInfo | null;
  isRefreshing: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
  sendTransaction: (
    to: string,
    value: string,
    privateKey: string
  ) => Promise<`0x${string}`>;
};
```

#### Contract Hooks

##### `useContracts`

```typescript
function useContracts(): {
  // State
  contracts: BrowserContractOrchestrator[];
  activeContract: BrowserContractOrchestrator | null;
  isDeploying: boolean;
  isCalling: boolean;
  error: string | null;

  // Actions
  deployContract: (
    config: ContractDeploymentConfig
  ) => Promise<BrowserContractOrchestrator>;
  selectContract: (address: string) => void;
  callContractMethod: (
    params: ContractCallParams
  ) => Promise<ContractCallState>;
  subscribeToEvents: (contractAddress: string, eventName?: string) => void;
  unsubscribeFromEvents: (contractAddress: string, eventName?: string) => void;
};
```

##### `useContract`

```typescript
function useContract(address: string): {
  contract: BrowserContractOrchestrator | null;
  isCalling: boolean;
  error: string | null;
  callMethod: (
    methodName: string,
    args: unknown[],
    privateKey?: string
  ) => Promise<ContractCallState>;
  sendTransaction: (
    methodName: string,
    args: unknown[],
    privateKey: string
  ) => Promise<`0x${string}`>;
};
```

#### Node Hooks

##### `useNode`

```typescript
function useNode(): {
  // State
  isRunning: boolean;
  isStarting: boolean;
  isStopping: boolean;
  status: BrowserNodeStatus | null;
  error: string | null;
  lastHealthCheck: Date | null;

  // Actions
  startNode: (config?: Partial<NodeConfig>) => Promise<void>;
  stopNode: () => Promise<void>;
  restartNode: (config?: Partial<NodeConfig>) => Promise<void>;
  updateStatus: (status: BrowserNodeStatus) => void;
};
```

#### Network Hooks

##### `useNetwork`

```typescript
function useNetwork(): {
  // State
  current: BrowserNetworkConfig | null;
  isSwitching: boolean;
  switchError: string | null;

  // Actions
  switchNetwork: (networkId: string) => Promise<void>;
  getAvailableNetworks: () => BrowserNetworkConfig[];
};
```

#### Connection Hooks

##### `useConnection`

```typescript
function useConnection(): {
  // State
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Actions
  connect: (config: Partial<NodeConfig>) => Promise<void>;
  disconnect: () => Promise<void>;
  setConnectionError: (error: string | null) => void;
};
```

#### UI Hooks

##### `useUI`

```typescript
function useUI(): {
  // State
  sidebarOpen: boolean;
  activeTab: string;
  loading: boolean;
  notifications: NotificationState[];
  modals: ModalState[];

  // Actions
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  setLoading: (loading: boolean) => void;
  addNotification: (
    notification: Omit<NotificationState, 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;
  openModal: (modal: Omit<ModalState, 'id'>) => string;
  closeModal: (id: string) => void;
};
```

### Utility Hooks

#### `useAsyncOperation`

```typescript
function useAsyncOperation<T>(
  operation: () => Promise<T>,
  deps: React.DependencyList = []
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: () => Promise<void>;
  reset: () => void;
};
```

#### `usePolling`

```typescript
function usePolling<T>(
  operation: () => Promise<T>,
  interval: number,
  deps: React.DependencyList = []
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  isActive: boolean;
};
```

#### `useLocalStorage`

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void];
```

## 🧪 Examples

### Basic Wallet Management

```typescript
import React from 'react';
import { useWallets, useConnection } from '@conflux-devkit/ui-primitives';

function WalletManager() {
  const { wallets, createWallet, refreshBalance } = useWallets();
  const { connect, isConnected } = useConnection();

  const handleConnect = async () => {
    await connect({ chainId: 2029 });
  };

  const handleCreateWallet = async () => {
    await createWallet();
  };

  const handleRefreshBalance = async (address: string) => {
    await refreshBalance(address);
  };

  return (
    <div>
      <button onClick={handleConnect} disabled={isConnected}>
        {isConnected ? 'Connected' : 'Connect'}
      </button>

      {isConnected && (
        <button onClick={handleCreateWallet}>
          Create Wallet
        </button>
      )}

      {wallets.map(wallet => (
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

### Contract Interaction

```typescript
import React, { useState } from 'react';
import { useContracts, useContract } from '@conflux-devkit/ui-primitives';

function ContractManager() {
  const { contracts, deployContract } = useContracts();
  const [contractAddress, setContractAddress] = useState<string>('');

  const handleDeployContract = async () => {
    await deployContract({
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
      args: [1000000]
    });
  };

  return (
    <div>
      <button onClick={handleDeployContract}>
        Deploy Contract
      </button>

      {contracts.map(contract => (
        <div key={contract.address}>
          <p>Contract: {contract.name}</p>
          <p>Address: {contract.address}</p>
          <button onClick={() => setContractAddress(contract.address)}>
            Select Contract
          </button>
        </div>
      ))}

      {contractAddress && (
        <ContractInteraction contractAddress={contractAddress} />
      )}
    </div>
  );
}

function ContractInteraction({ contractAddress }: { contractAddress: string }) {
  const { contract, callMethod } = useContract(contractAddress);

  const handleCallMethod = async () => {
    const result = await callMethod('totalSupply', []);
    console.log('Total supply:', result);
  };

  if (!contract) return null;

  return (
    <div>
      <h3>Contract: {contract.name}</h3>
      <button onClick={handleCallMethod}>
        Call totalSupply
      </button>
    </div>
  );
}
```

### Real-time Updates

```typescript
import React, { useEffect } from 'react';
import { useWallets, usePolling } from '@conflux-devkit/ui-primitives';

function RealTimeWallet() {
  const { wallets, refreshBalance } = useWallets();
  const activeWallet = wallets.find(w => w.address);

  // Poll balance every 30 seconds
  const { data: balance, loading } = usePolling(
    () => refreshBalance(activeWallet?.address || ''),
    30000,
    [activeWallet?.address]
  );

  return (
    <div>
      <h3>Real-time Balance</h3>
      {loading && <p>Updating...</p>}
      {activeWallet && (
        <p>Balance: {activeWallet.balanceFormatted}</p>
      )}
    </div>
  );
}
```

### UI State Management

```typescript
import React from 'react';
import { useUI } from '@conflux-devkit/ui-primitives';

function UIComponent() {
  const {
    sidebarOpen,
    activeTab,
    notifications,
    modals,
    toggleSidebar,
    setActiveTab,
    addNotification,
    openModal,
    closeModal
  } = useUI();

  const handleAddNotification = () => {
    addNotification({
      type: 'success',
      title: 'Success',
      message: 'Operation completed successfully'
    });
  };

  const handleOpenModal = () => {
    const modalId = openModal({
      type: 'confirm',
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed?'
    });

    // Close modal after 5 seconds
    setTimeout(() => closeModal(modalId), 5000);
  };

  return (
    <div>
      <button onClick={toggleSidebar}>
        {sidebarOpen ? 'Close' : 'Open'} Sidebar
      </button>

      <button onClick={() => setActiveTab('wallets')}>
        Switch to Wallets
      </button>

      <button onClick={handleAddNotification}>
        Add Notification
      </button>

      <button onClick={handleOpenModal}>
        Open Modal
      </button>

      <div>
        <h4>Notifications ({notifications.length})</h4>
        {notifications.map(notification => (
          <div key={notification.id}>
            {notification.title}: {notification.message}
          </div>
        ))}
      </div>

      <div>
        <h4>Modals ({modals.length})</h4>
        {modals.map(modal => (
          <div key={modal.id}>
            {modal.title}: {modal.message}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔧 Configuration

### Provider Configuration

```typescript
import { ConfluxProvider } from '@conflux-devkit/ui-primitives';

function App() {
  return (
    <ConfluxProvider
      config={{
        persist: true,
        devtools: process.env.NODE_ENV === 'development'
      }}
    >
      <YourApp />
    </ConfluxProvider>
  );
}
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## 🔗 Dependencies

- **react**: React library
- **react-dom**: React DOM
- **@conflux-devkit/core**: Core types and utilities
- **@conflux-devkit/state**: State management integration

## 📊 Bundle Size

- **Minified**: ~20KB
- **Gzipped**: ~7KB
- **Tree-shakeable**: Import only what you need

## 🚨 Performance Notes

- **Memoization**: Hooks are optimized with React.memo and useMemo
- **Dependency Arrays**: Always provide proper dependency arrays
- **Cleanup**: Hooks automatically clean up subscriptions
- **Batching**: State updates are batched for performance

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Part of the Conflux DevKit ecosystem** 🚀
