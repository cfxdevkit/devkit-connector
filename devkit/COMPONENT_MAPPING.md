# Component and Class Mapping

This document provides a comprehensive map of all components, classes, and utilities across the Conflux DevKit monorepo to ensure uniform access patterns.

## 📦 Package Overview

| Package                        | Status           | Main Purpose                           | Key Exports                                  |
| ------------------------------ | ---------------- | -------------------------------------- | -------------------------------------------- |
| **@conflux-devkit/core**       | ✅ Complete      | Foundation types, constants, utilities | Types, Constants, Schemas, Utils             |
| **@conflux-devkit/blockchain** | ⚠️ Needs Cleanup | Blockchain operations, RPC clients     | RPC Clients, Contract Management, Wallet Ops |
| **@conflux-devkit/node**       | ✅ Complete      | Node management, workflows             | Node Management, CLI, Workflows              |
| **@conflux-devkit/api-server** | 🔄 Partial       | Express API server                     | API Routes, Services, Middleware             |
| **@conflux-devkit/dashboard**  | 🔄 Partial       | Next.js UI dashboard                   | React Components, Pages, Services            |

---

## 🏗️ Core Package (`@conflux-devkit/core`)

### Types & Interfaces

```typescript
// Core Types
export type {
  NodeConfig, // Node configuration
  WalletInfo, // Wallet information
  NetworkConfig, // Network configuration
  TransactionRequest, // Transaction request
  TransactionReceipt, // Transaction receipt
  Block, // Block information
  ContractInfo, // Contract information
  AbiItem, // ABI item
  ContractCallResult, // Contract call result
  DeploymentResult, // Contract deployment result
  TypedDeploymentResult, // Typed deployment result
  ContractOrchestrator, // Contract orchestration
  ContractMethod, // Contract method
  ContractEvent, // Contract event
  ContractMethodCall, // Contract method call
  ContractMethodResult, // Contract method result
  ContractEventFilter, // Contract event filter
  ContractEventLog, // Contract event log
  ContractDeploymentConfig, // Contract deployment config
  GeneratedContract, // Generated contract
} from '@conflux-devkit/core';

// API Types
export type {
  ApiResponse, // Standard API response
  ApiError, // API error
  ResponseMeta, // Response metadata
  BaseApiError, // Base API error
  ValidationError, // Validation error
  AuthenticationError, // Authentication error
  AuthorizationError, // Authorization error
  NotFoundError, // Not found error
  ConflictError, // Conflict error
  RateLimitError, // Rate limit error
  InternalServerError, // Internal server error
  ServiceUnavailableError, // Service unavailable error
} from '@conflux-devkit/core';

// Browser-Safe Types
export type {
  BrowserWalletInfo, // Browser-safe wallet info
  BrowserTransactionReceipt, // Browser-safe transaction receipt
  BrowserBlock, // Browser-safe block
  BrowserTransaction, // Browser-safe transaction
  BrowserContractCallResult, // Browser-safe contract call result
  BrowserDeploymentResult, // Browser-safe deployment result
  BrowserNodeStatus, // Browser-safe node status
  BrowserNetworkConfig, // Browser-safe network config
  BrowserContractOrchestrator, // Browser-safe contract orchestrator
} from '@conflux-devkit/core';
```

### Constants

```typescript
// Network Constants
export {
  MAINNET_NETWORKS, // Mainnet network configs
  TESTNET_NETWORKS, // Testnet network configs
  LOCAL_NETWORKS, // Local network configs
  NETWORK_IDS, // Network ID mappings
  CHAIN_IDS, // Chain ID mappings
  RPC_URLS, // RPC URL mappings
} from '@conflux-devkit/core';

// Default Configurations
export {
  DEFAULT_NODE_CONFIG, // Default node configuration
  DEFAULT_WALLET_CONFIG, // Default wallet configuration
  DEFAULT_NETWORK_CONFIG, // Default network configuration
} from '@conflux-devkit/core';
```

### Utilities

