# Demo Guide

This guide covers the comprehensive demos for Pattern A (Server-Side Managed) and Pattern B (User-Delegated) wallet implementations.

## 🎯 Overview

The demo suite provides:
- **Pattern A Demo**: Server-side managed wallets with centralized control
- **Pattern B Demo**: User-delegated wallets with configurable limits
- **Web Components Demo**: Framework-agnostic components
- **Contract Testing**: Interactive contract testing and debugging

## 🚀 Quick Start

### 1. Start the Demo Environment

```bash
# Start all services
./scripts/test-ssr.sh

# Or start web components demo
./scripts/test-web-components.sh
```

### 2. Access the Demos

- **Main Demo**: http://localhost:3000
- **Pattern A**: http://localhost:3000/demo/pattern-a
- **Pattern B**: http://localhost:3000/demo/pattern-b
- **Web Components**: http://localhost:3000/web-components
- **Contract Testing**: http://localhost:3000/contract-test

## 📦 Pattern A: Server-Side Managed

### Features

- **Centralized Wallet Management**: Server creates and manages all wallets
- **Automated Transaction Processing**: Server handles all transaction execution
- **Batch Operations**: Process multiple transactions efficiently
- **Advanced Security**: Server-controlled private keys with enterprise security
- **Real-time Monitoring**: Live transaction status and wallet balances

### Use Cases

- Enterprise applications requiring centralized control
- High-frequency trading systems
- Automated payment processing
- Institutional wallet management
- Compliance-heavy environments

### Demo Functionality

1. **Wallet Creation**
   - Create new server-managed wallets
   - View wallet addresses and balances
   - Monitor wallet status and usage

2. **Transaction Management**
   - Send transactions from any server wallet
   - Real-time transaction status tracking
   - Transaction history and analytics

3. **Network Configuration**
   - Switch between Conflux networks
   - Custom RPC endpoint configuration
   - Contract address management

### Code Example

```typescript
// Create server wallet
const serverWallet = await createServerWallet();

// Send transaction
await sendTransaction({
  from: serverWallet.address,
  to: '0x...',
  value: '1.0',
  data: '0x'
});

// Monitor transaction
const status = await getTransactionStatus(txId);
```

## 📦 Pattern B: User-Delegated

### Features

- **User-Controlled Delegation**: Users create and manage their own delegations
- **Configurable Limits**: Set daily and per-transaction spending limits
- **Time-Based Expiry**: Delegations automatically expire
- **Signature-Based Authorization**: Cryptographic signature verification
- **Real-time Limit Tracking**: Monitor remaining spending limits

### Use Cases

- Personal wallet management
- Family account sharing
- Business expense management
- Automated payment systems
- Multi-signature workflows

### Demo Functionality

1. **Delegation Management**
   - Create new delegations with custom limits
   - Update delegation limits
   - Revoke delegations
   - Monitor delegation status

2. **Delegated Transactions**
   - Execute transactions through delegation
   - Real-time limit checking
   - Signature verification
   - Transaction history

3. **Limit Management**
   - Set daily spending limits
   - Configure per-transaction limits
   - Track remaining allowances
   - Automatic limit resets

### Code Example

```typescript
// Create delegation
const delegation = await createDelegation({
  delegate: '0x...',
  duration: 7, // days
  dailyLimit: '1.0', // CFX
  perTxLimit: '0.1'  // CFX
});

// Execute delegated transaction
await executeDelegatedTransaction({
  delegationId: delegation.id,
  to: '0x...',
  value: '0.05',
  data: '0x'
});
```

## 🧩 Web Components Demo

### Features

- **Framework Agnostic**: Works with any framework or vanilla JS
- **Shadow DOM**: Encapsulated styling and behavior
- **Custom Events**: Rich event system for integration
- **Theming**: Light/dark theme support
- **Responsive**: Mobile-friendly design

### Available Components

- **`<delegation-manager>`**: Manage wallet delegations
- **`<transaction-executor>`**: Execute transactions through delegation

### Usage Examples

#### React Integration
```jsx
import '@conflux-wallet/web-components';

function MyComponent() {
  return (
    <delegation-manager
      network="confluxEspaceTestnet"
      user-address="0x..."
      onDelegationCreated={(e) => console.log(e.detail)}
    />
  );
}
```

