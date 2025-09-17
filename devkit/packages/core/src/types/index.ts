// Re-export all types from organized modules
export * from './blockchain';
// Re-export specific error types to avoid conflicts
export {
  AuthenticationError,
  AuthorizationError,
  BaseError,
  ConfigurationError,
  ConflictError,
  ContractError,
  createConfigurationError,
  createContractError,
  createDeploymentError,
  createInternalError,
  createNetworkError,
  createNodeError,
  createNotFoundError,
  createValidationError,
  createWalletError,
  DeploymentError,
  type DevKitError,
  InternalError,
  NetworkError,
  NodeError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  WalletError,
} from './errors';
export * from './node';
export * from './validation';

// Legacy types for backward compatibility (deprecated)
export type WalletType = 'mnemonic' | 'privateKey';

export interface WalletConfig {
  type: WalletType;
  value: string;
  index?: number;
}

// Import types for legacy compatibility
import type { ContractInfo, NetworkConfig } from './blockchain';

export interface DeploymentConfig {
  contracts: ContractInfo[];
  networks: NetworkConfig[];
}
