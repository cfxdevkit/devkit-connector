// State management types for Conflux DevKit

import type {
  BrowserContractOrchestrator,
  BrowserNetworkConfig,
  BrowserNodeStatus,
  BrowserWalletInfo,
  NodeConfig,
} from '@conflux-devkit/core';

// ============================================================================
// Core State Types
// ============================================================================

export interface AppState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  error: string | null;

  // Node state
  node: NodeState;

  // Wallet state
  wallets: WalletState;

  // Contract state
  contracts: ContractState;

  // Network state
  network: NetworkState;

  // UI state
  ui: UIState;
}

export interface NodeState {
  status: BrowserNodeStatus | null;
  isRunning: boolean;
  isStarting: boolean;
  isStopping: boolean;
  error: string | null;
  lastHealthCheck: Date | null;
  uptime: number;
}

export interface WalletState {
  activeWallet: BrowserWalletInfo | null;
  wallets: BrowserWalletInfo[];
  isCreating: boolean;
  isImporting: boolean;
  error: string | null;
  balance: string | null;
  isRefreshing: boolean;
}

export interface ContractState {
  deployed: BrowserContractOrchestrator[];
  isDeploying: boolean;
  deploymentError: string | null;
  activeContract: BrowserContractOrchestrator | null;
  contractCalls: ContractCallState[];
  events: ContractEventState[];
  error: string | null;
}

export interface ContractCallState {
  id: string;
  contractAddress: string;
  method: string;
  methodName: string;
  args: unknown[];
  result: unknown | null;
  error: string | null;
  status: 'pending' | 'success' | 'error';
  timestamp: Date;
  gasUsed?: string;
  transactionHash?: string;
}

export interface ContractEventState {
  id: string;
  contractAddress: string;
  eventName: string;
  data: Record<string, unknown>;
  blockNumber: string;
  transactionHash: string;
  timestamp: Date;
  topics: string[];
}

export interface NetworkState {
  current: BrowserNetworkConfig | null;
  available: BrowserNetworkConfig[];
  isSwitching: boolean;
  switchError: string | null;
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  activeTab: string;
  notifications: NotificationState[];
  modals: ModalState[];
  loading: Record<string, boolean>;
  error: string | null;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
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
// Store Actions
// ============================================================================

export interface AppActions {
  // Connection actions
  connect: (config: Partial<NodeConfig>) => Promise<void>;
  disconnect: () => Promise<void>;
  setConnectionError: (error: string | null) => void;

  // Node actions
  startNode: (config?: Partial<NodeConfig>) => Promise<void>;
  stopNode: () => Promise<void>;
  restartNode: (config?: Partial<NodeConfig>) => Promise<void>;
  updateNodeStatus: (status: BrowserNodeStatus) => void;
  setNodeError: (error: string | null) => void;

  // Wallet actions
  createWallet: (mnemonic?: string) => Promise<BrowserWalletInfo>;
  importWallet: (privateKey: string) => Promise<BrowserWalletInfo>;
  selectWallet: (address: string) => void;
  refreshWalletBalance: (address: string) => Promise<void>;
  setWalletError: (error: string | null) => void;
  removeWallet: (address: string) => void;

  // Contract actions
  deployContract: (
    contractName: string,
    args?: unknown[]
  ) => Promise<BrowserContractOrchestrator>;
  selectContract: (address: string) => void;
  callContractMethod: (
    params: ContractCallParams
  ) => Promise<ContractCallState>;
  subscribeToEvents: (contractAddress: string, eventName?: string) => void;
  unsubscribeFromEvents: (contractAddress: string, eventName?: string) => void;
  setContractError: (error: string | null) => void;
  addContract: (contract: BrowserContractOrchestrator) => void;

  // Network actions
  switchNetwork: (networkId: string) => Promise<void>;
  setNetworkError: (error: string | null) => void;

  // UI actions
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addNotification: (
    notification: Omit<NotificationState, 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;
  openModal: (type: string, props?: Record<string, unknown>) => string;
  closeModal: (id: string) => void;
  setLoading: (key: string, loading: boolean) => void;

  // Utility actions
  reset: () => void;
  refreshAll: () => Promise<void>;
}

// ============================================================================
// Contract Call Types
// ============================================================================

export interface ContractCallParams {
  contractAddress: string;
  method: string;
  args: unknown[];
  value?: string;
  gasLimit?: string;
  gasPrice?: string;
}

// Re-export ContractCallResult from core to ensure consistency
export type { ContractCallResult } from '@conflux-devkit/core';

// ============================================================================
// Store Configuration
// ============================================================================

export interface StoreConfig {
  // Persistence
  persist: boolean;
  persistKey: string;

  // Auto-refresh intervals (in ms)
  nodeStatusInterval: number;
  walletBalanceInterval: number;
  contractEventsInterval: number;

  // Error handling
  maxRetries: number;
  retryDelay: number;

