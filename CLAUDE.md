# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **dual-purpose monorepo** combining two major development environments:

1. **Root Monorepo**: Legacy Conflux tooling with Node management, frontends, and servers
2. **DevKit Ecosystem** (`/devkit`): Modern, production-ready blockchain development platform

The repository is in a **transition state** - the DevKit subfolder represents the modern architecture while root-level packages are legacy implementations.

## Workspace Structure

```
/
├── devkit/                    # Main DevKit ecosystem (Turbo monorepo)
│   └── packages/              # 8 production-ready DevKit packages
├── packages/                  # Legacy: conflux-local-node
├── contracts/                 # Smart contracts (Hardhat)
├── deployment/                # Deployment scripts
├── server/                    # Legacy Express server
├── frontend/                  # Legacy frontend
├── frontend-mantine/          # Legacy Mantine-based frontend
└── shared/                    # Auto-generated contract configs
```

### Critical Architecture Understanding

**DevKit Monorepo** (`/devkit`) uses:
- **Build System**: Turborepo with pnpm workspaces
- **Package Manager**: pnpm (>=8.0.0)
- **Node Version**: >=18.0.0
- **Linter**: Biome (not ESLint)
- **Type System**: Strict TypeScript 5.0+

**Root Monorepo** uses:
- **Package Manager**: pnpm with workspace protocol
- **Build**: Per-package build scripts
- **Type System**: TypeScript with shared tsconfig.json

## Common Commands

### DevKit Development (Primary)

```bash
# From /devkit directory
cd devkit

# Build all DevKit packages (dependencies handled by Turbo)
pnpm run build

# Run all tests
pnpm run test

# Type checking
pnpm run type-check

# Linting with Biome
pnpm run lint              # Check only
pnpm run lint:fix          # Auto-fix
pnpm run check             # Format + lint check
pnpm run check:fix         # Auto-fix format + lint

# Development servers
pnpm run dev                              # All packages in watch mode
pnpm run start:full-stack                 # API server + Showcase webapp
pnpm run start:api-server                 # API server only
pnpm run start:showcase                   # Showcase webapp only

# Clean build artifacts
pnpm run clean

# Run validation checkpoint (build + test + check)
pnpm run checkpoint
```

### Root Monorepo (Legacy)

```bash
# From repository root
pnpm install:all           # Install all dependencies
pnpm run build             # Build all workspaces
pnpm run test              # Run all tests
pnpm run dev               # Start full stack (server + frontend-mantine)

# Contract operations
pnpm run generate:contracts  # Generate contract config from artifacts
pnpm run contracts:sync      # Sync contract configurations

# Individual services
pnpm run start:conflux-node      # Start local Conflux node
pnpm run start:server            # Start backend server
pnpm run start:frontend-mantine  # Start Mantine frontend
```

### Contract Development

```bash
# From /contracts directory
cd contracts

# Compile contracts
npx hardhat compile

# Deploy contracts (uses Hardhat Ignition)
npx hardhat ignition deploy ignition/modules/Counter.ts --network localEspace
npx hardhat ignition deploy ignition/modules/DelegationManager.ts --network localEspace

# From /deployment directory (legacy)
cd deployment
pnpm run deploy:local              # Deploy to local network
pnpm run deploy:counter            # Deploy Counter only
pnpm run deploy:delegation         # Deploy DelegationManager only
```

## Architecture Deep Dive

### DevKit Package Dependency Graph

```
ui-primitives (React) ──┐
ui-components (Lit)     ├──> state (Zustand) ──┐
api-server (Express)    ┘                      ├──> blockchain ──> core
showcase-webapp         ───────────────────────┘
devkit-node (CLI)       ───────────────────────────> blockchain ──> core
```

**Core Package** (`@conflux-devkit/core`):
- Foundation for all packages
- No external runtime dependencies
- Exports: `NetworkConfig`, `WalletInfo`, `ContractOrchestrator`, `BrowserWalletInfo`
- Utilities: `normalizeAddress`, `normalizeBigInt`, `toBrowserSafe`, `createApiResponse`
- Browser conversion layer for BigInt/complex types

**Blockchain Package** (`@conflux-devkit/blockchain`):
- Dual-chain support: Conflux Core (via `@xcfx/node`) + EVM (via `viem`)
- Wallet management: BIP39/BIP32 compliant (`WalletManager`)
- RPC Clients: `EvmClient`, `CoreClient` with factory methods
- Network manager: Supports 6 networks (Mainnet/Testnet/Local × Core/EVM)
- Contract deployment and interaction

