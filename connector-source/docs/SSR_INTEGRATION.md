# SSR Integration Guide

This guide covers testing the smart contracts with Server-Side Rendering (SSR) libraries and frameworks.

## 🎯 Overview

The SSR integration provides:
- **Server-side contract interaction** via Express API
- **Client-side React hooks** for contract operations
- **Type-safe contract bindings** generated from Solidity
- **Real-time contract testing** with local Hardhat node
- **Comprehensive test suite** for contract integration

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Express API   │    │  Hardhat Node   │
│                 │    │                 │    │                 │
│  - useContract  │◄──►│  - Contract API │◄──►│  - Contracts    │
│  - Hooks        │    │  - Validation   │    │  - Test Network │
│  - Components   │    │  - Error Handle │    │  - Local RPC    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Run SSR Test Setup

```bash
# Start all services (Hardhat, Server, Demo App)
./scripts/test-ssr.sh
```

This will:
- Install all dependencies
- Generate contract types
- Start local Hardhat node
- Deploy contracts
- Start Express API server
- Launch demo app

### 2. Access Test Interface

Open your browser to: `http://localhost:3000/contract-test`

## 📦 Components

### Contract Service (`packages/server/src/services/contract-service.ts`)

Server-side contract interaction service:

```typescript
import { ContractService, createContractService } from "@conflux-wallet/server";

const config = {
  network: "confluxEspaceTestnet",
  rpcUrl: "https://evmtestnet.confluxrpc.com",
  privateKey: process.env.PRIVATE_KEY,
};

const contractService = createContractService(config);

// Get delegation details
const delegation = await contractService.getDelegation(1);

// Create new delegation
const delegationId = await contractService.createDelegation(
  "0x...",
  7 * 24 * 60 * 60, // 7 days
  "1.0", // 1 CFX daily limit
  "0.1"  // 0.1 CFX per-tx limit
);
```

### React Hooks (`packages/client/src/hooks/useContract.ts`)

Client-side contract interaction hooks:

```typescript
import { useContract, useContractConfig } from "@conflux-wallet/client";

function MyComponent() {
  const { config } = useContractConfig();
  
  // Get delegation data
  const { data: delegation, isLoading } = useDelegation(1, config);
  
  // Create delegation mutation
  const createDelegation = useCreateDelegation(config);
  
  const handleCreate = async () => {
    await createDelegation.mutateAsync({
      delegate: "0x...",
      duration: 7 * 24 * 60 * 60,
      dailyLimit: "1.0",
      perTxLimit: "0.1",
    });
  };
  
  return (
    <div>
      {isLoading ? "Loading..." : JSON.stringify(delegation)}
      <button onClick={handleCreate}>Create Delegation</button>
    </div>
  );
}
```

### API Endpoints (`packages/server/src/routes/contracts.ts`)

RESTful API for contract operations:

```bash
# Get delegation details
GET /contracts/delegation/:id?network=confluxEspaceTestnet

# Get user delegations
GET /contracts/user/:address/delegations?network=confluxEspaceTestnet

# Create delegation
POST /contracts/delegation?network=confluxEspaceTestnet
{
  "delegate": "0x...",
  "duration": 604800,
  "dailyLimit": "1.0",
  "perTxLimit": "0.1"
}

# Revoke delegation
DELETE /contracts/delegation/:id?network=confluxEspaceTestnet

# Update limits
PUT /contracts/delegation/:id/limits?network=confluxEspaceTestnet
{
  "newDailyLimit": "2.0",
  "newPerTxLimit": "0.2"
}

# Execute transaction
POST /contracts/transaction/execute?network=confluxEspaceTestnet
{
  "delegationId": 1,
  "transaction": {
    "to": "0x...",
    "value": "0.1",
    "data": "0x",
    "nonce": 0,
    "deadline": 1234567890
  },
  "signature": "0x..."
}

# Check if transaction can execute
GET /contracts/transaction/can-execute?delegationId=1&value=0.1&network=confluxEspaceTestnet

# Get contract events
GET /contracts/events/delegations?network=confluxEspaceTestnet
GET /contracts/events/transactions?network=confluxEspaceTestnet

# Get contract info
GET /contracts/info?network=confluxEspaceTestnet
```

## 🧪 Testing

### Run Contract Tests

```bash
# Test eSpace contracts
cd contracts/espace
npm test

# Test Core contracts
cd contracts/core
npm test

# Test SSR integration
cd contracts/espace
npm run test:ssr
```

### Test SSR Integration

```bash
# Start test environment
./scripts/test-ssr.sh

# In another terminal, run integration tests
cd contracts/espace
npm run test:ssr
```

### Manual Testing

1. **Start Services**:
   ```bash
   ./scripts/test-ssr.sh
   ```

2. **Open Test Interface**: `http://localhost:3000/contract-test`

3. **Test Operations**:
   - Create delegation
   - Check delegation details
   - Update limits
   - Revoke delegation
   - Test transaction execution

## 🔧 Configuration

### Environment Variables

Create `.env` files in each contract directory:

**contracts/espace/.env**:
```env
CONFLUX_ESPACE_RPC_URL=https://evmtestnet.confluxrpc.com
CONFLUX_ESPACE_TESTNET_RPC_URL=https://evmtestnet.confluxrpc.com
PRIVATE_KEY=your_private_key_here
```

**contracts/core/.env**:
```env
CONFLUX_CORE_RPC_URL=https://test.confluxrpc.com
CONFLUX_CORE_TESTNET_RPC_URL=https://test.confluxrpc.com
PRIVATE_KEY=your_private_key_here
```

### Network Configuration

Supported networks:
- `confluxEspace` - Conflux eSpace Mainnet
- `confluxEspaceTestnet` - Conflux eSpace Testnet
- `confluxCore` - Conflux Core Mainnet
- `confluxCoreTestnet` - Conflux Core Testnet
- `hardhat` - Local Hardhat node
- `localhost` - Local development

## 📊 Monitoring

### Contract Events

Monitor contract events in real-time:

```typescript
// Get delegation events
const events = await contractService.getDelegationEvents();

// Get transaction events
const txEvents = await contractService.getTransactionEvents();
```

### Error Handling

All operations include comprehensive error handling:

```typescript
try {
  const delegation = await contractService.getDelegation(1);
} catch (error) {
  console.error("Error:", error.message);
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Contract Not Deployed**
   - Ensure Hardhat node is running
   - Check contract deployment logs
   - Verify network configuration

2. **RPC Connection Failed**
   - Check RPC URL configuration
   - Ensure network is accessible
   - Verify private key is correct

3. **Type Generation Failed**
   - Run `npm run compile` first
   - Check TypeChain configuration
   - Verify contract compilation

4. **API Connection Failed**
   - Ensure server is running on port 3001
   - Check CORS configuration
   - Verify API endpoint URLs

### Debug Commands

```bash
# Check Hardhat node status
curl http://localhost:8545

# Check server status
curl http://localhost:3001/contracts/info

# Check contract deployment
npx hardhat console --network localhost
```

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Express.js Documentation](https://expressjs.com/)
- [Conflux Documentation](https://docs.confluxnetwork.org/)

## 🤝 Support

For issues and questions:
- Check the troubleshooting section
- Review the test cases
- Consult the API documentation
- Open an issue in the repository
