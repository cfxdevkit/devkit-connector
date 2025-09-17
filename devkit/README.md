# Conflux DevKit

> **A comprehensive blockchain development platform for Conflux Network**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/conflux-devkit/devkit)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🚀 Overview

Conflux DevKit is a complete development platform that provides everything needed to build, deploy, and manage applications on the Conflux blockchain. It offers a unified interface for both Conflux Core and EVM-compatible development with real-time state management, comprehensive APIs, and production-ready UI components.

## ✨ Key Features

- **🔗 Dual Chain Support**: Seamless development for both Conflux Core and EVM chains
- **💼 Real Wallet Management**: BIP39/BIP32 compliant wallet generation and management
- **📦 Smart Contract Tools**: Complete deployment, interaction, and management suite
- **🌐 Network Management**: Support for Mainnet, Testnet, and Local development networks
- **🎨 UI Components**: Production-ready React and Web Components
- **📊 Real-time State**: Zustand-powered state management with persistence
- **🔌 Comprehensive APIs**: RESTful APIs with real-time updates
- **🛠️ Development Tools**: CLI tools, workflow automation, and debugging utilities

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Conflux DevKit                          │
├─────────────────────────────────────────────────────────────────┤
│  🌐 Dashboard (Next.js)  │  🎨 Showcase WebApp (Express)      │
├─────────────────────────────────────────────────────────────────┤
│  📱 UI Primitives (React)  │  🧩 UI Components (Web)          │
├─────────────────────────────────────────────────────────────────┤
│  🔌 API Server (Express)  │  📊 State Management (Zustand)    │
├─────────────────────────────────────────────────────────────────┤
│  ⛓️ Blockchain Package   │  🏗️ Node Manager (CLI)            │
├─────────────────────────────────────────────────────────────────┤
│  🎯 Core Package (Types & Utils)                              │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Packages

| Package                                                         | Description                                  | Status              |
| --------------------------------------------------------------- | -------------------------------------------- | ------------------- |
| [`@conflux-devkit/core`](./packages/core)                       | Core types, utilities, and shared interfaces | ✅ Production Ready |
| [`@conflux-devkit/blockchain`](./packages/blockchain)           | Blockchain interactions (EVM + Core)         | ✅ Production Ready |
| [`@conflux-devkit/state`](./packages/state)                     | State management with Zustand                | ✅ Production Ready |
| [`@conflux-devkit/api-server`](./packages/api-server)           | RESTful API server                           | ✅ Production Ready |
| [`@conflux-devkit/ui-primitives`](./packages/ui-primitives)     | React hooks and context providers            | ✅ Production Ready |
| [`@conflux-devkit/ui-components`](./packages/ui-components)     | Web Components (Lit)                         | ✅ Production Ready |
| [`@conflux-devkit/devkit-node`](./packages/devkit-node)         | Node management and CLI tools                | ✅ Production Ready |
| [`@conflux-devkit/showcase-webapp`](./packages/showcase-webapp) | Demo application                             | ✅ Production Ready |
| [`@conflux-devkit/dashboard`](./packages/dashboard)             | Development dashboard                        | ✅ Build Ready      |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/conflux-devkit/devkit.git
cd devkit

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Start development servers
pnpm run dev
```

### Basic Usage

```typescript
import { WalletManager } from '@conflux-devkit/blockchain';
import { useAppStore } from '@conflux-devkit/state';
import { EvmClient } from '@conflux-devkit/blockchain';

// Create a wallet
const walletManager = new WalletManager();
const wallet = walletManager.generateWallet();

// Connect to network
const evmClient = new EvmClient(networkConfig, wallet.privateKey);

