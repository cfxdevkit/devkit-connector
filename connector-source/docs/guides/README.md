# User Guides

This directory contains comprehensive user guides for the Conflux Dual Wallet System.

## Table of Contents

- [Getting Started](./getting-started.md)
- [Wallet Modes](./wallet-modes.md)
- [Delegation Configuration](./delegation-configuration.md)
- [Security Best Practices](./security-best-practices.md)
- [Troubleshooting](./troubleshooting.md)
- [Migration Guide](./migration-guide.md)

## Quick Start Guide

### 1. Installation

```bash
# Install the package
npm install @conflux-wallet/client

# Or with pnpm
pnpm add @conflux-wallet/client

# Or with yarn
yarn add @conflux-wallet/client
```

### 2. Basic Setup

```typescript
import { ConfluxProvider } from '@conflux-wallet/client';

function App() {
  return (
    <ConfluxProvider>
      <YourApp />
    </ConfluxProvider>
  );
}
```

### 3. Using the Wallet

```typescript
import { useConfluxWallet } from '@conflux-wallet/client';

function WalletComponent() {
  const { 
    mode, 
    addresses, 
    sendTransaction, 
    delegateWallet 
  } = useConfluxWallet();

  const handleSendTransaction = async () => {
    try {
      const txHash = await sendTransaction({
        to: '0x742d35Cc6634C0532925a3b8D4B17dd07E2b9e84',
        value: '1000000000000000000' // 1 CFX
      });
      console.log('Transaction sent:', txHash);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <div>
      <h2>Wallet Status</h2>
      <p>Mode: {mode}</p>
      <p>eSpace Address: {addresses?.eSpace}</p>
      <p>Core Address: {addresses?.core}</p>
      <button onClick={handleSendTransaction}>
        Send Transaction
      </button>
    </div>
  );
}
```

## Wallet Modes

### Server-Managed Mode

In server-managed mode, the server controls the wallet and handles all operations:

```typescript
const { loadServerWallet } = useConfluxWallet();

// Load server-managed wallet
await loadServerWallet('user123');
```

### User-Delegated Mode

In user-delegated mode, users delegate their wallet operations to the server:

```typescript
const { delegateUserWallet } = useConfluxWallet();

// Delegate user's wallet
await delegateUserWallet({
  sessionDuration: 60, // 1 hour
  allowedOperations: ['sign_transaction', 'sign_message'],
  maxTransactionValue: '10000000000000000000' // 10 CFX
});
```

## Configuration

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/conflux_wallet
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret-key
WALLET_ENCRYPTION_KEY=your-32-byte-hex-encryption-key

# Optional
NEXT_PUBLIC_CONFLUX_ESPACE_RPC=https://evm.confluxrpc.com
NEXT_PUBLIC_CONFLUX_CORE_RPC=https://main.confluxrpc.com
```

### Delegation Configuration

```typescript
const delegationConfig = {
  sessionDuration: 60, // minutes
  allowedOperations: ['sign_transaction', 'sign_message'],
  maxTransactionValue: '10000000000000000000', // 10 CFX
  autoApprovalRules: [
    {
      type: 'transaction_value',
      condition: 'less_than',
      value: '1000000000000000000', // 1 CFX
      autoApprove: true
    }
  ],
  securitySettings: {
    requireSignatureFor: ['sign_transaction'],
    timeBasedRestrictions: [
      {
        type: 'daily_window',
        allowedTimes: {
          startTime: '09:00',
          endTime: '17:00',
          timezone: 'UTC'
        }
      }
    ]
  }
};
```

## Security

### Best Practices

1. **Use HTTPS in production**
2. **Implement proper authentication**
3. **Set up rate limiting**
4. **Monitor security events**
5. **Regular security audits**

### Encryption

All sensitive data is encrypted using AES-256-CBC:

```typescript
import { EncryptionUtils } from '@conflux-wallet/utils';

// Generate encryption key
const key = EncryptionUtils.generateKey();

// Encrypt data
const { encrypted, iv } = EncryptionUtils.encrypt('sensitive data', key);

// Decrypt data
const decrypted = EncryptionUtils.decrypt(encrypted, key, iv);
```

## Troubleshooting

### Common Issues

1. **Connection failed**: Check RPC endpoints and network connectivity
2. **Authentication error**: Verify JWT token and user permissions
3. **Transaction failed**: Check gas limits and account balance
4. **Delegation expired**: Renew delegation session

### Debug Mode

Enable debug mode for detailed logging:

```typescript
const wallet = new ConfluxWallet({
  serverUrl: 'https://your-domain.com/api',
  debug: true
});
```

## Support

- **Documentation**: [docs/](../)
- **Issues**: [GitHub Issues](https://github.com/your-org/conflux-dual-wallet/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/conflux-dual-wallet/discussions)
- **Discord**: [Join our Discord](https://discord.gg/conflux-wallet)
