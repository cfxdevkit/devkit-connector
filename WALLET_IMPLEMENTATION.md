# Conflux Dual Wallet Implementation

This implementation provides a complete solution for managing both server-side (SS) wallets and browser wallet delegation for Conflux eSpace integration.

## Features

### 1. Server-Managed Wallets (SS Wallets)
- **Secure Storage**: Encrypted mnemonic storage with AES-256-CBC encryption
- **HD Wallet Support**: Hierarchical deterministic wallet generation
- **Multi-chain**: Support for both eSpace and Core addresses
- **Session Management**: Secure session-based wallet access
- **API Integration**: RESTful API for wallet operations

### 2. Browser Wallet Integration
- **MetaMask Support**: Direct integration with MetaMask and compatible wallets
- **Chain Switching**: Support for switching between eSpace and Core chains
- **Transaction Signing**: Direct transaction signing through browser wallet
- **Address Management**: Automatic address detection and management

### 3. Wallet Delegation
- **Browser to Server**: Delegate browser wallet operations to server for automation
- **Configurable Rules**: Flexible delegation rules with spending limits and operation restrictions
- **Time-based Restrictions**: Support for time windows and session duration
- **Security Settings**: IP whitelisting, multi-sig requirements, and approval thresholds
- **Auto-approval Rules**: Customizable rules for automatic transaction approval

## Architecture

### Backend Components

#### 1. Wallet Service (`server/src/services/wallet-service.ts`)
```typescript
class ServerWalletService {
  // Core wallet management
  loadWalletFromServer(userId: string)
  signTransaction(walletId: string, transaction: any, chainType: ChainType)
  signMessage(walletId: string, message: string)

  // Delegation management
  createDelegationSession(userAddress: string, delegateAddress: string, config: any)
  validateWalletOperation(sessionId: string, operation: WalletOperation)
}
```

#### 2. Wallet Routes (`server/src/routes/wallet.ts`)
- `POST /api/wallet` - Main wallet operations endpoint
- `GET /api/wallet/delegation/:sessionId` - Get delegation session info
- Authentication via JWT tokens
- Request validation and error handling

#### 3. Types (`server/src/types/wallet.ts`)
- `WalletMode`: 'server-managed' | 'user-delegated'
- `ChainType`: 'eSpace' | 'core'
- `WalletState`: Complete wallet state interface
- `DelegationConfig`: Comprehensive delegation configuration
- `AutoApprovalRule`: Flexible auto-approval rule system

### Frontend Components

#### 1. Wallet Context (`frontend/src/context/WalletContext.tsx`)
```typescript
interface WalletContextType {
  currentMode: WalletMode | null
  serverWallet: ServerWalletHook
  browserWallet: BrowserWalletHook
  switchToServerWallet(): Promise<void>
  switchToBrowserWallet(): Promise<void>
  createBrowserDelegation(config?: any): Promise<string>
}
```

#### 2. Hooks
- `useServerWallet`: Server wallet operations and state management
- `useBrowserWallet`: Browser wallet integration with MetaMask
- `useWallet`: Unified wallet context with mode switching

#### 3. Components
- `WalletManager`: Complete wallet management interface
- `PatternBDemo`: Updated with wallet integration
- Delegation modal and configuration UI

## Usage Examples

### 1. Server Wallet Setup

```typescript
// Load server wallet
const { loadWallet, sendTransaction, signMessage } = useServerWallet();
await loadWallet();

// Send transaction
const txHash = await sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4B17dd07E2b9e84',
  value: '1000000000000000000', // 1 CFX
  gasLimit: '21000'
}, 'eSpace');
```

### 2. Browser Wallet Connection

```typescript
// Connect browser wallet
const { connect, sendTransaction, delegateToServer } = useBrowserWallet();
await connect();

// Create delegation to server
const sessionId = await delegateToServer(serverAddress, {
  sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
  maxTransactionValue: '1000000000000000000', // 1 ETH
  allowedOperations: ['sign_transaction', 'sign_message']
});
```

### 3. Wallet Mode Switching

