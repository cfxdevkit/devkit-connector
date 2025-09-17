// UI Primitives - Main export file

// Types
export * from './types/ui';

// Context
export {
  UIProvider,
  useUI,
  useTheme,
  useSidebar,
  useNotifications,
  useModals,
  useLoading,
} from './context/UIContext';

// Hooks
export {
  useContracts,
  useContract,
  useContractDeployment,
} from './hooks/useContracts';
export {
  useWallets,
  useWallet,
  useWalletCreation,
  useWalletBalance,
} from './hooks/useWallets';
export {
  useNode,
  useNodeStatus,
  useNodeControls,
  useNodeMetrics,
} from './hooks/useNode';
export {
  useNetwork,
  useCurrentNetwork,
  useNetworkSwitcher,
  useNetworkStatus,
} from './hooks/useNetwork';

// Re-export from state package for convenience
export { useAppStore } from '@conflux-devkit/state';
