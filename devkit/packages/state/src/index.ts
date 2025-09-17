// Main exports for @conflux-devkit/state package

// ============================================================================
// Store Exports
// ============================================================================

export { useAppStore, getStateEventEmitter, selectors } from './stores/appStore';

// ============================================================================
// Service Exports
// ============================================================================

export { 
  StateService, 
  getStateService, 
  destroyStateService 
} from './services/StateService';

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Core State Types
  AppState,
  NodeState,
  WalletState,
  ContractState,
  ContractCallState,
  ContractEventState,
  NetworkState,
  UIState,
  NotificationState,
  NotificationAction,
  ModalState,
  
  // Store Actions
  AppActions,
  AppStore,
  
  // Contract Call Types
  ContractCallParams,
  ContractCallResult,
  
  // Store Configuration
  StoreConfig,
  
  // Store Selectors
  StoreSelectors,
  
  // Event Types
  StateEvents,
  
  // Service Interfaces
  IStateService,
  
  // Utility Types
  StateSlice,
  StateUpdater,
  StateListener,
  StateMiddleware,
} from './types/state';

// ============================================================================
// Re-export Core Types for Convenience
// ============================================================================

export type {
  NodeConfig,
  WalletInfo,
  NetworkConfig,
  ContractOrchestrator,
  TypedDeploymentResult,
  BrowserWalletInfo,
  BrowserContractOrchestrator,
  BrowserNodeStatus,
  BrowserNetworkConfig,
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
