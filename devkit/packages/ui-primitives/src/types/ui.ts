// UI Primitives Types - Core types for React UI components

import type {
  BrowserContractOrchestrator,
  BrowserNetworkConfig,
  BrowserNodeStatus,
  BrowserWalletInfo,
} from '@conflux-devkit/core';

// ============================================================================
// UI State Types
// ============================================================================

export interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';

  // Layout
  sidebarOpen: boolean;
  sidebarWidth: number;
  activeTab: string;

  // Notifications
  notifications: NotificationState[];
  maxNotifications: number;

  // Modals
  modals: ModalState[];

  // Loading states
  loading: Record<string, boolean>;

  // UI preferences
  preferences: UIPreferences;
}

export interface UIPreferences {
  // Display
  showAdvancedOptions: boolean;
  showDebugInfo: boolean;
  compactMode: boolean;

  // Notifications
  enableNotifications: boolean;
  notificationDuration: number;
  enableSounds: boolean;

  // Data refresh
  autoRefresh: boolean;
  refreshInterval: number;

  // Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface NotificationState {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  description?: string;
  timestamp: string;
  duration?: number;
  persistent: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface ModalState {
  id: string;
  type: string;
  title?: string;
  props?: Record<string, unknown>;
  closable: boolean;
  size: 'small' | 'medium' | 'large' | 'fullscreen';
}

// ============================================================================
// Data Context Types
// ============================================================================

export interface ContractContextData {
  contracts: BrowserContractOrchestrator[];
  activeContract: BrowserContractOrchestrator | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface WalletContextData {
  wallets: BrowserWalletInfo[];
  activeWallet: BrowserWalletInfo | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface NodeContextData {
  status: BrowserNodeStatus | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface NetworkContextData {
  current: BrowserNetworkConfig | null;
  available: BrowserNetworkConfig[];
  isSwitching: boolean;
  error: string | null;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseContractsReturn extends ContractContextData {
  // Actions
  selectContract: (address: string) => void;
  deployContract: (name: string, args?: unknown[]) => Promise<void>;
  callMethod: (
    address: string,
    method: string,
    args?: unknown[]
  ) => Promise<void>;
  refreshContracts: () => Promise<void>;

  // Computed
  contractCount: number;
  hasActiveContract: boolean;
  contractsByNetwork: Record<string, BrowserContractOrchestrator[]>;
}

export interface UseWalletsReturn extends WalletContextData {
  // Actions
  selectWallet: (address: string) => void;
  createWallet: (mnemonic?: string) => Promise<void>;
  importWallet: (privateKey: string) => Promise<void>;
  refreshWallets: () => Promise<void>;

  // Computed
  walletCount: number;
  hasActiveWallet: boolean;
  totalBalance: string;
  walletsByNetwork: Record<string, BrowserWalletInfo[]>;
}

export interface UseNodeReturn extends NodeContextData {
  // Actions
  startNode: (config?: any) => Promise<void>;
  stopNode: () => Promise<void>;
  restartNode: (config?: any) => Promise<void>;
  refreshStatus: () => Promise<void>;

  // Computed
  isRunning: boolean;
  isStarting: boolean;
  isStopping: boolean;
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
}

export interface UseNetworkReturn extends NetworkContextData {
  // Actions
  switchNetwork: (networkId: string) => Promise<void>;
  refreshNetworks: () => Promise<void>;

  // Computed
  isLocal: boolean;
  isTestnet: boolean;
  isMainnet: boolean;
  networkName: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ContractCardProps {
  contract: BrowserContractOrchestrator;
  isActive?: boolean;
  onSelect?: (contract: BrowserContractOrchestrator) => void;
  onCall?: (contract: BrowserContractOrchestrator, method: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface WalletCardProps {
  wallet: BrowserWalletInfo;
  isActive?: boolean;
  onSelect?: (wallet: BrowserWalletInfo) => void;
  onRefresh?: (wallet: BrowserWalletInfo) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface NodeStatusProps {
  status: BrowserNodeStatus | null;
  isLoading?: boolean;
  onStart?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface NetworkSelectorProps {
  current: BrowserNetworkConfig | null;
  available: BrowserNetworkConfig[];
  onSwitch: (networkId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

// ============================================================================
// Event Types
// ============================================================================

export interface UIEvents {
  'ui:theme:changed': [theme: 'light' | 'dark' | 'system'];
  'ui:sidebar:toggled': [open: boolean];
  'ui:tab:changed': [tab: string];
  'ui:notification:added': [notification: NotificationState];
  'ui:notification:removed': [id: string];
  'ui:modal:opened': [modal: ModalState];
  'ui:modal:closed': [id: string];
  'ui:loading:started': [key: string];
  'ui:loading:finished': [key: string];
  'ui:error:occurred': [error: string, context?: string];
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface UIPrimitivesConfig {
  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;
  apiRetries: number;

  // State Configuration
  persistState: boolean;
  stateKey: string;

  // UI Configuration
  defaultTheme: 'light' | 'dark' | 'system';
  defaultSidebarOpen: boolean;
  defaultActiveTab: string;

  // Refresh Configuration
  autoRefresh: boolean;
  refreshInterval: number;

  // Notification Configuration
  maxNotifications: number;
  defaultNotificationDuration: number;

  // Error Handling
  showErrorNotifications: boolean;
  logErrors: boolean;
}

export const DEFAULT_UI_PRIMITIVES_CONFIG: UIPrimitivesConfig = {
  apiBaseUrl: 'http://localhost:3001',
  apiTimeout: 30000,
  apiRetries: 3,
  persistState: true,
  stateKey: 'conflux-devkit-ui',
  defaultTheme: 'system',
  defaultSidebarOpen: true,
  defaultActiveTab: 'dashboard',
  autoRefresh: true,
  refreshInterval: 5000,
  maxNotifications: 5,
  defaultNotificationDuration: 5000,
  showErrorNotifications: true,
  logErrors: true,
};

// ============================================================================
// Utility Types
// ============================================================================

export type UIStateSlice<T> = {
  [K in keyof T]: T[K];
};

export type UIStateListener<T> = (state: T, prevState: T) => void;

export type UIStateMiddleware = (
  state: UIState,
  action: string,
  ...args: unknown[]
) => UIState | undefined;

export type ComponentVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error';

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ComponentOrientation = 'horizontal' | 'vertical';
