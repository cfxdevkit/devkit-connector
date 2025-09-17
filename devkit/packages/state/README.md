# @conflux-devkit/state

State management layer for Conflux DevKit with Zustand stores and live contract state management.

## Overview

The `@conflux-devkit/state` package provides a centralized state management solution that sits between the core/blockchain packages and the API server. It uses Zustand for state management and provides a clean interface for managing live contract states, wallet information, and node status.

## Features

- **🔄 Live State Management**: Real-time updates for contracts, wallets, and node status
- **📦 Zustand Integration**: Lightweight, performant state management
- **🎯 Type-Safe**: Full TypeScript support with comprehensive type definitions
- **🔌 Event-Driven**: Event emitter for state changes and notifications
- **💾 Persistence**: Automatic state persistence with selective data saving
- **🔄 Auto-Refresh**: Configurable intervals for automatic data refresh
- **🎨 UI State**: Built-in UI state management (modals, notifications, loading states)
- **🔗 API Integration**: Clean interface for API server integration

## Installation

```bash
pnpm add @conflux-devkit/state
```

## Quick Start

```typescript
import { getStateService, useAppStore } from '@conflux-devkit/state';

// Initialize the state service
const stateService = getStateService({
  persist: true,
  nodeStatusInterval: 5000,
  walletBalanceInterval: 10000,
});

await stateService.initialize();

// Use the store in React components
function MyComponent() {
  const { isConnected, wallets, contracts } = useAppStore();
  
  return (
    <div>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      <p>Wallets: {wallets.length}</p>
      <p>Contracts: {contracts.deployed.length}</p>
    </div>
  );
}
```

## Core Concepts

### State Structure

The state is organized into logical sections:

- **Connection**: Connection status and errors
- **Node**: Node status, health, and lifecycle
- **Wallets**: Wallet management and balances
- **Contracts**: Contract deployment and interaction
- **Network**: Network switching and configuration
- **UI**: UI state (modals, notifications, loading)

### Store Actions

All state modifications go through action methods:

```typescript
// Connection
await stateService.connect(config);
await stateService.disconnect();

// Node management
await stateService.startNode();
await stateService.stopNode();

// Wallet management
const wallet = await stateService.createWallet();
stateService.selectWallet(wallet.address);

// Contract management
const contract = await stateService.deployContract('MyContract');
await stateService.callContractMethod({
  contractAddress: contract.address,
  method: 'myMethod',
  args: ['arg1', 'arg2']
});
```

### Event System

The state service emits events for all major state changes:

```typescript
stateService.on('state:connected', () => {
  console.log('Connected to Conflux network');
});

stateService.on('state:contract:deployed', (contract) => {
  console.log('Contract deployed:', contract.address);
});

stateService.on('state:error', (type, message) => {
  console.error(`Error [${type}]:`, message);
});
```

## API Integration

The state service provides clean data for API server integration:

```typescript
// Get complete state for API
const stateData = stateService.getStateForAPI();

// Get specific contract data
const contractData = stateService.getContractDataForAPI(contractAddress);

// Get wallet data
const walletData = stateService.getWalletDataForAPI(walletAddress);
```

## Configuration

```typescript
const config = {
  persist: true,
  persistKey: 'conflux-devkit-state',
  nodeStatusInterval: 5000,      // Auto-refresh node status every 5s
  walletBalanceInterval: 10000,  // Auto-refresh wallet balance every 10s
  contractEventsInterval: 2000,  // Auto-refresh contract events every 2s
  maxRetries: 3,
  retryDelay: 1000,
  defaultNotificationDuration: 5000,
  maxNotifications: 10,
};
```

## Store Selectors

Use selectors for efficient state access:

```typescript
import { selectors } from '@conflux-devkit/state';

// In a component
const isConnected = useAppStore(selectors.isConnected);
const activeWallet = useAppStore(selectors.activeWallet);
const deployedContracts = useAppStore(selectors.deployedContracts);
```