**State Package** (`@conflux-devkit/state`):
- Zustand-based state management with persistence
- Real blockchain service integration (not mocks)
- Event-driven architecture
- Store methods: `createWallet`, `connect`, `deployContract`, `callContract`

**API Server Package** (`@conflux-devkit/api-server`):
- RESTful APIs for all DevKit operations
- Real-time blockchain data
- Security: CORS, rate limiting, helmet
- Endpoints: `/api/wallets`, `/api/contracts`, `/api/network`, `/api/node`

**UI Packages**:
- `ui-primitives`: React hooks (`useWallets`, `useContracts`, `useNode`) + `ConfluxProvider`
- `ui-components`: Web Components (Lit) for framework-agnostic usage

### Contract Configuration System

The repository uses an **auto-generation system** for contract configurations:

1. **Source**: `scripts/generate-contract-config.cjs` (runs on `postinstall`)
2. **Inputs**:
   - `/contracts/artifacts/` - Hardhat compilation artifacts (ABIs, bytecode)
   - `/contracts/ignition/deployments/` - Hardhat Ignition deployments
   - `/deployment/deployments/` - Legacy deployment files
3. **Output**: `/shared/contract-config.json` (unified config for frontend/server)
4. **Priority**: Ignition deployments > Legacy deployments

**Key Insight**: When contracts change, run `pnpm run generate:contracts` to update configurations.

### Network Configuration

**Supported Networks** (defined in `@conflux-devkit/blockchain/src/network-manager.ts`):

| Network              | Chain ID | EVM Chain ID | RPC URL (Default)              |
| -------------------- | -------- | ------------ | ------------------------------ |
| Conflux Mainnet Core | 2029     | -            | https://main.confluxrpc.com    |
| Conflux Mainnet EVM  | -        | 2030         | https://main.confluxrpc.com    |
| Conflux Testnet Core | 2029     | -            | https://test.confluxrpc.com    |
| Conflux Testnet EVM  | -        | 2030         | https://test.confluxrpc.com    |
| Local Core           | 2029     | -            | http://localhost:12537         |
| Local EVM            | -        | 2030         | http://localhost:8545          |

**Important**: Local network detection uses RPC URL patterns (`localhost`, `127.0.0.1`) not chain IDs.

### Type System Conventions

**Browser Safety**: The codebase has a strict separation between Node.js types and browser-safe types.

- **Node.js types**: Use `bigint`, raw addresses, complex objects
- **Browser types**: Prefixed with `Browser*` (e.g., `BrowserWalletInfo`, `BrowserNetworkConfig`)
  - All numeric values as strings
  - All BigInts converted to strings
  - Safe JSON serialization

**Normalization Functions** (in `@conflux-devkit/core`):
- `normalizeAddress(address: string): string` - Checksummed addresses
- `normalizeBigInt(value: string | bigint | number): bigint` - Safe BigInt conversion
- `toBrowserSafe(data: any): any` - Recursive browser-safe conversion

### Testing Strategy

**DevKit Packages**:
- Core: Comprehensive unit tests in `/packages/core/tests/`
- Blockchain: Integration tests with real network connections
- State: Real blockchain service integration (not mocks)
- Run tests: `turbo run test` (from `/devkit`)

**Contracts**:
- Hardhat test framework
- Test files in `/contracts/test/`
- Run: `npx hardhat test` (from `/contracts`)

## Development Patterns

### Adding a New Contract

1. Write contract in `/contracts/contracts/YourContract.sol`
2. Create Ignition module in `/contracts/ignition/modules/YourContract.ts`
3. Compile: `npx hardhat compile` (from `/contracts`)
4. Deploy: `npx hardhat ignition deploy ignition/modules/YourContract.ts --network localEspace`
5. Regenerate configs: `pnpm run generate:contracts` (from root)
6. Contract is now available in `/shared/contract-config.json`

### Working with DevKit Packages

**When modifying core or blockchain packages**:
1. Changes propagate automatically via Turbo's dependency graph
2. Dependent packages rebuild automatically during `turbo run dev`
3. Always run from `/devkit` directory, not individual packages

**When adding dependencies**:
```bash
# Add to specific package
pnpm add <package> --filter @conflux-devkit/core

# Add to all packages
pnpm add <package> -w
```