```typescript
// API Utilities
export {
  createApiResponse, // Create API response
  createApiError, // Create API error
  createSuccessResponse, // Create success response
  createErrorResponse, // Create error response
  createHealthCheckResponse, // Create health check response
  createPaginatedResponse, // Create paginated response
  createResponseMeta, // Create response metadata
  generateRequestId, // Generate request ID
  handleApiError, // Handle API error
  isApiError, // Check if API error
  isApiResponse, // Check if API response
  isSuccessResponse, // Check if success response
  isErrorResponse, // Check if error response
  validateApiResponse, // Validate API response
  filterResponse, // Filter response
  mapResponse, // Map response
  transformResponse, // Transform response
} from '@conflux-devkit/core';

// Browser Conversion Utilities
export {
  toBrowserWalletInfo, // Convert to browser wallet info
  toBrowserTransactionReceipt, // Convert to browser transaction receipt
  toBrowserBlock, // Convert to browser block
  toBrowserTransaction, // Convert to browser transaction
  toBrowserContractCallResult, // Convert to browser contract call result
  toBrowserDeploymentResult, // Convert to browser deployment result
  toBrowserNodeStatus, // Convert to browser node status
  toBrowserNetworkConfig, // Convert to browser network config
  toBrowserContractOrchestrator, // Convert to browser contract orchestrator
  toBrowserSafe, // Generic browser-safe conversion
} from '@conflux-devkit/core';

// Type Normalization Utilities
export {
  normalizeAddress, // Normalize address
  normalizeBigInt, // Normalize bigint
  normalizeTxHash, // Normalize transaction hash
  normalizeBlockNumber, // Normalize block number
  toEvmAddress, // Convert to EVM address
  toCoreAddress, // Convert to Core address
  isCoreAddress, // Check if Core address
  normalizeBigIntFormatted, // Normalize bigint with formatting
  normalizeObject, // Normalize object
  createBrowserSafeObject, // Create browser-safe object
} from '@conflux-devkit/core';

// Network Utilities
export {
  getMainnetNetworks, // Get mainnet networks
  getTestnetNetworks, // Get testnet networks
  getNetworkByChainId, // Get network by chain ID
  getNetworkByEvmChainId, // Get network by EVM chain ID
  getNetworkByName, // Get network by name
  getNetworkDisplayName, // Get network display name
  isTestnet, // Check if testnet
  validateNetworkConfig, // Validate network config
} from '@conflux-devkit/core';
```

### Schemas

```typescript
// Zod Schemas
export {
  nodeConfigSchema, // Node config validation
  walletInfoSchema, // Wallet info validation
  networkConfigSchema, // Network config validation
  transactionRequestSchema, // Transaction request validation
  contractInfoSchema, // Contract info validation
} from '@conflux-devkit/core';
```

### Wallet Interface

```typescript
// Unified Wallet Interface
export {
  UnifiedWalletInterface, // Unified wallet interface
  createUnifiedWalletManager, // Create unified wallet manager
} from '@conflux-devkit/core';
```

---

## ⛓️ Blockchain Package (`@conflux-devkit/blockchain`)

### RPC Clients

```typescript
// RPC Client Classes
export {
  EvmClient, // EVM RPC client
  CoreClient, // Core RPC client
  RpcManager, // RPC manager
} from '@conflux-devkit/blockchain';

// RPC Client Interfaces
export type {
  EvmClient, // EVM client interface
  CoreClient, // Core client interface
  UnifiedClient, // Unified client interface
  ReadContractParams, // Read contract parameters
  WriteContractParams, // Write contract parameters
  SendTransactionParams, // Send transaction parameters
  CoreTransactionRequest, // Core transaction request
  TransactionRequest, // Transaction request
} from '@conflux-devkit/blockchain';
```

### Contract Management

```typescript
// Contract Classes
export {
  ContractManager, // Contract manager
  ContractFactory, // Contract factory
  ContractDeployer, // Contract deployer
  BrowserContractManager, // Browser contract manager
  BrowserContractWrapper, // Browser contract wrapper
} from '@conflux-devkit/blockchain';

// Contract Types
export type {
  ContractInfo, // Contract information
  ContractCallResult, // Contract call result
  BrowserContractWrapper, // Browser contract wrapper
} from '@conflux-devkit/blockchain';
```

### Wallet Operations

```typescript
// Wallet Classes
export {
  WalletManager, // Wallet manager
  WalletOperations, // Wallet operations
} from '@conflux-devkit/blockchain';
```

### Network Management

```typescript
// Network Classes
export {
  NetworkManager, // Network manager
} from '@conflux-devkit/blockchain';
```

### Transaction Management

```typescript
// Transaction Classes
export {
  TransactionManager, // Transaction manager
} from '@conflux-devkit/blockchain';
```