## Notifications

Built-in notification system:

```typescript
// Add notification
stateService.addNotification({
  type: 'success',
  title: 'Contract Deployed',
  message: 'Your contract has been successfully deployed',
  duration: 5000, // Auto-remove after 5 seconds
});

// Remove notification
stateService.removeNotification(notificationId);
```

## Modals

Modal management system:

```typescript
// Open modal
const modalId = stateService.openModal('deploy-contract', {
  contractName: 'MyContract',
  args: ['arg1', 'arg2']
});

// Close modal
stateService.closeModal(modalId);
```

## Persistence

State is automatically persisted with selective data saving:

```typescript
// Only UI preferences and wallet data are persisted
// Sensitive data like private keys are not saved
```

## Error Handling

Comprehensive error handling with user-friendly notifications:

```typescript
try {
  await stateService.deployContract('MyContract');
} catch (error) {
  // Error is automatically handled and displayed as notification
  console.error('Deployment failed:', error);
}
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  AppState,
  AppActions,
  ContractCallParams,
  NotificationState,
  StoreConfig,
} from '@conflux-devkit/state';
```

## Dependencies

- `@conflux-devkit/core`: Core types and utilities
- `@conflux-devkit/blockchain`: Blockchain operations
- `zustand`: State management
- `immer`: Immutable state updates
- `react`: React integration (peer dependency)

## Examples

### Complete Workflow

```typescript
import { getStateService } from '@conflux-devkit/state';

async function runCompleteWorkflow() {
  const stateService = getStateService();
  await stateService.initialize();

  try {
    // Connect to network
    await stateService.connect({ network: 'local' });
    
    // Start node
    await stateService.startNode();
    
    // Create wallet
    const wallet = await stateService.createWallet();
    stateService.selectWallet(wallet.address);
    
    // Deploy contract
    const contract = await stateService.deployContract('MyContract', ['arg1']);
    stateService.selectContract(contract.address);
    
    // Call contract method
    await stateService.callContractMethod({
      contractAddress: contract.address,
      method: 'myMethod',
      args: ['value1', 'value2']
    });
    
    console.log('Workflow completed successfully!');
  } catch (error) {
    console.error('Workflow failed:', error);
  }
}
```

### React Integration

```typescript
import { useAppStore, selectors } from '@conflux-devkit/state';

function Dashboard() {
  const isConnected = useAppStore(selectors.isConnected);
  const wallets = useAppStore(selectors.wallets);
  const contracts = useAppStore(selectors.deployedContracts);
  const { createWallet, deployContract } = useAppStore();

  return (
    <div>
      <h1>Conflux DevKit Dashboard</h1>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      
      <div>
        <h2>Wallets ({wallets.length})</h2>
        <button onClick={() => createWallet()}>
          Create New Wallet
        </button>
      </div>
      
      <div>
        <h2>Contracts ({contracts.length})</h2>
        <button onClick={() => deployContract('MyContract')}>
          Deploy Contract
        </button>
      </div>
    </div>
  );
}
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Core Package  │    │ Blockchain Pkg  │    │   State Package │
│                 │    │                 │    │                 │
│ • Types         │◄───┤ • RPC Clients   │◄───┤ • Zustand Store │
│ • Constants     │    │ • Contract Ops  │    │ • State Service │
│ • Utilities     │    │ • Wallet Ops    │    │ • Event System  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   API Server    │
                                              │                 │
                                              │ • REST API      │
                                              │ • WebSocket     │
                                              │ • State Mapping │
                                              └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   Dashboard     │
                                              │                 │
                                              │ • React UI      │
                                              │ • State Hooks   │
                                              │ • Components    │
                                              └─────────────────┘
```

## Contributing

1. Follow the existing code style
2. Add comprehensive TypeScript types
3. Include JSDoc comments for public APIs
4. Write tests for new functionality
5. Update documentation as needed

## License

MIT License - see LICENSE file for details.
