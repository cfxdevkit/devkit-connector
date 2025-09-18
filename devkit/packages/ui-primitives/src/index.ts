// UI Primitives - Main export file

// Re-export from state package for convenience
export { useAppStore } from '@conflux-devkit/state';

// Context
export {
  UIProvider,
  useLoading,
  useModals,
  useNotifications,
  useSidebar,
  useTheme,
  useUI,
} from './context/UIContext';

// Hooks
export {
  useContract,
  useContractDeployment,
  useContracts,
} from './hooks/useContracts';
export {
  useCurrentNetwork,
  useNetwork,
  useNetworkStatus,
  useNetworkSwitcher,
} from './hooks/useNetwork';
export {
  useNode,
  useNodeControls,
  useNodeMetrics,
  useNodeStatus,
} from './hooks/useNode';
export {
  useWallet,
  useWalletBalance,
  useWalletCreation,
  useWallets,
} from './hooks/useWallets';
// Types
export * from './types/ui';