  // UI defaults
  defaultNotificationDuration: number;
  maxNotifications: number;
}

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  persist: true,
  persistKey: 'conflux-devkit-state',
  nodeStatusInterval: 5000,
  walletBalanceInterval: 10000,
  contractEventsInterval: 2000,
  maxRetries: 3,
  retryDelay: 1000,
  defaultNotificationDuration: 5000,
  maxNotifications: 10,
};

// ============================================================================
// Store Selectors
// ============================================================================

export type AppStore = AppState & AppActions;

export interface StoreSelectors {
  // Connection selectors
  isConnected: (state: AppStore) => boolean;
  isConnecting: (state: AppStore) => boolean;
  connectionError: (state: AppStore) => string | null;

  // Node selectors
  nodeStatus: (state: AppStore) => BrowserNodeStatus | null;
  isNodeRunning: (state: AppStore) => boolean;
  nodeError: (state: AppStore) => string | null;

  // Wallet selectors
  activeWallet: (state: AppStore) => BrowserWalletInfo | null;
  wallets: (state: AppStore) => BrowserWalletInfo[];
  walletBalance: (state: AppStore) => string | null;
  walletError: (state: AppStore) => string | null;

  // Contract selectors
  deployedContracts: (state: AppStore) => BrowserContractOrchestrator[];
  activeContract: (state: AppStore) => BrowserContractOrchestrator | null;
  contractCalls: (state: AppStore) => ContractCallState[];
  contractEvents: (state: AppStore) => ContractEventState[];
  contractError: (state: AppStore) => string | null;

  // Network selectors
  currentNetwork: (state: AppStore) => BrowserNetworkConfig | null;
  availableNetworks: (state: AppStore) => BrowserNetworkConfig[];
  isNetworkSwitching: (state: AppStore) => boolean;
  networkError: (state: AppStore) => string | null;

  // UI selectors
  sidebarOpen: (state: AppStore) => boolean;
  activeTab: (state: AppStore) => string;
  notifications: (state: AppStore) => NotificationState[];
  modals: (state: AppStore) => ModalState[];
  isLoading: (state: AppStore) => (key: string) => boolean;
}

// ============================================================================
// Event Types
// ============================================================================

export interface StateEvents {
  'state:connected': [];
  'state:disconnected': [];
  'state:node:started': [BrowserNodeStatus];
  'state:node:stopped': [];
  'state:wallet:created': [BrowserWalletInfo];
  'state:wallet:selected': [BrowserWalletInfo];
  'state:contract:deployed': [BrowserContractOrchestrator];
  'state:contract:called': [ContractCallState];
  'state:contract:event': [ContractEventState];
  'state:network:switched': [BrowserNetworkConfig];
  'state:error': [string, string]; // [type, message]
  'state:notification': [NotificationState];
}

// ============================================================================
// Service Interfaces
// ============================================================================

export interface IStateService {
  // Store management
  getStore: () => ReturnType<typeof import('../stores/appStore').useAppStore>;
  subscribe: <T>(
    selector: (state: AppStore) => T,
    callback: (value: T) => void
  ) => () => void;

  // Event management
  on: <K extends keyof StateEvents>(
    event: K,
    callback: (...args: StateEvents[K]) => void
  ) => void;
  off: <K extends keyof StateEvents>(
    event: K,
    callback: (...args: StateEvents[K]) => void
  ) => void;
  emit: <K extends keyof StateEvents>(
    event: K,
    ...args: StateEvents[K]
  ) => void;

  // State persistence
  save: () => void;
  load: () => void;
  clear: () => void;

  // Lifecycle
  initialize: (config?: Partial<StoreConfig>) => Promise<void>;
  destroy: () => void;
}

// ============================================================================
// ABI and Contract Types - Re-exported from core
// ============================================================================

// Import and re-export ABI types from core to avoid duplication
import type { AbiItem } from '@conflux-devkit/core';
export type { AbiItem };

// Define ContractAbi as array of AbiItem for backward compatibility
export type ContractAbi = AbiItem[];

// Define specific ABI component types for backward compatibility
export interface AbiFunction {
  type: 'function';
  name: string;
  inputs: AbiParameter[];
  outputs: AbiParameter[];
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
}

export interface AbiEvent {
  type: 'event';
  name: string;
  inputs: AbiParameter[];
  anonymous: boolean;
}

export interface AbiConstructor {
  type: 'constructor';
  inputs: AbiParameter[];
  stateMutability: 'payable' | 'nonpayable';
}

export interface AbiParameter {
  name: string;
  type: string;
  indexed?: boolean;
  internalType?: string;
  components?: AbiParameter[];
}

export interface ContractDeploymentResult {
  address: string;
  transactionHash: string;
  gasUsed: string;
  contractName: string;
  abi: AbiItem[];
  bytecode: string;
}

// Browser-safe ContractCallResult for UI consumption
export interface BrowserContractCallResult {
  success: boolean;
  result?: unknown;
  error?: string;
  gasUsed?: string;
  transactionHash?: string;
}

export interface ContractInfo {
  address: string;
  name: string;
  abi: AbiItem[];
  bytecode?: string;
  deployedAt: Date;
  networkId: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type StateSlice<T> = T & Partial<AppActions>;

export type StateUpdater<T> = (state: T) => T;

export type StateListener<T> = (state: T, prevState: T) => void;

export type StateMiddleware = (
  state: AppState,
  action: string,
  ...args: unknown[]
) => AppState | undefined;