### State Management Pattern

The DevKit uses **real blockchain integration**, not mocks:

```typescript
// In components/hooks
import { useAppStore } from '@conflux-devkit/state';

const { wallets, createWallet, connect } = useAppStore();

// Connect to network (initializes real RPC clients)
await connect({ chainId: 2030 });

// Create real wallet (generates BIP39 mnemonic)
const wallet = await createWallet();

// Deploy real contract
const contract = await deployContract({
  name: 'Counter',
  bytecode: '0x...',
  abi: [...]
});
```

### Multi-Space Architecture (Core vs EVM)

Conflux has **two execution spaces**:
- **Core Space**: Native Conflux (uses `@xcfx/node`, chain ID 2029)
- **eSpace (EVM)**: EVM-compatible (uses `viem`, chain ID 2030)

**Client Selection**:
```typescript
import { EvmClient, CoreClient, networkManager } from '@conflux-devkit/blockchain';

// For EVM operations
const evmNetwork = networkManager.getNetwork('2030');
const evmClient = new EvmClient(evmNetwork, privateKey);

// For Core operations
const coreNetwork = networkManager.getNetwork('2029');
const coreClient = new CoreClient(coreNetwork);
```

## Key Files and Locations

### Configuration Files
- `/devkit/turbo.json` - Turborepo configuration
- `/devkit/biome.json` - Biome linter configuration
- `/devkit/tsconfig.base.json` - Shared TypeScript config for DevKit
- `/tsconfig.json` - Root TypeScript config
- `/pnpm-workspace.yaml` - Workspace definitions
- `/contracts/hardhat.config.ts` - Hardhat configuration

### Auto-Generated Files (Do Not Edit Manually)
- `/shared/contract-config.json` - Generated by `generate-contract-config.cjs`
- `/shared/contract-config.d.ts` - TypeScript definitions
- `/shared/contract-config.js` - CommonJS module
- `/shared/contract-config.mjs` - ES module
- `/contracts/artifacts/` - Hardhat compilation outputs

### Package Entry Points
- DevKit core: `/devkit/packages/core/src/index.ts`
- DevKit blockchain: `/devkit/packages/blockchain/src/index.ts`
- DevKit state: `/devkit/packages/state/src/index.ts`
- DevKit API server: `/devkit/packages/api-server/src/server.ts`

## Environment Variables

### DevKit API Server
```bash
PORT=3001                    # API server port
NODE_ENV=development         # Environment
```

### Blockchain Connections
```bash
CONFLUX_RPC_URL=http://localhost:12537      # Core RPC
CONFLUX_EVM_RPC_URL=http://localhost:8545   # EVM RPC
ESPACE_RPC_URL=http://localhost:8545        # Alternative EVM RPC (legacy)
```

### Server (Legacy)
```bash
PORT=3000                    # Server port
ESPACE_RPC_URL=http://localhost:8545
```

## Common Issues and Solutions

### "Module not found" in DevKit packages
**Cause**: Packages not built or build cache stale
**Solution**: Run `pnpm run build` from `/devkit`, Turbo handles dependencies

### Contract config out of sync
**Cause**: Contracts deployed but config not regenerated
**Solution**: Run `pnpm run generate:contracts` from root

### Type errors with BigInt
**Cause**: Mixing Node.js types with browser types
**Solution**: Use `toBrowserSafe()` when passing data to frontend, `normalizeBigInt()` when receiving

### Turbo cache issues
**Solution**: `pnpm run clean` from `/devkit`, then rebuild

### Port conflicts
**Default Ports**:
- Local Conflux Core: 12537
- Local Conflux EVM: 8545
- DevKit API Server: 3001
- Legacy Server: 3000
- Showcase WebApp: 3002

## Git Workflow

**Main Branch**: `dev` (not `main` or `master`)

When creating PRs, target the `dev` branch.

## Important Notes

1. **Always work in `/devkit` for DevKit packages** - Don't run commands from individual package directories
2. **Contract config auto-generates on install** - `postinstall` hook runs `generate:contracts`
3. **Use Biome, not ESLint** - DevKit uses Biome for linting and formatting
4. **Real blockchain integration** - State management uses real RPC clients, not mocks
5. **Browser type safety** - Use `Browser*` types for frontend, normalize at boundaries
6. **Network detection** - Local networks identified by RPC URL, not chain ID
7. **Dual-space awareness** - Always specify whether working with Core or EVM space
