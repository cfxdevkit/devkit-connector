# Conflux DevKit Type Map

## Overview

This document maps all types in the Conflux DevKit workspace, showing their sources, dependencies, and usage patterns from the showcase webapp down to the core package.

## Type Hierarchy Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                SHOWCASE WEBAPP                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Entry Point: src/index.ts                                             │   │
│  │  - Imports: server from './server'                                     │   │
│  │  - Exports: server for testing                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              UI PRIMITIVES PACKAGE                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Core Types: src/types/ui.ts                                           │   │
│  │  - UIState, UIPreferences, NotificationState, ModalState               │   │
│  │  - ContractContextData, WalletContextData, NodeContextData             │   │
│  │  - UseContractsReturn, UseWalletsReturn, UseNodeReturn                 │   │
│  │  - Component Props: ContractCardProps, WalletCardProps, etc.           │   │
│  │                                                                         │   │
│  │  Imports from Core:                                                     │   │
│  │  - BrowserContractOrchestrator                                         │   │
│  │  - BrowserNetworkConfig                                                │   │
│  │  - BrowserNodeStatus                                                   │   │
│  │  - BrowserWalletInfo                                                   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                STATE PACKAGE                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Core Types: src/types/state.ts                                        │   │
│  │  - AppState, NodeState, WalletState, ContractState, NetworkState       │   │
│  │  - UIState, NotificationState, ModalState                             │   │
│  │  - AppActions, ContractCallParams, ContractCallResult                  │   │
│  │  - StoreConfig, StoreSelectors, StateEvents                           │   │
│  │  - IStateService, AbiFunction, AbiEvent, AbiConstructor               │   │
│  │                                                                         │   │
│  │  Imports from Core:                                                     │   │
│  │  - BrowserContractOrchestrator                                         │   │
│  │  - BrowserNetworkConfig                                                │   │
│  │  - BrowserNodeStatus                                                   │   │
│  │  - BrowserWalletInfo                                                   │   │
│  │  - NodeConfig                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              UI COMPONENTS PACKAGE                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Components: src/components/                                           │   │
│  │  - NetworkSelector.ts                                                  │   │
│  │  - ContractCard.ts                                                     │   │
│  │  - NodeStatus.ts                                                       │   │
│  │  - WalletCard.ts                                                       │   │
│  │                                                                         │   │
│  │  Imports from Core:                                                     │   │
│  │  - BrowserNetworkConfig                                                │   │
│  │  - BrowserContractOrchestrator                                         │   │
│  │  - BrowserNodeStatus                                                   │   │
│  │  - BrowserWalletInfo                                                   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BLOCKCHAIN PACKAGE                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Core Types: src/types/api.ts                                          │   │
│  │  - BlockchainApiResponse, ContractDeploymentApiResponse                │   │
│  │  - ContractCallApiResponse, TransactionSendApiResponse                 │   │
│  │  - WalletCreateApiResponse, NodeStatusApiResponse                     │   │
│  │  - NetworkInfoApiResponse, BlockInfoApiResponse                       │   │
│  │  - EventLogApiResponse, BlockchainApiError                            │   │
│  │                                                                         │   │
│  │  Imports from Core:                                                     │   │
│  │  - ApiError, ApiResponse, ResponseMeta                                 │   │
│  │  - ContractOrchestrator, NetworkConfig, WalletInfo                     │   │
│  │  - AbiItem, createContractError, createNetworkError                    │   │
│  │  - createWalletError, normalizeAddress                                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DEVKIT-NODE PACKAGE                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Core Types: src/types/unified.ts                                      │   │
│  │  - NodeStatus (extends CoreNodeStatus)                                 │   │
│  │  - WorkflowResult, ValidationResult, ExecutionResult                   │   │
│  │  - DeployOptions, TestOptions, TestResult                              │   │
│  │  - WorkflowCommandOptions, NodeCommandOptions                          │   │
│  │  - WorkflowEvents, INodeService, IWorkflowService                      │   │
│  │  - IWalletService, IContractService                                    │   │
│  │  - NodeError, WorkflowError, ValidationError                           │   │
│  │                                                                         │   │
│  │  Imports from Core:                                                     │   │
│  │  - NodeStatus, NodeConfig, WalletInfo                                  │   │
│  │  - ContractOrchestrator, TypedDeploymentResult                         │   │
│  │  - createNodeError, createDefaultXcfxConfig                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                CORE PACKAGE                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Type Modules: src/types/                                              │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  index.ts - Main export file                                   │   │   │
│  │  │  - Re-exports all types from organized modules                 │   │   │
│  │  │  - Legacy types for backward compatibility                     │   │   │
│  │  │  - WalletType, WalletConfig, DeploymentConfig                 │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  api.ts - API response types                                   │   │   │
│  │  │  - ApiResponse<T>, ApiError, ResponseMeta                      │   │   │
│  │  │  - BaseApiError, ValidationError, AuthenticationError         │   │   │
│  │  │  - AuthorizationError, NotFoundError, ConflictError            │   │   │
│  │  │  - RateLimitError, InternalServerError                         │   │   │
│  │  │  - ContractCallResult, ContractStatus, NetworkInfo             │   │   │
│  │  │  - CounterStatus, CounterOperation                             │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  blockchain.ts - Blockchain-specific types                     │   │   │
│  │  │  - WalletInfo, NetworkConfig, ContractInfo                     │   │   │
│  │  │  - AbiItem, AbiInput, AbiOutput                               │   │   │
│  │  │  - TransactionRequest, TransactionResponse                     │   │   │
│  │  │  - DeploymentResult, TestOptions, TestResult                   │   │   │
│  │  │  - Block, Log, TransactionReceipt, Transaction                 │   │   │
│  │  │  - ReadContractParams, WriteContractParams                     │   │   │
│  │  │  - SendTransactionParams, CoreTransactionRequest               │   │   │
│  │  │  - EvmTransactionRequest, ContractCallResult                   │   │   │
│  │  │  - UnifiedClient, EvmClient, CoreClient                        │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  contracts.ts - Contract artifact and deployment types         │   │   │
│  │  │  - ContractArtifact, ContractNetworkInfo                       │   │   │
│  │  │  - ContractDeploymentConfig, GeneratedContract                 │   │   │
│  │  │  - WagmiCodegenConfig, ContractCodegenConfig                   │   │   │
│  │  │  - ContractFactory, NetworkConfig                              │   │   │
│  │  │  - ContractDeploymentStatus, ContractDeploymentProgress        │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  contract-orchestration.ts - Contract orchestration types      │   │   │
│  │  │  - TypedDeploymentResult, ContractMethod, ContractEvent         │   │   │
│  │  │  - ContractMetadata, ContractOrchestrator                       │   │   │
│  │  │  - ContractRegistryEntry, ContractMethodCall                    │   │   │
│  │  │  - ContractMethodResult, ContractEventFilter                    │   │   │
│  │  │  - ContractEventLog, ContractInteractionSummary                 │   │   │
│  │  │  - ContractDeploymentSummary, ContractValidationResult          │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  node.ts - Node management types                               │   │   │
│  │  │  - NodeConfig, DEFAULT_NODE_CONFIG                             │   │   │
│  │  │  - NodeStatus                                                  │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  validation.ts - Validation types and schemas                  │   │   │
│  │  │  - WalletInput, TransactionInput, ContractInput                │   │   │
│  │  │  - NodeConfigInput, ValidationFieldError                       │   │   │
│  │  │  - ValidationResult, ValidationErrorCode                       │   │   │
│  │  │  - createValidationFieldError, createValidationResult           │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  browser-safe.ts - Browser-safe types for frontend             │   │   │
│  │  │  - BrowserWalletInfo, BrowserTransactionReceipt                │   │   │
│  │  │  - BrowserLog, BrowserBlock, BrowserTransaction                │   │   │
│  │  │  - BrowserContractCallResult, BrowserDeploymentResult          │   │   │
│  │  │  - BrowserNodeStatus, BrowserNetworkConfig                     │   │   │
│  │  │  - BrowserContractOrchestrator, BrowserSafe<T>                 │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  errors.ts - Error hierarchy and types                         │   │   │
│  │  │  - BaseError, DevKitError                                      │   │   │
│  │  │  - ConfigurationError, ContractError, DeploymentError          │   │   │
│  │  │  - InternalError, NetworkError, NodeError                      │   │   │
│  │  │  - NotFoundError, RateLimitError, ValidationError              │   │   │
│  │  │  - WalletError, AuthenticationError, AuthorizationError        │   │   │
│  │  │  - ConflictError, create*Error functions                       │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │  rpc.ts - RPC client interfaces                                │   │   │
│  │  │  - RPC client types and interfaces                             │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Type Flow Analysis

