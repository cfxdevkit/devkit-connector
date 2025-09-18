// Main exports for @conflux-devkit/state package

// ============================================================================
// Store Exports
// ============================================================================

export {
  getStateEventEmitter,
  selectors,
  useAppStore,
} from './stores/appStore';

// ============================================================================
// Service Exports
// ============================================================================

export {
  destroyStateService,
  getStateService,
  StateService,
} from './services/StateService';

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Store Actions
  AppActions,
  // Core State Types
  AppState,
  AppStore,
  // Contract Call Types
  ContractCallParams,
  ContractCallResult,
  ContractCallState,
  ContractEventState,
  ContractState,
  // Service Interfaces
  IStateService,
  ModalState,
  NetworkState,
  NodeState,
  NotificationAction,
  NotificationState,
  // Event Types
  StateEvents,
  StateListener,
  StateMiddleware,
  // Utility Types
  StateSlice,
  StateUpdater,
  // Store Configuration
  StoreConfig,
  // Store Selectors
  StoreSelectors,
  UIState,
  WalletState,
} from './types/state';

// ============================================================================
// Re-export Core Types for Convenience
// ============================================================================

export type {
  BrowserContractOrchestrator,
  BrowserNetworkConfig,
  BrowserNodeStatus,
  BrowserWalletInfo,
  ContractOrchestrator,
  NetworkConfig,
  NodeConfig,
  TypedDeploymentResult,
  WalletInfo,
} from '@conflux-devkit/core';

// ============================================================================
// Default Configuration
// ============================================================================

export { DEFAULT_STORE_CONFIG } from './types/state';

// ============================================================================
// React Hooks (for future use)
// ============================================================================

// These will be implemented when we add React-specific functionality
// export { useConnection } from './hooks/useConnection';
// export { useNode } from './hooks/useNode';
// export { useWallets } from './hooks/useWallets';
// export { useContracts } from './hooks/useContracts';
// export { useNetwork } from './hooks/useNetwork';
// export { useUI } from './hooks/useUI';