### API Types & Builders

```typescript
// Blockchain API Types
export type {
  BlockchainApiResponse, // Blockchain API response
  BlockchainApiError, // Blockchain API error
  ContractDeploymentApiResponse, // Contract deployment API response
  ContractCallApiResponse, // Contract call API response
  TransactionSendApiResponse, // Transaction send API response
  WalletCreateApiResponse, // Wallet create API response
  NodeStatusApiResponse, // Node status API response
  NetworkInfoApiResponse, // Network info API response
  BlockInfoApiResponse, // Block info API response
  EventLogsApiResponse, // Event logs API response
} from '@conflux-devkit/blockchain';

// API Builder Functions
export {
  createContractDeploymentApiResponse, // Create contract deployment API response
  createContractCallApiResponse, // Create contract call API response
  createTransactionSendApiResponse, // Create transaction send API response
  createWalletCreateApiResponse, // Create wallet create API response
  createNodeStatusApiResponse, // Create node status API response
  createNetworkInfoApiResponse, // Create network info API response
  createBlockInfoApiResponse, // Create block info API response
  createEventLogsApiResponse, // Create event logs API response
} from '@conflux-devkit/blockchain';
```

---

## 🖥️ Node Package (`@conflux-devkit/node`)

### Core Classes

```typescript
// Main Classes
export {
  ConfluxNode, // Conflux node manager
  ContractDeployer, // Contract deployer
  NodeManager, // Node manager
  TestRunner, // Test runner
  WalletManager, // Wallet manager
  NodeService, // Node service
  UnifiedCLI, // Unified CLI
} from '@conflux-devkit/node';
```

### Operations

```typescript
// Operation Functions
export {
  callContractMethod, // Call contract method
  deployContract, // Deploy contract
  getBlockInfo, // Get block info
  runCompleteDeploymentFlow, // Run complete deployment flow
  sendTransaction, // Send transaction
} from '@conflux-devkit/node';
```

### Types & Interfaces

```typescript
// Core Types
export type {
  NodeConfig, // Node configuration
  WalletInfo, // Wallet information
  NetworkConfig, // Network configuration
  ContractOrchestrator, // Contract orchestrator
  TypedDeploymentResult, // Typed deployment result
} from '@conflux-devkit/node';

// Node Types
export type {
  NodeStatus, // Node status
  WorkflowResult, // Workflow result
  ValidationResult, // Validation result
  ExecutionResult, // Execution result
  DeployOptions, // Deploy options
  TestOptions, // Test options
  TestResult, // Test result
} from '@conflux-devkit/node';

// Command Types
export type {
  WorkflowCommandOptions, // Workflow command options
  NodeCommandOptions, // Node command options
} from '@conflux-devkit/node';

// Service Interfaces
export type {
  INodeService, // Node service interface
  IWorkflowService, // Workflow service interface
  IWalletService, // Wallet service interface
  IContractService, // Contract service interface
} from '@conflux-devkit/node';

// Configuration Types
export type {
  NodeServiceConfig, // Node service configuration
  WorkflowServiceConfig, // Workflow service configuration
} from '@conflux-devkit/node';

// Error Types
export type {
  NodeError, // Node error
  WorkflowError, // Workflow error
  ValidationError, // Validation error
} from '@conflux-devkit/node';

// Utility Types
export type {
  NodeEventCallback, // Node event callback
  ServiceFactory, // Service factory
} from '@conflux-devkit/node';
```

---

## 🌐 API Server Package (`@conflux-devkit/api-server`)

### Server

```typescript
// Server Classes
export {
  ApiServer, // API server class
} from '@conflux-devkit/api-server';
```

### Services

```typescript
// Service Classes
export {
  WalletService, // Wallet service
  TransactionService, // Transaction service
  ContractService, // Contract service
  NodeService, // Node service
} from '@conflux-devkit/api-server';
```

### Utilities

```typescript
// Utility Functions
export {
  createSuccessResponse, // Create success response
  createErrorResponse, // Create error response
  handleApiError, // Handle API error
} from '@conflux-devkit/api-server';
```

---

## 🎨 Dashboard Package (`@conflux-devkit/dashboard`)

### Components (Planned)

