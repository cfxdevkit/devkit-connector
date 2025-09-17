# Conflux DevKit

A comprehensive TypeScript monorepo for Conflux blockchain development with unified node management, API services, and dashboard interfaces.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                CONFLUX DEVKIT                                  │
│                              Monorepo Architecture                             │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   @conflux-     │    │   @conflux-     │    │   @conflux-     │    │   @conflux-     │
│   devkit/core   │    │   devkit/       │    │   devkit/node   │    │   devkit/       │
│                 │    │   blockchain    │    │                 │    │   api-server    │
│  • Types        │◄───┤                 │◄───┤                 │◄───┤                 │
│  • Constants    │    │  • RPC Clients  │    │  • Node Mgmt    │    │  • Express API  │
│  • Schemas      │    │  • Contracts    │    │  • Workflows    │    │  • Services     │
│  • Utils        │    │  • Wallets      │    │  • CLI Tools    │    │  • Routes       │
│  • Validation   │    │  • Networks     │    │  • Lifecycle    │    │  • Middleware   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   @conflux-     │    │   @conflux-     │    │   @conflux-     │    │   @conflux-     │
│   devkit/       │    │   devkit/       │    │   devkit/       │    │   devkit/       │
│   dashboard     │    │   devkit-       │    │   devkit-       │    │   devkit-       │
│                 │    │   node          │    │   node          │    │   node          │
│  • Next.js UI   │    │                 │    │                 │    │                 │
│  • Mantine UI   │    │  • ConfluxNode  │    │  • NodeService  │    │  • UnifiedCLI   │
│  • Components   │    │  • WalletMgr    │    │  • Workflows    │    │  • Commands     │
│  • Services     │    │  • ContractDep  │    │  • Lifecycle    │    │  • Helpers      │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📦 Package Structure

### Core Packages

| Package                        | Status      | Description                                        | Dependencies     |
| ------------------------------ | ----------- | -------------------------------------------------- | ---------------- |
| **@conflux-devkit/core**       | ✅ Complete | Core types, constants, schemas, and utilities      | None             |
| **@conflux-devkit/blockchain** | ✅ Complete | Blockchain operations, RPC clients, contracts      | core             |
| **@conflux-devkit/node**       | ✅ Complete | Unified node management and workflow orchestration | core, blockchain |
| **@conflux-devkit/api-server** | 🔄 Partial  | Express API server with services and routes        | core, blockchain |
| **@conflux-devkit/dashboard**  | 🔄 Partial  | Next.js dashboard with Mantine UI                  | core, blockchain |

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Start development
pnpm run dev
```

### Node Management

```bash
# Start a Conflux node
pnpm -w devkit-node start

# Run complete workflow
pnpm -w devkit-node workflow

# Deploy contracts
pnpm -w devkit-node deploy --contracts MyContract

# Check node status
pnpm -w devkit-node status
```

### API Server

```bash
# Start API server
pnpm -w start:api-server

# Start full stack (API + Dashboard)
pnpm -w start:full-stack
```

## 🔧 Development

### Available Scripts

```bash
# Build all packages
pnpm run build

# Development mode
pnpm run dev

# Linting and formatting
pnpm run lint
pnpm run format
pnpm run check

# Clean build artifacts
pnpm run clean

# Run checkpoint (build + test + check)
pnpm run checkpoint
```

### Package-specific Scripts

```bash
# Core package
pnpm --filter @conflux-devkit/core build

# Blockchain package
pnpm --filter @conflux-devkit/blockchain build

# Node package
pnpm --filter @conflux-devkit/node build
pnpm --filter @conflux-devkit/node workflow

# API Server
pnpm --filter @conflux-devkit/api-server dev

