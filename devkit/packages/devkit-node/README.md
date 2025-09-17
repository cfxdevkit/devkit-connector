# @conflux-devkit/node

Unified node management and workflow orchestration for Conflux development.

## 🎯 Overview

The node package provides comprehensive node management including direct node operations, workflow orchestration, CLI tools, and service interfaces. It combines the functionality of both direct node management and high-level workflow orchestration.

## 📦 Features

- **Direct Node Operations** - Start/stop/restart Conflux nodes
- **Workflow Orchestration** - Complete development workflows
- **Wallet Management** - Create and manage wallets
- **Contract Operations** - Deploy and validate contracts
- **Health Monitoring** - Node status and health checks
- **CLI Interface** - Comprehensive command-line tools
- **Service Architecture** - Clean interfaces for all operations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              NODE PACKAGE                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NODE CORE     │    │   WORKFLOWS     │    │   CLI TOOLS     │
│                 │    │                 │    │                 │
│  • ConfluxNode  │    │  • NodeService  │    │  • UnifiedCLI   │
│  • NodeManager  │    │  • WorkflowMgr  │    │  • Commands     │
│  • NodeOps      │    │  • LifecycleMgr │    │  • Helpers      │
│  • NodeHealth   │    │  • ValidationMgr│    │  • Utilities    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    WALLETS      │    │   CONTRACTS     │    │   SERVICES      │
│                 │    │                 │    │                 │
│  • WalletMgr    │    │  • ContractDep  │    │  • INodeService │
│  • WalletOps    │    │  • ContractOps  │    │  • IWorkflowService│
│  • WalletFund   │    │  • ContractVal  │    │  • IWalletService│
│  • WalletVal    │    │  • ContractReg  │    │  • IContractService│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Usage

### CLI Commands

```bash
# Node Management
devkit-node start                    # Start a Conflux node
devkit-node stop                     # Stop the Conflux node
devkit-node restart                  # Restart the Conflux node
devkit-node status                   # Get node status

# Workflow Commands
devkit-node workflow                 # Run complete workflow
devkit-node workflow --dev           # Run in development mode
devkit-node workflow --network testnet # Run on testnet
devkit-node workflow --persistent    # Keep node running after workflow

# Deployment Commands
devkit-node deploy --contracts MyContract # Deploy specific contracts
devkit-node validate                 # Validate deployed contracts

# Test Commands
devkit-node test                     # Run tests
devkit-node test --verbose           # Verbose test output
```

### Programmatic Usage

```typescript
import { NodeService, ConfluxNode, WalletManager } from '@conflux-devkit/node';

// Create node service
const nodeService = new NodeService(config);

// Start node
await nodeService.start();

// Run workflow
const result = await nodeService.runCompleteWorkflow({
  network: 'local',
  contracts: ['MyContract'],
  persistent: false,
});

// Get status
const status = await nodeService.getStatus();
```

### Service Interfaces

```typescript
import {
  INodeService,
  IWorkflowService,
  IWalletService,
  IContractService,
} from '@conflux-devkit/node';

// Implement custom services
class CustomNodeService implements INodeService {
  async start(config?: Partial<NodeConfig>): Promise<void> {
    // Custom implementation
  }

  async stop(): Promise<void> {
    // Custom implementation
  }

  // ... other methods
}
```

## 📋 API Reference

### Core Classes

- `ConfluxNode` - Direct node lifecycle management
- `NodeManager` - Node management utilities
- `NodeService` - Main service class
- `WalletManager` - Wallet creation and management
- `ContractDeployer` - Contract deployment

### Service Interfaces

- `INodeService` - Node service interface
- `IWorkflowService` - Workflow service interface
- `IWalletService` - Wallet service interface
- `IContractService` - Contract service interface

### CLI Classes

- `UnifiedCLI` - Main CLI interface
- `WorkflowCommand` - Workflow command handler
- `NodeCommand` - Node command handler
- `DeployCommand` - Deploy command handler

### Types

- `NodeStatus` - Enhanced node status interface
- `WorkflowResult` - Workflow execution result
- `ValidationResult` - Contract validation result
- `ExecutionResult` - Generic execution result
- `WorkflowCommandOptions` - CLI workflow options
- `NodeCommandOptions` - CLI node options

## 🔧 Configuration

### Node Configuration

```typescript
import { createDefaultXcfxConfig } from '@conflux-devkit/node';

// Get default configuration
const config = createDefaultXcfxConfig();

// Customize configuration
const customConfig = {
  ...config,
  corePort: 12537,
  evmPort: 8545,
  chainId: 2029,
  evmChainId: 2030,
  network: 'local',
};
```

### Service Configuration

```typescript
import { NodeService } from '@conflux-devkit/node';

// Create service with custom configuration
const nodeService = new NodeService(
  config,
  {
    autoStart: true,
    healthCheckInterval: 5000,
    maxRetries: 3,
    timeout: 30000,
    logLevel: 'info',
  },
  {
    defaultNetwork: 'local',
    autoValidate: true,
    parallelDeployments: false,
    maxConcurrentDeployments: 3,
  }
);
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test
pnpm test -- --grep "NodeService"
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