```typescript
// UI Components
export {
  Navbar, // Navigation bar
  Sidebar, // Sidebar
  Dashboard, // Dashboard component
  WalletCard, // Wallet card
  ContractCard, // Contract card
  TransactionTable, // Transaction table
} from '@conflux-devkit/dashboard';
```

### Services (Planned)

```typescript
// Service Classes
export {
  ApiClient, // API client
  WalletService, // Wallet service
  NodeService, // Node service
  ContractService, // Contract service
} from '@conflux-devkit/dashboard';
```

### Pages (Planned)

```typescript
// Page Components
export {
  HomePage, // Home page
  WalletsPage, // Wallets page
  ContractsPage, // Contracts page
  TransactionsPage, // Transactions page
  NodePage, // Node page
  SettingsPage, // Settings page
} from '@conflux-devkit/dashboard';
```

---

## 🔄 Access Patterns

### 1. Core Package Access

```typescript
// Import everything from core
import * as Core from '@conflux-devkit/core';

// Or import specific items
import {
  NodeConfig,
  WalletInfo,
  createApiResponse,
  normalizeAddress,
} from '@conflux-devkit/core';
```

### 2. Blockchain Package Access

```typescript
// Import RPC clients
import { EvmClient, CoreClient } from '@conflux-devkit/blockchain';

// Import contract management
import { ContractManager, ContractFactory } from '@conflux-devkit/blockchain';

// Import wallet operations
import { WalletManager } from '@conflux-devkit/blockchain';
```

### 3. Node Package Access

```typescript
// Import node management
import { ConfluxNode, NodeService } from '@conflux-devkit/node';

// Import workflows
import { runCompleteDeploymentFlow } from '@conflux-devkit/node';

// Import CLI
import { UnifiedCLI } from '@conflux-devkit/node';
```

### 4. API Server Access

```typescript
// Import services
import { WalletService, ContractService } from '@conflux-devkit/api-server';

// Import utilities
import { createSuccessResponse } from '@conflux-devkit/api-server';
```

### 5. Dashboard Access

```typescript
// Import components
import { Dashboard, WalletCard } from '@conflux-devkit/dashboard';

// Import services
import { ApiClient } from '@conflux-devkit/dashboard';
```

---

## 🎯 Usage Guidelines

### 1. Always Import from Core First

```typescript
// ✅ Good - Import types from core
import { NodeConfig, WalletInfo } from '@conflux-devkit/core';
import { EvmClient } from '@conflux-devkit/blockchain';

// ❌ Avoid - Don't re-export types from other packages
import { NodeConfig } from '@conflux-devkit/blockchain'; // Wrong!
```

### 2. Use Specific Imports

```typescript
// ✅ Good - Specific imports
import { EvmClient, ContractManager } from '@conflux-devkit/blockchain';

// ❌ Avoid - Wildcard imports (unless necessary)
import * as Blockchain from '@conflux-devkit/blockchain';
```

### 3. Follow the Dependency Chain

```
Core → Blockchain → Node → API-Server/Dashboard
```

### 4. Use Type-Safe Patterns

```typescript
// ✅ Good - Use proper types
const config: NodeConfig = {
  /* ... */
};
const client = new EvmClient(config);

// ❌ Avoid - Using any types
const config: any = {
  /* ... */
};
```

---

## 📋 Status Summary

| Package                        | Status           | Errors | Warnings | Ready for Use |
| ------------------------------ | ---------------- | ------ | -------- | ------------- |
| **@conflux-devkit/core**       | ✅ Complete      | 0      | 14       | ✅ Yes        |
| **@conflux-devkit/blockchain** | ⚠️ Needs Cleanup | 44     | 83       | ⚠️ Partial    |
| **@conflux-devkit/node**       | ✅ Complete      | 0      | 0        | ✅ Yes        |
| **@conflux-devkit/api-server** | 🔄 Partial       | ?      | ?        | ⚠️ Partial    |
| **@conflux-devkit/dashboard**  | 🔄 Partial       | ?      | ?        | ⚠️ Partial    |

---

## 🚀 Next Steps

1. **Clean up blockchain package** - Fix 44 errors and 83 warnings
2. **Complete API server** - Finish implementation and testing
3. **Complete dashboard** - Finish UI components and integration
4. **Add comprehensive tests** - Unit and integration tests
5. **Documentation** - Complete API documentation
6. **Examples** - Create usage examples for each package

This mapping ensures consistent access patterns across the entire monorepo and provides a clear reference for developers.
