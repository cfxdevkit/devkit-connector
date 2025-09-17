// State Integration Service - Connects API server to state management
// This service acts as the bridge between the API server and the state store

import type {
  BrowserContractOrchestrator,
  BrowserNodeStatus,
  BrowserWalletInfo,
  BrowserNetworkConfig,
  NodeConfig,
} from '@conflux-devkit/core';

// Note: These types will be imported from @conflux-devkit/state when available
// For now, we'll define them locally
interface ContractCallParams {
  contractAddress: string;
  method: string;
  args?: unknown[];
  value?: bigint;
  from?: string;
}

interface ContractCallState {
  callId: string;
  contractAddress: string;
  method: string;
  args: unknown[];
  result: unknown;
  timestamp: string;
  error?: string;
}

interface NotificationState {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  description?: string;
  timestamp: string;
  duration?: number;
}

interface ModalState {
  id: string;
  type: string;
  props?: Record<string, unknown>;
}

interface StateService {
  connect: (config: Partial<NodeConfig>) => Promise<void>;
  disconnect: () => Promise<void>;
  startNode: (config?: Partial<NodeConfig>) => Promise<void>;
  stopNode: () => Promise<void>;
  restartNode: (config?: Partial<NodeConfig>) => Promise<void>;
  createWallet: (mnemonic?: string) => Promise<BrowserWalletInfo>;
  importWallet: (privateKey: string) => Promise<BrowserWalletInfo>;
  selectWallet: (address: string) => void;
  refreshWalletBalance: (address: string) => Promise<void>;
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
  switchNetwork: (networkId: string) => Promise<void>;
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  addNotification: (
    notification: Omit<NotificationState, 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;
  openModal: (type: string, props?: Record<string, unknown>) => string;
  closeModal: (id: string) => void;
  setLoading: (key: string, loading: boolean) => void;
  reset: () => void;
  refreshAll: () => Promise<void>;
  getStateForAPI: () => any;
  getContractDataForAPI: (contractAddress: string) => any;
  getWalletDataForAPI: (address: string) => any;
  getAllWalletsDataForAPI: () => BrowserWalletInfo[];
  getAllContractsDataForAPI: () => BrowserContractOrchestrator[];
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
  emit: (event: string, ...args: any[]) => void;
  getStore: () => any;
  getConnectionState: () => any;
  getNodeState: () => any;
  getWalletState: () => any;
  getContractState: () => any;
  getNetworkState: () => any;
  getUIState: () => any;
}

// Real state service integration
import { useAppStore } from '@conflux-devkit/state';

const getStateService = (): StateService => {
  const store = useAppStore.getState();

  return {
    connect: store.connect,
    disconnect: store.disconnect,
    startNode: store.startNode,
    stopNode: store.stopNode,
    restartNode: store.restartNode,
    createWallet: store.createWallet,
    importWallet: store.importWallet,
    selectWallet: store.selectWallet,
    refreshWalletBalance: store.refreshWalletBalance,
    deployContract: store.deployContract,
    selectContract: store.selectContract,
    callContractMethod: async (params: ContractCallParams) => {
      const result = await store.callContractMethod({
        ...params,
        args: params.args || [],
        value: params.value?.toString(),
      });
      return {
        callId: result.id,
        contractAddress: result.contractAddress,
        method: result.method,
        args: result.args,
        result: result.result,
        error: result.error || undefined,
        timestamp: result.timestamp.toISOString(),
        gasUsed: result.gasUsed,
        transactionHash: result.transactionHash,
      };
    },
    subscribeToEvents: store.subscribeToEvents,
    unsubscribeFromEvents: store.unsubscribeFromEvents,
    switchNetwork: store.switchNetwork,
    toggleSidebar: store.toggleSidebar,
    setActiveTab: store.setActiveTab,
    addNotification: (
      notification: Omit<NotificationState, 'id' | 'timestamp'>
    ) => {
      store.addNotification({
        ...notification,
        title: (notification as any).title || 'Notification',
      });
    },
    removeNotification: store.removeNotification,
    openModal: store.openModal,
    closeModal: store.closeModal,
    setLoading: store.setLoading,
    reset: store.reset,
    refreshAll: store.refreshAll,
    getStateForAPI: () => store,
    getContractDataForAPI: () => store.contracts,
    getWalletDataForAPI: () => store.wallets,
    getAllWalletsDataForAPI: () => store.wallets.wallets,
    getAllContractsDataForAPI: () => store.contracts.deployed,
    on: () => {},
    off: () => {},
    emit: () => {},
    getStore: () => store,
    getConnectionState: () => ({ isConnected: store.isConnected }),
    getNodeState: () => store.node,
    getWalletState: () => store.wallets,
    getContractState: () => store.contracts,
    getNetworkState: () => store.network,
    getUIState: () => store.ui,
  };
};

export class StateIntegrationService {
  private stateService: StateService;

  constructor() {
    this.stateService = getStateService();
  }

  // ========================================================================
  // Connection Management
  // ========================================================================