```typescript
const {
  switchToServerWallet,
  switchToBrowserWallet,
  createBrowserDelegation
} = useWallet();

// Switch to server wallet
await switchToServerWallet();

// Switch to browser wallet
await switchToBrowserWallet();

// Create delegation session
const sessionId = await createBrowserDelegation({
  maxTransactionValue: '1000000000000000000',
  autoApprovalRules: [
    {
      type: 'transaction_value',
      condition: 'less_than',
      value: '100000000000000000', // 0.1 ETH
      autoApprove: true
    }
  ]
});
```

## Configuration

### Environment Variables

```bash
# Server configuration
WALLET_ENCRYPTION_KEY=your-32-byte-hex-key
ENCRYPTED_WALLET_MNEMONIC=encrypted-mnemonic-string
JWT_SECRET=your-jwt-secret

# RPC endpoints
ESPACE_RPC_URL=https://evm.confluxrpc.com
CONFLUX_CORE_RPC=https://main.confluxrpc.com

# Development
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Delegation Configuration Example

```typescript
const delegationConfig = {
  sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
  allowedOperations: ['sign_transaction', 'sign_message', 'get_balance'],
  maxTransactionValue: '1000000000000000000', // 1 ETH in wei
  autoApprovalRules: [
    {
      type: 'transaction_value',
      condition: 'less_than',
      value: '100000000000000000', // 0.1 ETH
      autoApprove: true,
      priority: 1
    },
    {
      type: 'contract_address',
      condition: 'whitelist',
      value: ['0x1234...', '0x5678...'], // Trusted contracts
      autoApprove: true,
      priority: 2
    }
  ],
  securitySettings: {
    requireSignatureFor: ['high_value_transactions'],
    ipWhitelist: ['192.168.1.0/24'],
    timeBasedRestrictions: [
      {
        type: 'daily_window',
        allowedTimes: {
          startTime: '09:00',
          endTime: '17:00',
          timezone: 'UTC',
          daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
        }
      }
    ]
  },
  notifications: {
    realTimeUpdates: true,
    emailNotifications: true,
    alertThresholds: [
      {
        type: 'transaction_value',
        threshold: '500000000000000000', // 0.5 ETH
        action: 'notify'
      }
    ]
  }
};
```

## Security Features

1. **Encryption**: All server-stored mnemonics are encrypted using AES-256-CBC
2. **Authentication**: JWT-based authentication for all wallet operations
3. **Session Management**: Time-limited delegation sessions with automatic cleanup
4. **Validation**: Comprehensive validation of all wallet operations against delegation rules
5. **Rate Limiting**: Built-in rate limiting for API endpoints
6. **IP Whitelisting**: Optional IP-based access restrictions
7. **Auto-approval Rules**: Granular control over automatic transaction approval

## Installation

1. Install dependencies:
```bash
cd server && npm install
cd frontend && npm install
```

2. Set up environment variables (see Configuration section)

3. Start the services:
```bash
# Start server
cd server && npm run dev

# Start frontend
cd frontend && npm run dev
```

## API Endpoints

### Wallet Operations
- `POST /api/wallet` - Main wallet operations
  - `action: 'load_wallet'` - Load server wallet
  - `action: 'sign_transaction'` - Sign transaction
  - `action: 'sign_message'` - Sign message
  - `action: 'clear_wallet'` - Clear wallet from memory
  - `action: 'create_delegation'` - Create delegation session
  - `action: 'process_operation'` - Process delegated operation

### Delegation Management
- `GET /api/wallet/delegation/:sessionId` - Get delegation session info
- Session validation and operation processing

## Testing

The implementation includes comprehensive error handling and supports both mock and real contract deployments for testing purposes.

## Future Enhancements

1. **Multi-user Support**: Database-backed user wallet storage
2. **Hardware Wallet Integration**: Support for Ledger/Trezor devices
3. **Advanced Delegation Rules**: More sophisticated rule engines
4. **Audit Logging**: Comprehensive operation logging and audit trails
5. **Mobile Support**: React Native adaptation
6. **Core Chain Integration**: Full Conflux Core chain support