# Dashboard
pnpm --filter @conflux-devkit/dashboard dev
```

## 📋 Type System Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              TYPE SYSTEM FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CORE TYPES    │    │  BLOCKCHAIN     │    │   NODE TYPES    │
│                 │    │     TYPES       │    │                 │
│  • NodeConfig   │───►│  • RPC Clients  │───►│  • NodeStatus   │
│  • WalletInfo   │    │  • Contracts    │    │  • WorkflowResult│
│  • NetworkConfig│    │  • Transactions │    │  • ValidationResult│
│  • Constants    │    │  • API Responses│    │  • Service Interfaces│
│  • Schemas      │    │  • Normalization│    │  • CLI Options  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API TYPES     │    │  BROWSER TYPES  │    │  SERVICE TYPES  │
│                 │    │                 │    │                 │
│  • ApiResponse  │    │  • BrowserWallet│    │  • INodeService │
│  • ApiError     │    │  • BrowserTx    │    │  • IWorkflowService│
│  • ResponseMeta │    │  • BrowserBlock │    │  • IWalletService│
│  • Error Classes│    │  • BrowserContract│   │  • IContractService│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Key Features

### Core Package

- **Unified Type System** - Comprehensive TypeScript types for all Conflux operations
- **Network Configuration** - Support for 6 Conflux network combinations (Core/EVM × Main/Test/Local)
- **Validation Schemas** - Zod schemas for runtime validation
- **Constants** - Network IDs, addresses, and configuration defaults
- **Utilities** - Type normalization and browser-safe conversions

### Blockchain Package

- **RPC Clients** - Unified interface for Core and EVM operations
- **Contract Management** - Deployment, interaction, and orchestration
- **Wallet Operations** - Creation, management, and funding
- **API Types** - Normalized response types for browser compatibility
- **Network Management** - Multi-network support and switching

### Node Package

- **Unified Node Management** - Single package for all node operations
- **Workflow Orchestration** - Complete development workflows
- **CLI Interface** - Comprehensive command-line tools
- **Service Architecture** - Clean interfaces for all operations
- **Health Monitoring** - Node status and health checks

### API Server Package

- **Express Server** - Modern API server with middleware
- **Service Layer** - Clean separation of concerns
- **Route Handlers** - RESTful API endpoints
- **Error Handling** - Comprehensive error management
- **Type Safety** - Full TypeScript integration

### Dashboard Package

- **Next.js Application** - Modern React framework
- **Mantine UI** - Beautiful component library
- **Type Integration** - Full TypeScript support
- **Service Integration** - API client services
- **Responsive Design** - Mobile-friendly interface

## 🔗 Dependencies

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DEPENDENCY FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   @conflux-     │
│   devkit/core   │
│                 │
│  • No deps      │
│  • Base types   │
│  • Utilities    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   @conflux-     │
│   devkit/       │
│   blockchain    │
│                 │
│  • Depends on   │
│    core         │
│  • RPC clients  │
│  • Contracts    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   @conflux-     │
│   devkit/node   │
│                 │
│  • Depends on   │
│    core +       │
│    blockchain   │
│  • Node mgmt    │
│  • Workflows    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   @conflux-     │
│   devkit/       │
│   api-server    │
│                 │
│  • Depends on   │
│    core +       │
│    blockchain   │
│  • Express API  │
│  • Services     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   @conflux-     │
│   devkit/       │
│   dashboard     │
│                 │
│  • Depends on   │
│    core +       │
│    blockchain   │
│  • Next.js UI   │
│  • Mantine UI   │
└─────────────────┘
```

## 🛠️ Technology Stack

- **TypeScript** - Type-safe development
- **pnpm** - Fast package manager
- **Turbo** - Monorepo task runner
- **Biome** - Linting and formatting
- **Next.js** - React framework
- **Mantine** - UI component library
- **Express** - API server
- **viem** - EVM client library
- **cive** - Conflux Core client library

## 📚 Documentation

- [Core Package](./packages/core/README.md) - Core types and utilities
- [Blockchain Package](./packages/blockchain/README.md) - Blockchain operations
- [Node Package](./packages/devkit-node/README.md) - Node management
- [API Server](./packages/api-server/README.md) - API server
- [Dashboard](./packages/dashboard/README.md) - Dashboard UI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.