  async connect(config: Partial<NodeConfig>): Promise<void> {
    return this.stateService.connect(config);
  }

  async disconnect(): Promise<void> {
    return this.stateService.disconnect();
  }

  getConnectionState() {
    return this.stateService.getConnectionState();
  }

  // ========================================================================
  // Node Management
  // ========================================================================

  async startNode(config?: Partial<NodeConfig>): Promise<void> {
    return this.stateService.startNode(config);
  }

  async stopNode(): Promise<void> {
    return this.stateService.stopNode();
  }

  async restartNode(config?: Partial<NodeConfig>): Promise<void> {
    return this.stateService.restartNode(config);
  }

  getNodeState() {
    return this.stateService.getNodeState();
  }

  // ========================================================================
  // Wallet Management
  // ========================================================================

  async createWallet(mnemonic?: string): Promise<BrowserWalletInfo> {
    return this.stateService.createWallet(mnemonic);
  }

  async importWallet(privateKey: string): Promise<BrowserWalletInfo> {
    return this.stateService.importWallet(privateKey);
  }

  selectWallet(address: string): void {
    this.stateService.selectWallet(address);
  }

  async refreshWalletBalance(address: string): Promise<void> {
    return this.stateService.refreshWalletBalance(address);
  }

  getWalletState() {
    return this.stateService.getWalletState();
  }

  // ========================================================================
  // Contract Management
  // ========================================================================

  async deployContract(
    contractName: string,
    args?: unknown[]
  ): Promise<BrowserContractOrchestrator> {
    return this.stateService.deployContract(contractName, args);
  }

  selectContract(address: string): void {
    this.stateService.selectContract(address);
  }

  async callContractMethod(
    params: ContractCallParams
  ): Promise<ContractCallState> {
    return this.stateService.callContractMethod(params);
  }

  subscribeToEvents(contractAddress: string, eventName?: string): void {
    this.stateService.subscribeToEvents(contractAddress, eventName);
  }

  unsubscribeFromEvents(contractAddress: string, eventName?: string): void {
    this.stateService.unsubscribeFromEvents(contractAddress, eventName);
  }

  getContractState() {
    return this.stateService.getContractState();
  }

  // ========================================================================
  // Network Management
  // ========================================================================

  async switchNetwork(networkId: string): Promise<void> {
    return this.stateService.switchNetwork(networkId);
  }

  getNetworkState() {
    return this.stateService.getNetworkState();
  }

  // ========================================================================
  // UI Management
  // ========================================================================

  toggleSidebar(): void {
    this.stateService.toggleSidebar();
  }

  setActiveTab(tab: string): void {
    this.stateService.setActiveTab(tab);
  }

  addNotification(
    notification: Omit<NotificationState, 'id' | 'timestamp'>
  ): void {
    this.stateService.addNotification(notification);
  }

  removeNotification(id: string): void {
    this.stateService.removeNotification(id);
  }

  openModal(type: string, props?: Record<string, unknown>): string {
    return this.stateService.openModal(type, props);
  }

  closeModal(id: string): void {
    this.stateService.closeModal(id);
  }

  setLoading(key: string, loading: boolean): void {
    this.stateService.setLoading(key, loading);
  }

  getUIState() {
    return this.stateService.getUIState();
  }

  // ========================================================================
  // API-Specific Data Access
  // ========================================================================

  /**
   * Get complete state for API responses
   */
  getStateForAPI() {
    return this.stateService.getStateForAPI();
  }

  /**
   * Get contract data with calls and events for API
   */
  getContractDataForAPI(contractAddress: string) {
    return this.stateService.getContractDataForAPI(contractAddress);
  }

  /**
   * Get wallet data for API
   */
  getWalletDataForAPI(address: string) {
    return this.stateService.getWalletDataForAPI(address);
  }

  /**
   * Get all wallets data for API
   */
  getAllWalletsDataForAPI() {
    const walletState = this.getWalletState();
    return walletState.wallets;
  }

  /**
   * Get all contracts data for API
   */
  getAllContractsDataForAPI() {
    const contractState = this.getContractState();
    return contractState.deployed;
  }

  // ========================================================================
  // Event Management
  // ========================================================================

  on<K extends keyof any>(event: K, callback: (...args: any[]) => void): void {
    this.stateService.on(event as string, callback);
  }

  off<K extends keyof any>(event: K, callback: (...args: any[]) => void): void {
    this.stateService.off(event as string, callback);
  }

  emit<K extends keyof any>(event: K, ...args: any[]): void {
    this.stateService.emit(event as string, ...args);
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================

  reset(): void {
    this.stateService.reset();
  }

  async refreshAll(): Promise<void> {
    return this.stateService.refreshAll();
  }

  getStore() {
    return this.stateService.getStore();
  }
}

// Singleton instance
let stateIntegrationServiceInstance: StateIntegrationService | null = null;

export const getStateIntegrationService = (): StateIntegrationService => {
  if (!stateIntegrationServiceInstance) {
    stateIntegrationServiceInstance = new StateIntegrationService();
  }
  return stateIntegrationServiceInstance;
};