// Use state management
const { createWallet, connect } = useAppStore();
await connect({ chainId: 2029 });
await createWallet();
```

## 🌐 Networks Supported

| Network              | Chain ID | EVM Chain ID | Type | Status       |
| -------------------- | -------- | ------------ | ---- | ------------ |
| Conflux Mainnet Core | 2029     | -            | Core | ✅ Supported |
| Conflux Mainnet EVM  | -        | 2030         | EVM  | ✅ Supported |
| Conflux Testnet Core | 2029     | -            | Core | ✅ Supported |
| Conflux Testnet EVM  | -        | 2030         | EVM  | ✅ Supported |
| Local Core           | 2029     | -            | Core | ✅ Supported |
| Local EVM            | -        | 2030         | EVM  | ✅ Supported |

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm run dev          # Start all development servers
pnpm run dev:core     # Start core package in watch mode
pnpm run dev:api      # Start API server
pnpm run dev:dashboard # Start dashboard

# Building
pnpm run build        # Build all packages
pnpm run build:core   # Build core package
pnpm run clean        # Clean all build artifacts

# Testing
pnpm run test         # Run all tests
pnpm run test:core    # Run core package tests
pnpm run lint         # Lint all packages
pnpm run format       # Format all packages

# Utilities
pnpm run checkpoint   # Run full validation and commit
```

### Project Structure

```
devkit/
├── packages/
│   ├── core/                 # Core types and utilities
│   ├── blockchain/           # Blockchain interactions
│   ├── state/               # State management
│   ├── api-server/          # RESTful API server
│   ├── ui-primitives/       # React hooks and context
│   ├── ui-components/       # Web Components
│   ├── devkit-node/         # Node management CLI
│   ├── showcase-webapp/     # Demo application
│   └── dashboard/           # Development dashboard
├── turbo.json               # Turbo configuration
├── pnpm-workspace.yaml      # pnpm workspace config
└── tsconfig.json           # TypeScript configuration
```

## 🔧 Configuration

### Environment Variables

```bash
# API Server
PORT=3001
NODE_ENV=development

# Dashboard
NEXT_PUBLIC_API_URL=http://localhost:3001

# Blockchain
CONFLUX_RPC_URL=http://localhost:12537
CONFLUX_EVM_RPC_URL=http://localhost:8545
```

### Network Configuration

```typescript
import { networkManager } from '@conflux-devkit/blockchain';

// Get network configuration
const network = networkManager.getNetwork('2029'); // Mainnet Core
const evmNetwork = networkManager.getNetwork('2030'); // Mainnet EVM

// Create clients
const coreClient = CoreClient.createFromNetworkId('2029');
const evmClient = EvmClient.createFromNetworkId('2030');
```

## 📚 Documentation

- [Core Package](./packages/core/README.md) - Types, utilities, and shared interfaces
- [Blockchain Package](./packages/blockchain/README.md) - Blockchain interactions and wallet management
- [State Package](./packages/state/README.md) - State management with Zustand
- [API Server](./packages/api-server/README.md) - RESTful API documentation
- [UI Primitives](./packages/ui-primitives/README.md) - React hooks and context providers
- [UI Components](./packages/ui-components/README.md) - Web Components documentation
- [Node Manager](./packages/devkit-node/README.md) - CLI tools and node management
- [Showcase WebApp](./packages/showcase-webapp/README.md) - Demo application
- [Dashboard](./packages/dashboard/README.md) - Development dashboard

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm run test`
5. Run linting: `pnpm run lint`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Conflux Network](https://confluxnetwork.org/) for the blockchain infrastructure
- [viem](https://viem.sh/) for EVM interactions
- [Zustand](https://zustand-demo.pmnd.rs/) for state management
- [Mantine](https://mantine.dev/) for UI components
- [Next.js](https://nextjs.org/) for the dashboard framework

## 📞 Support

- 📧 Email: support@conflux-devkit.org
- 💬 Discord: [Conflux DevKit Community](https://discord.gg/conflux-devkit)
- 📖 Documentation: [docs.conflux-devkit.org](https://docs.conflux-devkit.org)
- 🐛 Issues: [GitHub Issues](https://github.com/conflux-devkit/devkit/issues)

---

**Built with ❤️ for the Conflux ecosystem**