### 1. **Core Package (Foundation)**

The core package provides the foundational types that all other packages depend on:

- **Base Types**: `WalletInfo`, `NetworkConfig`, `NodeConfig`, `ContractInfo`
- **API Types**: `ApiResponse<T>`, `ApiError`, `ResponseMeta`
- **Blockchain Types**: `AbiItem`, `TransactionRequest`, `DeploymentResult`
- **Browser-Safe Types**: `BrowserWalletInfo`, `BrowserNodeStatus`, `BrowserContractOrchestrator`
- **Error Types**: Comprehensive error hierarchy with specific error classes
- **Validation Types**: Input validation and result types

### 2. **Blockchain Package**

Extends core types with blockchain-specific API responses:

- **API Response Types**: `BlockchainApiResponse<T>` extends `ApiResponse<T>`
- **Contract API**: `ContractDeploymentApiResponse`, `ContractCallApiResponse`
- **Transaction API**: `TransactionSendApiResponse`, `TransactionReceiptApiResponse`
- **Wallet API**: `WalletCreateApiResponse`, `WalletListApiResponse`
- **Node API**: `NodeStatusApiResponse`, `NodeStartApiResponse`
- **Network API**: `NetworkInfoApiResponse`, `NetworkSwitchApiResponse`

### 3. **DevKit-Node Package**

