# @conflux-devkit/api-server

Express API server with services and routes for Conflux blockchain operations.

## 🎯 Overview

The API server package provides a modern Express-based API server with comprehensive services and routes for Conflux blockchain operations. It builds on top of the core and blockchain packages to provide a complete API interface.

## 📦 Features

- **Express Server** - Modern API server with middleware
- **Service Layer** - Clean separation of concerns
- **Route Handlers** - RESTful API endpoints
- **Error Handling** - Comprehensive error management
- **Type Safety** - Full TypeScript integration
- **Middleware** - CORS, helmet, rate limiting, JWT

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            API SERVER PACKAGE                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   EXPRESS       │    │    SERVICES     │    │     ROUTES      │
│                 │    │                 │    │                 │
│  • Server       │    │  • WalletService│    │  • WalletRoutes │
│  • Middleware   │    │  • TransactionService│  • TransactionRoutes│
│  • CORS         │    │  • ContractService│   │  • ContractRoutes│
│  • Helmet       │    │  • NodeService  │    │  • NodeRoutes   │
│  • Rate Limit   │    │  • NetworkService│   │  • NetworkRoutes│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MIDDLEWARE    │    │   UTILITIES     │    │   TYPES         │
│                 │    │                 │    │                 │
│  • Auth         │    │  • Response     │    │  • API Types    │
│  • Validation   │    │  • Error        │    │  • Service Types│
│  • Logging      │    │  • Validation   │    │  • Route Types  │
│  • Security     │    │  • Helpers      │    │  • Middleware Types│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Usage

### Starting the Server

```bash
# Development mode
pnpm dev

# Production mode
pnpm start

# With specific port
PORT=3001 pnpm start
```

### API Endpoints

#### Wallet Endpoints

```bash
# Create wallet
POST /api/wallets
{
  "mode": "mnemonic",
  "count": 1
}

# Get wallet list
GET /api/wallets

# Get wallet balance
GET /api/wallets/:address/balance

# Fund wallet
POST /api/wallets/:address/fund
{
  "amount": "1000000000000000000"
}
```

#### Transaction Endpoints

```bash
# Send transaction
POST /api/transactions/send
{
  "to": "0x1234...",
  "value": "1000000000000000000",
  "gasLimit": 21000
}

# Get transaction status
GET /api/transactions/:hash/status

# Get transaction receipt
GET /api/transactions/:hash/receipt
```

#### Contract Endpoints

```bash
# Deploy contract
POST /api/contracts/deploy
{
  "contractName": "MyContract",
  "constructorArgs": []
}

# Call contract method
POST /api/contracts/:address/call
{
  "method": "getValue",
  "args": []
}

# Write contract method
POST /api/contracts/:address/write
{
  "method": "setValue",
  "args": ["newValue"]
}
```

#### Node Endpoints

```bash
# Get node status
GET /api/node/status

# Start node
POST /api/node/start

# Stop node
POST /api/node/stop

# Restart node
POST /api/node/restart
```

### Programmatic Usage

```typescript
import { createServer } from '@conflux-devkit/api-server';

// Create server
const server = createServer({
  port: 3000,
  cors: true,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
});

// Start server
await server.start();
```

## 📋 API Reference

### Services

- `WalletService` - Wallet management operations
- `TransactionService` - Transaction operations
- `ContractService` - Contract operations
- `NodeService` - Node management operations
- `NetworkService` - Network operations

### Routes

- `WalletRoutes` - Wallet API endpoints
- `TransactionRoutes` - Transaction API endpoints
- `ContractRoutes` - Contract API endpoints
- `NodeRoutes` - Node API endpoints
- `NetworkRoutes` - Network API endpoints

### Middleware

- `cors` - Cross-origin resource sharing
- `helmet` - Security headers
- `rateLimit` - Rate limiting
- `jsonwebtoken` - JWT authentication
- `express-validator` - Request validation

### Utilities

- `createResponse` - Create API responses
- `createError` - Create error responses
- `validateRequest` - Validate request data
- `handleError` - Error handling middleware

## 🔧 Configuration

### Server Configuration

```typescript
import { createServer } from '@conflux-devkit/api-server';

const server = createServer({
  port: 3000,
  host: 'localhost',
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1h',
  },
});
```

### Service Configuration

```typescript
import { WalletService } from '@conflux-devkit/api-server';

const walletService = new WalletService({
  defaultNetwork: 'local',
  autoFund: true,
  fundAmount: '1000000000000000000',
});
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test
pnpm test -- --grep "WalletService"
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
