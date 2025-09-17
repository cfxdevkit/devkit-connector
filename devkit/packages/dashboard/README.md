# @conflux-devkit/dashboard

Next.js dashboard with Mantine UI for Conflux blockchain development.

## 🎯 Overview

The dashboard package provides a modern Next.js application with Mantine UI components for interacting with Conflux blockchain operations. It provides a user-friendly interface for node management, wallet operations, contract deployment, and transaction monitoring.

## 📦 Features

- **Next.js Application** - Modern React framework
- **Mantine UI** - Beautiful component library
- **Type Integration** - Full TypeScript support
- **Service Integration** - API client services
- **Responsive Design** - Mobile-friendly interface
- **Real-time Updates** - Live data updates
- **Dark/Light Theme** - Theme switching support

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DASHBOARD PACKAGE                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NEXT.JS       │    │   MANTINE UI    │    │   COMPONENTS    │
│                 │    │                 │    │                 │
│  • App Router   │    │  • Core         │    │  • Navbar       │
│  • Server Comp  │    │  • Hooks        │    │  • Sidebar      │
│  • Client Comp  │    │  • Notifications│    │  • Dashboard    │
│  • API Routes   │    │  • Modals       │    │  • Forms        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    SERVICES     │    │     PAGES       │    │     UTILS       │
│                 │    │                 │    │                 │
│  • ApiClient    │    │  • Home         │    │  • Formatters   │
│  • WalletSvc    │    │  • Wallets      │    │  • Validators   │
│  • NodeSvc      │    │  • Contracts    │    │  • Helpers      │
│  • ContractSvc  │    │  • Transactions │    │  • Constants    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Usage

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Run type checking
pnpm type-check
```

### Pages

- `/` - Home dashboard
- `/wallets` - Wallet management
- `/contracts` - Contract deployment and management
- `/transactions` - Transaction monitoring
- `/node` - Node management
- `/settings` - Application settings

### Components

```typescript
import {
  Navbar,
  Sidebar,
  Dashboard,
  WalletCard,
  ContractCard,
  TransactionTable
} from '@conflux-devkit/dashboard';

// Use components
<Navbar />
<Sidebar />
<Dashboard />
<WalletCard wallet={wallet} />
<ContractCard contract={contract} />
<TransactionTable transactions={transactions} />
```

### Services

```typescript
import {
  ApiClient,
  WalletService,
  NodeService,
  ContractService,
} from '@conflux-devkit/dashboard';

// Create services
const apiClient = new ApiClient('http://localhost:3000');
const walletService = new WalletService(apiClient);
const nodeService = new NodeService(apiClient);
const contractService = new ContractService(apiClient);

// Use services
const wallets = await walletService.getWallets();
const nodeStatus = await nodeService.getStatus();
const contracts = await contractService.getContracts();
```

## 📋 API Reference

### Components

- `Navbar` - Main navigation bar
- `Sidebar` - Side navigation
- `Dashboard` - Main dashboard
- `WalletCard` - Wallet information card
- `ContractCard` - Contract information card
- `TransactionTable` - Transaction table
- `NodeStatus` - Node status display
- `NetworkSwitcher` - Network switching component

### Services

- `ApiClient` - API client for backend communication
- `WalletService` - Wallet management service
- `NodeService` - Node management service
- `ContractService` - Contract management service
- `TransactionService` - Transaction management service

### Pages

- `HomePage` - Home dashboard page
- `WalletsPage` - Wallet management page
- `ContractsPage` - Contract management page
- `TransactionsPage` - Transaction monitoring page
- `NodePage` - Node management page
- `SettingsPage` - Settings page

### Utils

- `formatters` - Data formatting utilities
- `validators` - Form validation utilities
- `helpers` - General helper functions
- `constants` - Application constants

## 🔧 Configuration

### Next.js Configuration

```typescript
// next.config.js
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
```

### Mantine Configuration

```typescript
// mantine.config.ts
import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Inter, sans-serif',
  },
});
```

### API Client Configuration

```typescript
import { ApiClient } from '@conflux-devkit/dashboard';

const apiClient = new ApiClient({
  baseUrl: 'http://localhost:3000',
  timeout: 10000,
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test
pnpm test -- --grep "WalletCard"
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
