// ============================================================================
// @conflux-devkit/state-ui
// UI state management for Conflux DevKit applications
// ============================================================================

// Types
export type {
  Theme,
  NotificationState,
  ModalState,
  UIState,
  UIActions,
  UIStore,
} from './types';

// Store
export { useUIStore, selectors } from './store';

// Hooks
export {
  useUIState,
  useTheme,
  useSidebar,
  useTabs,
  useNotifications,
  useModals,
  useLoading,
  useError,
} from './hooks';

// Default export
export { useUIStore as default } from './store';
