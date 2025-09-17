# Conflux DevKit - Comprehensive Dependency Flow Diagram

## 🏗️ **Ideal Package Architecture with Implementation Status**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    🏗️ ROOT PACKAGE                                            │
│                              conflux-devkit (Monorepo Root)                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ External Dependencies: @xcfx/node: ^0.6.0, cive: ^0.8.1, pnpm + Turbo                │  │
│  │ Status: ✅ IMPLEMENTED                                                                  │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                🏗️ @conflux-devkit/core                                       │
│                              Foundation Package (No Internal Dependencies)                    │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ External Dependencies: viem: ^2.21.0, zod: ^3.22.4, @types/node: ^20.0.0             │  │
│  │ Status: ✅ FULLY IMPLEMENTED                                                           │  │
│  │                                                                                         │  │
│  │ 📋 Core Types:                                                                          │  │
│  │   • WalletInfo, NodeConfig, TransactionRequest, ContractInfo                           │  │
│  │   • NetworkConfig, DeploymentResult, TransactionReceipt                                │  │
│  │   • AbiItem, Block, Log, ReadContractParams, WriteContractParams                       │  │
│  │                                                                                         │  │
│  │ 🔧 RPC Interfaces:                                                                      │  │
│  │   • EvmClient, CoreClient (abstract interfaces)                                        │  │
│  │                                                                                         │  │
│  │ 🚨 Error Hierarchy:                                                                    │  │
│  │   • BaseError, ValidationError, WalletError, NetworkError                              │  │
│  │   • ContractError, NodeError, ConfigurationError, InternalError                        │  │
│  │                                                                                         │  │
│  │ 📊 API Response Types:                                                                  │  │
│  │   • ApiResponse<T>, ApiError, ResponseMeta                                             │  │
│  │                                                                                         │  │
│  │ 🔍 Validation Schemas:                                                                  │  │
│  │   • Zod schemas for all major types                                                    │  │
│  │                                                                                         │  │
│  │ 🛠️ Utilities:                                                                          │  │
│  │   • formatting, validation, conversion functions                                       │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            🔗 @conflux-devkit/blockchain                                     │
│                              Blockchain Operations Package                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Dependencies: @conflux-devkit/core: workspace:*, @xcfx/node: ^0.6.0, cive: ^0.8.1     │  │
│  │              viem: ^2.21.0, bip32: ^4.0.0, bip39: ^3.1.0, tiny-secp256k1: ^2.2.4    │  │
│  │ Status: ✅ FULLY IMPLEMENTED                                                           │  │
│  │                                                                                         │  │
│  │ 📦 Exports:                                                                             │  │
│  │   • WalletManager (wallet generation, management)                                      │  │
│  │   • TransactionManager (transaction handling)                                          │  │
│  │   • ContractManager (contract deployment, interaction)                                 │  │
│  │   • RpcManager (RPC client management)                                                 │  │
│  │                                                                                         │  │
│  │ 🔧 RPC Implementations:                                                                 │  │
│  │   • EvmClient (implements IEvmClient using viem)                                       │  │
│  │   • CoreClient (implements ICoreClient using cive)                                     │  │
│  │                                                                                         │  │
│  │ 📋 Type Usage:                                                                          │  │
│  │   • Implements: EvmClient, CoreClient from core                                        │  │
│  │   • Uses: WalletInfo, TransactionRequest, ContractInfo from core                       │  │
│  │   • Extends: Error types with blockchain-specific errors                               │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        🖥️ @conflux-devkit/node-manager                                       │
│                          Node Lifecycle Management Package                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Dependencies: @conflux-devkit/core: workspace:*, @conflux-devkit/blockchain: workspace:* │  │
│  │              commander: ^11.1.0, ora: ^8.0.1, chalk: ^5.3.0                          │  │
│  │ Status: ✅ FULLY IMPLEMENTED                                                           │  │
│  │                                                                                         │  │
│  │ 📦 Exports:                                                                             │  │
│  │   • NodeManager (node lifecycle management)                                            │  │
│  │   • HealthChecker (node health monitoring)                                             │  │
│  │   • PerformanceMonitor (performance tracking)                                          │  │
│  │   • CLI Commands (start, stop, status, deploy)                                         │  │
│  │                                                                                         │  │
│  │ 📋 Type Usage:                                                                          │  │
│  │   • Uses: NodeConfig, NodeStatus, WalletInfo from core                                 │  │
│  │   • Uses: WalletManager from blockchain package                                        │  │
│  │   • Exports: NodeManager, HealthChecker, PerformanceMonitor                           │  │
│  │   • CLI: Command interfaces and options with proper type safety                        │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            🌐 @conflux-devkit/api-server                                     │
│                              Backend API Package                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Dependencies: @conflux-devkit/core: workspace:*, @conflux-devkit/blockchain: workspace:* │  │
│  │              express: ^4.18.2, cors: ^2.8.5, helmet: ^7.1.0, express-rate-limit: ^7.1.5 │  │
│  │              jsonwebtoken: ^9.0.2                                                      │  │
│  │ Status: ✅ FULLY IMPLEMENTED                                                           │  │
│  │                                                                                         │  │
│  │ 📦 Exports:                                                                             │  │
│  │   • ApiServer (main server class)                                                      │  │
│  │   • WalletService (wallet operations)                                                  │  │
│  │   • TransactionService (transaction operations)                                        │  │
│  │   • ContractService (contract operations)                                              │  │
│  │   • NodeService (node operations)                                                      │  │
│  │   • Express Routes (RESTful API endpoints)                                             │  │
│  │                                                                                         │  │
│  │ 📋 Type Usage:                                                                          │  │
│  │   • Uses: All core types for API responses                                             │  │
│  │   • Uses: Blockchain services for operations                                           │  │
│  │   • Implements: WalletService, TransactionService, ContractService                     │  │
│  │   • Exports: Express routes with proper typing                                         │  │
│  │                                                                                         │  │
│  │ 🔗 API Endpoints:                                                                       │  │
│  │   • /api/wallet/* (wallet management)                                                  │  │
│  │   • /api/transaction/* (transaction operations)                                        │  │
│  │   • /api/contract/* (contract operations)                                              │  │
│  │   • /api/node/* (node management)                                                      │  │
│  │   • /api/health (health check)                                                         │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            🎨 @conflux-devkit/dashboard                                      │
│                              Frontend Package                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Dependencies: @conflux-devkit/core: workspace:*, next: 14.2.0, react: ^18.3.0         │  │
│  │              react-dom: ^18.3.0, @mantine/*: ^8.3.1, @tabler/icons-react: ^3.35.0    │  │
│  │              @tanstack/react-query: ^5.51.0, @wagmi/*: ^2.0.0, wagmi: ^2.0.0          │  │
│  │              connectkit: ^1.7.0, viem: ^2.21.0, axios: ^1.7.0                        │  │
│  │ Status: ⚠️ PARTIALLY IMPLEMENTED (needs integration)                                   │  │
│  │                                                                                         │  │
│  │ 📦 Current Exports:                                                                     │  │
│  │   • Next.js App Router pages and components                                            │  │
│  │   • Mantine UI components                                                              │  │
│  │   • Mock API implementations                                                            │  │
│  │                                                                                         │  │
│  │ 🔄 Missing Implementation:                                                              │  │
│  │   • Real API integration with api-server                                               │  │
│  │   • Proper state management with React Query                                           │  │
│  │   • Blockchain integration with Wagmi                                                  │  │
│  │   • Component refactoring (split large components)                                     │  │
│  │                                                                                         │  │
│  │ 📋 Type Usage:                                                                          │  │
│  │   • Uses: Core types for UI state management                                           │  │
│  │   • Consumes: API endpoints from api-server (when implemented)                         │  │
│  │   • Implements: React components and hooks                                             │  │
│  │   • Integrates: Wagmi, Mantine, React Query                                            │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 📊 **Implementation Status Legend**

- ✅ **FULLY IMPLEMENTED**: Complete with all features, types, and integrations
- ⚠️ **PARTIALLY IMPLEMENTED**: Basic structure exists but needs integration/refactoring
- 🔄 **MISSING**: Not yet implemented or needs significant work

## 🔄 **Type Flow Summary**

```
Core Types (WalletInfo, NodeConfig, etc.)
    ↓
Blockchain Operations (WalletManager, TransactionManager, etc.)
    ↓
Node Management (NodeManager, HealthChecker, etc.)
    ↓
API Services (WalletService, TransactionService, etc.)
    ↓
UI Components (React components consuming API services)
```

## 🔗 **Key Dependencies**

1. **Core → All**: Provides foundation types and utilities
2. **Blockchain → Node-Manager, API-Server, Dashboard**: Implements blockchain operations
3. **Node-Manager → API-Server**: Provides node management capabilities
4. **API-Server → Dashboard**: Provides RESTful API endpoints
5. **Dashboard**: Consumes all services through API calls

## 📋 **Detailed Type and Interface Flow**

### **1. Core Types Flow**

```typescript
// Core package defines base types
export interface WalletInfo {
  index: number;
  address: `0x${string}`;
  privateKey: `0x${string}`;
  mnemonic?: string;
  balance?: bigint;
  isMining?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Blockchain package implements wallet operations
export class WalletManager {
  async generateWallet(
    mnemonic: string,
    index: number,
    network: NetworkConfig
  ): Promise<WalletInfo>;
  // Uses WalletInfo from core
}

// Node-manager uses wallet types for node operations
export class NodeManager {
  private wallets: Map<string, WalletInfo> = new Map();
  // Uses WalletInfo from core
}

// API-server exposes wallet operations
export class WalletService {
  async getAllWallets(): Promise<WalletInfo[]>;
  // Uses WalletInfo from core
}
```

### **2. Error Type Hierarchy Flow**

```typescript
// Core package defines base error types
export abstract class BaseError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;
}

export class ValidationError extends BaseError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;
}

// Blockchain package extends with blockchain-specific errors
export class WalletError extends BaseError {
  readonly code = 'WALLET_ERROR';
  readonly statusCode = 400;
}

// API-server uses all error types
export class WalletService {
  async createWallet() {
    try {
      // ... wallet creation logic
    } catch (error) {
      throw createWalletError('Failed to create wallet', { context });
    }
  }
}
```

### **3. RPC Interface Flow**

```typescript
// Core package defines RPC interfaces
export interface EvmClient {
  getBalance(params: { address: `0x${string}` }): Promise<bigint>;
  sendTransaction(params: SendTransactionParams): Promise<`0x${string}`>;
  readContract(params: ReadContractParams): Promise<unknown>;
  writeContract(params: WriteContractParams): Promise<`0x${string}`>;
  // ... other methods
}

// Blockchain package implements RPC clients
export class EvmClient implements IEvmClient {
  async getBalance(params: { address: `0x${string}` }): Promise<bigint> {
    // Implementation using viem
  }
}

// API-server uses RPC clients through services
export class TransactionService {
  private transactionManager: TransactionManager;

  async sendTransaction(
    transaction: TransactionRequest
  ): Promise<`0x${string}`> {
    return await this.transactionManager.sendEvmTransaction(
      transaction,
      network
    );
  }
}
```

### **4. API Response Flow**

```typescript
// Core package defines unified API response pattern
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

// API-server uses this pattern consistently
export function createApiResponse<T>(data: T, error?: string): ApiResponse<T> {
  if (error) {
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: error,
        timestamp: new Date(),
      },
    };
  }
  return {
    success: true,
    data,
    meta: {
      requestId: generateRequestId(),
      timestamp: new Date(),
      duration: 0,
      version: '1.0.0',
    },
  };
}

// Dashboard consumes API responses
const { data, error } = await fetch('/api/wallet').then(r => r.json());
// data is typed as WalletInfo[] | undefined
// error is typed as ApiError | undefined
```

## 🎯 **Next Steps for Complete Implementation**

### **High Priority (Immediate)**

1. **Dashboard Integration**: Update dashboard to use new package structure
2. **API Integration**: Replace mock APIs with real api-server endpoints
3. **State Management**: Implement proper React Query integration
4. **Component Refactoring**: Split large components into focused modules

### **Medium Priority (This Week)**

1. **Testing**: Add comprehensive tests for all packages
2. **Documentation**: Update documentation to reflect new architecture
3. **Migration**: Move existing code from old packages to new ones
4. **Cleanup**: Remove old packages and update workspace configuration

### **Low Priority (Next Week)**

1. **Performance**: Optimize build times and dependencies
2. **Monitoring**: Add performance monitoring and metrics
3. **Advanced Features**: Implement additional blockchain features
4. **Error Handling**: Enhance error handling and user feedback

---

_This comprehensive diagram shows the complete ideal package structure with implementation status, type flows, and clear next steps for achieving full integration._
