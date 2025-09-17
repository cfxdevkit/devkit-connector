// Re-export core types from core package
export type {
  NodeConfig,
  NodeStatus,
  WalletInfo,
  DeploymentResult,
  TestOptions,
  TestResult,
  TransactionRequest,
  TransactionResponse,
  AbiItem,
} from '@conflux-devkit/core';

// Node-specific types that extend core types
export interface ExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
}

export interface DeployOptions {
  network?: string;
  port?: string;
  ethPort?: string;
}