#### Vue Integration
```vue
<template>
  <delegation-manager
    network="confluxEspaceTestnet"
    user-address="userAddress"
    @delegation-created="onDelegationCreated"
  />
</template>
```

#### Vanilla JavaScript
```javascript
const component = document.createElement('delegation-manager');
component.setAttribute('network', 'confluxEspaceTestnet');
component.setAttribute('user-address', '0x...');
document.body.appendChild(component);
```

## 🔧 Contract Testing Demo

### Features

- **Live Contract Interaction**: Real-time contract testing
- **Network Switching**: Test on different networks
- **Error Debugging**: Comprehensive error handling
- **Gas Estimation**: Real-time gas usage tracking
- **Event Monitoring**: Live contract event streaming

### Testing Capabilities

1. **Delegation Operations**
   - Create, update, and revoke delegations
   - Test limit configurations
   - Verify delegation status

2. **Transaction Execution**
   - Execute transactions through delegation
   - Test signature verification
   - Monitor transaction status

3. **Error Handling**
   - Test invalid operations
   - Debug error conditions
   - Verify error messages

## 🌐 Network Configuration

### Supported Networks

- **Conflux eSpace Mainnet**: `confluxEspace` (Chain ID: 1030)
- **Conflux eSpace Testnet**: `confluxEspaceTestnet` (Chain ID: 71)
- **Conflux Core Mainnet**: `confluxCore` (Chain ID: 1029)
- **Conflux Core Testnet**: `confluxCoreTestnet` (Chain ID: 1)
- **Hardhat Local**: `hardhat` (Chain ID: 1337)
- **Localhost**: `localhost` (Chain ID: 1337)

### RPC Configuration

```typescript
const config = {
  network: 'confluxEspaceTestnet',
  rpcUrl: 'https://evmtestnet.confluxrpc.com',
  contractAddress: '0x...'
};
```

## 📊 Demo Data

### Mock Data

The demos include realistic mock data for testing:

- **Server Wallets**: Pre-configured wallet addresses and balances
- **Delegations**: Sample delegation configurations
- **Transactions**: Mock transaction history
- **Network Info**: Real network configurations

### Real Contract Integration

For production testing:

1. Deploy contracts to testnet
2. Configure RPC endpoints
3. Set up private keys
4. Test with real transactions

## 🧪 Testing Scenarios

### Pattern A Testing

1. **Wallet Management**
   - Create multiple server wallets
   - Test wallet selection
   - Verify balance updates

2. **Transaction Processing**
   - Send various transaction types
   - Test error conditions
   - Monitor transaction status

3. **Batch Operations**
   - Process multiple transactions
   - Test concurrent operations
   - Verify data consistency

### Pattern B Testing

1. **Delegation Lifecycle**
   - Create delegations with different limits
   - Test limit enforcement
   - Verify delegation expiry

2. **Transaction Execution**
   - Execute within limits
   - Test limit violations
   - Verify signature validation

3. **Limit Management**
   - Update delegation limits
   - Test limit calculations
   - Verify daily resets

## 🚨 Troubleshooting

### Common Issues

1. **Network Connection Failed**
   - Check RPC URL configuration
   - Verify network accessibility
   - Ensure proper network selection

2. **Contract Not Deployed**
   - Deploy contracts to testnet
   - Verify contract addresses
   - Check deployment logs

3. **Transaction Failed**
   - Check gas limits
   - Verify account balances
   - Review transaction parameters

4. **Component Not Rendering**
   - Check browser console for errors
   - Verify component imports
   - Ensure proper initialization

### Debug Commands

```bash
# Check network status
curl http://localhost:8545

# Verify contract deployment
npx hardhat console --network localhost

# Check server status
curl http://localhost:3001/contracts/info
```

## 📚 Additional Resources

- [Pattern A Documentation](./PATTERN_A.md)
- [Pattern B Documentation](./PATTERN_B.md)
- [Web Components Guide](./WEB_COMPONENTS.md)
- [Contract Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./API.md)

## 🤝 Support

For issues and questions:
- Check the troubleshooting section
- Review the demo code
- Open an issue in the repository
- Consult the documentation
