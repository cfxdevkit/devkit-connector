// Main exports - Core functionality
export { ConfluxNode } from './ConfluxNode';
export { ContractDeployer } from './ContractDeployer';
export { NodeManager } from './NodeManager';
export { TestRunner } from './TestRunner';
export { WalletManager } from './WalletManager';

// Main exports - Operations
export {
  callContractMethod,
  deployContract,
  getBlockInfo,
  runCompleteDeploymentFlow,
  sendTransaction,
} from './ConfluxOperations';

// Main exports - Services
export { NodeService } from './services/NodeService';

// Main exports - CLI
export { UnifiedCLI } from './cli/unified';

// Type exports - Unified types
export type {
  // Core types
  NodeConfig,
  WalletInfo,
  NetworkConfig,
  ContractOrchestrator,
  TypedDeploymentResult,

  // Node types
  NodeStatus,
  WorkflowResult,
  ValidationResult,
  ExecutionResult,
  DeployOptions,
  TestOptions,
  TestResult,

  // Command types
  WorkflowCommandOptions,
  NodeCommandOptions,

  // Service interfaces
  INodeService,
  IWorkflowService,
  IWalletService,
  IContractService,

  // Configuration types
  NodeServiceConfig,
  WorkflowServiceConfig,

  // Error types
  NodeError,
  WorkflowError,
  ValidationError,

  // Utility types
  NodeEventCallback,
  ServiceFactory,
} from './types/unified';

// Legacy type exports for backward compatibility
export type { DeploymentResult } from './types';
