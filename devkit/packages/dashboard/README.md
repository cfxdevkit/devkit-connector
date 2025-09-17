# @conflux-devkit/dashboard

> **Development dashboard for Conflux DevKit applications**

[![npm version](https://img.shields.io/npm/v/@conflux-devkit/dashboard)](https://www.npmjs.com/package/@conflux-devkit/dashboard)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🎯 Overview

The dashboard package provides a comprehensive development dashboard for Conflux DevKit applications. Built with Next.js and Mantine UI, it offers a modern, responsive interface for managing wallets, contracts, nodes, and networks.

## ✨ Features

- **🎨 Modern UI**: Built with Next.js 14 and Mantine v7
- **💼 Wallet Management**: Complete wallet creation and management interface
- **📦 Contract Operations**: Contract deployment and interaction tools
- **🖥️ Node Control**: Node management and status monitoring
- **🌐 Network Management**: Multi-network switching and configuration
- **📊 Real-time Updates**: Live data updates and state synchronization
- **🔧 Development Tools**: Built-in development and debugging tools
- **📱 Responsive Design**: Mobile-first responsive design

## 📦 Installation

```bash
pnpm add @conflux-devkit/dashboard
# or
npm install @conflux-devkit/dashboard
# or
yarn add @conflux-devkit/dashboard
```

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Open in browser
open http://localhost:3000
```

## 📚 Application Structure

```
dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main dashboard page
│   │   ├── globals.css         # Global styles
│   │   └── test/               # Test pages
│   ├── components/
│   │   └── AppLayout.tsx       # Main app layout
│   ├── services/
│   │   └── api.ts              # API service
│   └── types/
│       └── dashboard.ts        # TypeScript types
├── next.config.js              # Next.js configuration
├── package.json
└── tsconfig.json
```

## 🧪 Dashboard Features

### 1. Development Setup Checklist

Interactive checklist for setting up the development environment:

- **Check Server & Wallet Status**: Verify server is running and wallet is loaded
- **Configure & Start Node**: Review node configuration and start Conflux node
- **Deploy Smart Contracts**: Deploy contracts using Hardhat

**Features:**

- Auto-advancing steps based on completion status
- Real-time status updates
- Error handling and recovery
- Progress tracking

### 2. System Status Overview

Real-time system status monitoring:

- **Node Status**: Running/stopped with health indicators
- **Server Wallet**: Loaded/not loaded with balance information
- **Contracts**: Deployment count and status
- **Network**: Current network and connection status

**Features:**

- Live status updates
- Health indicators
- Error reporting
- Quick actions

### 3. Quick Actions

One-click actions for common operations:

- **Start Development**: Begin development workflow
- **Deploy Contracts**: Deploy smart contracts
- **Configure**: Open configuration panel

**Features:**

- Context-aware actions
- Status-based enabling/disabling
- Progress indicators
- Success/error feedback

### 4. Real-time Updates

Live data synchronization across all components:

- **Wallet Balances**: Real-time balance updates
- **Contract Status**: Live contract deployment status
- **Node Health**: Continuous node health monitoring
- **Network Status**: Live network connection status

## 🔧 Configuration

### Next.js Configuration

```javascript
// next.config.js
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@conflux-devkit/utility'],
  output: 'standalone',
  trailingSlash: true,
  experimental: {
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/modals',
      '@mantine/notifications',
      '@tabler/icons-react',
    ],
  },
  reactStrictMode: false,
  swcMinify: true,
};
```

### Mantine Configuration

```typescript
// app/layout.tsx
import { createTheme, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
  /** Put your mantine theme override here */
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MantineProvider theme={theme}>
          <ModalsProvider>
            <Notifications />
            <AppLayout>{children}</AppLayout>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
```

### Environment Variables

```bash
# Next.js configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Conflux DevKit Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0

# API server configuration
API_SERVER_URL=http://localhost:3001
API_KEY=your-api-key

# Blockchain configuration
CONFLUX_RPC_URL=https://main.confluxrpc.com
CONFLUX_EVM_RPC_URL=https://main.confluxrpc.com
```

## 🧪 Usage Examples

### Basic Dashboard Usage

```typescript
// pages/index.tsx
import {
  Container,
  Stack,
  Title,
  Text,
  Button,
  Group
} from '@mantine/core';
import { useWallets, useContracts, useNode } from '@conflux-devkit/ui-primitives';

export default function DashboardPage() {
  const { wallets, createWallet } = useWallets();
  const { contracts, deployContract } = useContracts();
  const { isRunning, startNode } = useNode();

  const handleCreateWallet = async () => {
    await createWallet();
  };

  const handleDeployContract = async () => {
    await deployContract({
      name: 'MyToken',
      bytecode: '0x...',
      abi: [...],
      args: [1000000]
    });
  };

  const handleStartNode = async () => {
    await startNode();
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="md">
        <Title order={1}>Conflux DevKit Dashboard</Title>

        <Group>
          <Button onClick={handleCreateWallet}>
            Create Wallet
          </Button>
          <Button onClick={handleDeployContract}>
            Deploy Contract
          </Button>
          <Button onClick={handleStartNode} disabled={isRunning}>
            {isRunning ? 'Node Running' : 'Start Node'}
          </Button>
        </Group>

        <div>
          <Text size="lg">Wallets: {wallets.length}</Text>
          <Text size="lg">Contracts: {contracts.length}</Text>
          <Text size="lg">Node Status: {isRunning ? 'Running' : 'Stopped'}</Text>
        </div>
      </Stack>
    </Container>
  );
}
```

### Custom Components

```typescript
// components/WalletManager.tsx
import {
  Card,
  Stack,
  Text,
  Button,
  Badge,
  Group
} from '@mantine/core';
import { useWallets } from '@conflux-devkit/ui-primitives';

export function WalletManager() {
  const { wallets, createWallet, refreshBalance } = useWallets();

  const handleCreateWallet = async () => {
    await createWallet();
  };

  const handleRefreshBalance = async (address: string) => {
    await refreshBalance(address);
  };

  return (
    <Card withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={700}>Wallets</Text>
          <Button onClick={handleCreateWallet}>
            Create Wallet
          </Button>
        </Group>

        {wallets.map(wallet => (
          <Card key={wallet.address} withBorder>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {wallet.address}
                </Text>
                <Badge color="green">
                  {wallet.balanceFormatted}
                </Badge>
              </Group>
              <Button
                size="xs"
                variant="light"
                onClick={() => handleRefreshBalance(wallet.address)}
              >
                Refresh Balance
              </Button>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Card>
  );
}
```

### API Integration

```typescript
// services/api.ts
import {
  systemApi,
  walletApi,
  contractApi,
  nodeApi,
} from '@conflux-devkit/api-server';

export class DashboardAPI {
  // System health
  static async getHealth() {
    return await systemApi.healthCheck();
  }

  // Wallet operations
  static async createWallet(mnemonic?: string) {
    return await walletApi.createWallet(mnemonic);
  }

  static async getWallets() {
    return await walletApi.getAllWallets();
  }

  // Contract operations
  static async deployContract(config: ContractDeploymentConfig) {
    return await contractApi.deployContract(config);
  }

  static async getContracts() {
    return await contractApi.getAllContracts();
  }

  // Node operations
  static async getNodeStatus() {
    return await nodeApi.getNodeStatus();
  }

  static async startNode(config?: Partial<NodeConfig>) {
    return await nodeApi.startNode(config);
  }

  static async stopNode() {
    return await nodeApi.stopNode();
  }
}
```

## 🚀 Development

### Available Scripts

```bash
# Development
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run start        # Start production server

# Linting
pnpm run lint         # Lint code
pnpm run format       # Format code

# Type checking
pnpm run type-check   # Check TypeScript types
```

### Development Workflow

1. **Start API Server**: Make sure the API server is running on port 3001
2. **Start Dashboard**: Run `pnpm run dev` to start the dashboard
3. **Open Browser**: Navigate to `http://localhost:3000`
4. **Test Features**: Try out all the dashboard features
5. **Check Console**: Monitor browser console for any errors

### Adding New Features

1. **Create Component**: Add new component in the `components` directory
2. **Update Layout**: Add the component to the main layout
3. **Add Styling**: Style the component with Mantine components
4. **Test Integration**: Ensure it works with the API server
5. **Update Documentation**: Update this README with the new feature

## 🔗 Dependencies

- **next**: React framework
- **@mantine/core**: UI component library
- **@mantine/hooks**: React hooks
- **@mantine/modals**: Modal components
- **@mantine/notifications**: Notification system
- **@tabler/icons-react**: Icon library
- **@conflux-devkit/core**: Core types and utilities
- **@conflux-devkit/state**: State management
- **@conflux-devkit/api-server**: API server integration
- **@conflux-devkit/ui-primitives**: React hooks and context

## 📊 Bundle Size

- **Minified**: ~200KB
- **Gzipped**: ~60KB
- **Tree-shakeable**: Import only what you need

## 🚨 Troubleshooting

### Common Issues

1. **Build Errors**: Check Next.js configuration and TypeScript settings
2. **API Connection**: Verify API server is running on port 3001
3. **Styling Issues**: Check Mantine theme configuration
4. **State Issues**: Verify state management integration

### Debug Mode

```bash
# Enable debug logging
DEBUG=conflux-devkit:* pnpm run dev

# Check build output
pnpm run build

# Check type errors
pnpm run type-check
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Part of the Conflux DevKit ecosystem** 🚀