Provides unified interfaces for node operations:

- **Enhanced NodeStatus**: Extends core `NodeStatus` with lifecycle management
- **Workflow Types**: `WorkflowResult`, `ValidationResult`, `ExecutionResult`
- **Service Interfaces**: `INodeService`, `IWorkflowService`, `IWalletService`, `IContractService`
- **Command Types**: `WorkflowCommandOptions`, `NodeCommandOptions`
- **Error Types**: `NodeError`, `WorkflowError`, `ValidationError`

### 4. **State Package**

Manages application state with comprehensive state management:

- **State Types**: `AppState`, `NodeState`, `WalletState`, `ContractState`, `NetworkState`
- **Action Types**: `AppActions` with comprehensive action interfaces
- **Store Types**: `StoreConfig`, `StoreSelectors`, `StateEvents`
- **Service Types**: `IStateService` for state management
- **ABI Types**: `AbiFunction`, `AbiEvent`, `AbiConstructor`, `AbiParameter`

### 5. **UI Primitives Package**

Provides React hooks and UI state management:

- **UI State**: `UIState`, `UIPreferences`, `NotificationState`, `ModalState`
- **Context Data**: `ContractContextData`, `WalletContextData`, `NodeContextData`
- **Hook Returns**: `UseContractsReturn`, `UseWalletsReturn`, `UseNodeReturn`, `UseNetworkReturn`
- **Component Props**: `ContractCardProps`, `WalletCardProps`, `NodeStatusProps`
- **Configuration**: `UIPrimitivesConfig` with default values

### 6. **UI Components Package**

React components that consume UI primitives:

- **Components**: `NetworkSelector`, `ContractCard`, `NodeStatus`, `WalletCard`
- **Props**: All component props extend from UI primitives types
- **Imports**: Direct imports from core package for browser-safe types

### 7. **API Server Package**

Backend services that implement the API types:

- **Services**: `NodeService`, `WalletService`, `ContractService`, `TransactionService`
- **Routes**: API route handlers that return `ApiResponse<T>` types
- **Orchestration**: Service orchestration with state integration

## Key Type Patterns

### 1. **Browser-Safe Pattern**

- Core types use `bigint` and `0x${string}` for internal operations
- Browser-safe types convert these to `string` for frontend consumption
- `BrowserSafe<T>` utility type for automatic conversion

### 2. **API Response Pattern**

- All API responses extend `ApiResponse<T>` with consistent structure
- Blockchain-specific responses add network metadata
- Error responses follow consistent error hierarchy

### 3. **State Management Pattern**

- Centralized state types in state package
- Action interfaces for state mutations
- Event-driven architecture with typed events

### 4. **Service Interface Pattern**

- All services implement typed interfaces
- Consistent error handling with specific error types
- Configuration types for service setup

### 5. **Component Props Pattern**

- All UI components have typed props
- Props extend from context data types
- Consistent naming conventions

## Type Dependencies Summary

```
Core Package (Foundation)
├── API Types (api.ts)
├── Blockchain Types (blockchain.ts)
├── Contract Types (contracts.ts)
├── Contract Orchestration (contract-orchestration.ts)
├── Node Types (node.ts)
├── Validation Types (validation.ts)
├── Browser-Safe Types (browser-safe.ts)
├── Error Types (errors.ts)
└── RPC Types (rpc.ts)

Blockchain Package
├── Imports: ApiError, ApiResponse, ResponseMeta from Core
├── Imports: ContractOrchestrator, NetworkConfig, WalletInfo from Core
├── Imports: AbiItem, createContractError, createNetworkError from Core
└── Extends: BlockchainApiResponse<T> extends ApiResponse<T>

DevKit-Node Package
├── Imports: NodeStatus, NodeConfig, WalletInfo from Core
├── Imports: ContractOrchestrator, TypedDeploymentResult from Core
├── Imports: createNodeError, createDefaultXcfxConfig from Core
└── Extends: NodeStatus extends CoreNodeStatus

State Package
├── Imports: BrowserContractOrchestrator, BrowserNetworkConfig from Core
├── Imports: BrowserNodeStatus, BrowserWalletInfo from Core
├── Imports: NodeConfig from Core
└── Defines: AppState, AppActions, StoreConfig, StateEvents

UI Primitives Package
├── Imports: BrowserContractOrchestrator, BrowserNetworkConfig from Core
├── Imports: BrowserNodeStatus, BrowserWalletInfo from Core
└── Defines: UIState, Hook Returns, Component Props

UI Components Package
├── Imports: BrowserNetworkConfig, BrowserContractOrchestrator from Core
├── Imports: BrowserNodeStatus, BrowserWalletInfo from Core
└── Uses: Component Props from UI Primitives

API Server Package
├── Imports: NodeConfig, NodeStatus, WalletInfo from Core
├── Imports: ApiResponse, createInternalError from Core
├── Imports: BrowserContractOrchestrator, BrowserWalletInfo from Core
└── Implements: Service interfaces with typed responses
```

## Type Safety Features

1. **Strict TypeScript Configuration**: All packages use strict TypeScript settings
2. **Branded Types**: `0x${string}` for addresses, `bigint` for large numbers
3. **Discriminated Unions**: Error types with specific error codes
4. **Generic Types**: `ApiResponse<T>`, `BrowserSafe<T>` for type safety
5. **Interface Segregation**: Separate interfaces for different concerns
6. **Type Guards**: Runtime type checking functions
7. **Utility Types**: Helper types for common patterns

## Browser Compatibility

- **BigInt Conversion**: All `bigint` values converted to `string` for browser safety
- **Address Normalization**: Consistent address formatting across packages
- **JSON Serialization**: All complex types are JSON-serializable
- **Error Handling**: Browser-safe error messages and codes
- **Type Normalization**: Automatic conversion between internal and browser-safe types

This type map provides a comprehensive overview of how types flow through the Conflux DevKit workspace, ensuring type safety and consistency across all packages.
