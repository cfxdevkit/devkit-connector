// State service for managing Conflux DevKit state and providing API integration

import type { EventEmitter } from 'node:events';
import type {
  BrowserContractOrchestrator,
  BrowserWalletInfo,
  NodeConfig,
} from '@conflux-devkit/core';
import { realContractService } from '../services/RealContractService';
import { realWalletService } from '../services/RealWalletService';
import { getStateEventEmitter, useAppStore } from '../stores/appStore';
import type {
  AppState,
  AppStore,
  ContractCallParams,
  ContractCallState,
  IStateService,
  NotificationState,
  StateEvents,
  StoreConfig,
} from '../types/state';

// ============================================================================
// State Service Implementation
// ============================================================================

export class StateService implements IStateService {
  private store: typeof useAppStore;
  private eventEmitter: EventEmitter;
  private config: StoreConfig;
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private _isInitialized = false;

  constructor(config?: Partial<StoreConfig>) {
    this.store = useAppStore;
    this.eventEmitter = getStateEventEmitter();
    this.config = { ...config } as StoreConfig;
  }

  // ========================================================================
  // Store Management
  // ========================================================================

  getStore(): AppStore {
    return this.store;
  }

  getState(): AppState {
    return this.store.getState();
  }

  subscribe<T>(
    selector: (state: AppStore) => T,
    callback: (value: T) => void
  ): () => void {
    return useAppStore.subscribe(selector, callback);
  }

  // ========================================================================
  // Event Management
  // ========================================================================

  on<K extends keyof StateEvents>(
    event: K,
    callback: (...args: StateEvents[K]) => void
  ): void {
    this.eventEmitter.on(event, callback as (...args: any[]) => void);
  }

  off<K extends keyof StateEvents>(
    event: K,
    callback: (...args: StateEvents[K]) => void
  ): void {
    this.eventEmitter.off(event, callback as (...args: any[]) => void);
  }

  emit<K extends keyof StateEvents>(event: K, ...args: StateEvents[K]): void {
    this.eventEmitter.emit(event, ...args);
  }

  // ========================================================================
  // State Persistence
  // ========================================================================

  save(): void {
    // Zustand persist middleware handles this automatically
    // This method is here for explicit control if needed
    console.log('State saved to persistence layer');
  }

  load(): void {
    // Zustand persist middleware handles this automatically
    // This method is here for explicit control if needed
    console.log('State loaded from persistence layer');
  }

  clear(): void {
    this.store.reset();
    this.stopAllIntervals();
    console.log('State cleared');
  }

  // ========================================================================
  // Lifecycle Management
  // ========================================================================

  async initialize(config?: Partial<StoreConfig>): Promise<void> {
    if (this._isInitialized) {
      console.warn('StateService is already initialized');
      return;
    }

    this.config = { ...this.config, ...config };

    // Set up auto-refresh intervals
    this.setupAutoRefresh();

    // Set up event listeners
    this.setupEventListeners();

    this._isInitialized = true;
    console.log('StateService initialized');
  }

  isInitialized(): boolean {
    return this._isInitialized;
  }

  destroy(): void {
    this.stopAllIntervals();
    this.eventEmitter.removeAllListeners?.();
    this._isInitialized = false;
    console.log('StateService destroyed');
  }

  cleanup(): void {
    this.destroy();
  }

  // ========================================================================
  // Auto-refresh Setup
  // ========================================================================

  private setupAutoRefresh(): void {
    // Node status refresh
    if (this.config.nodeStatusInterval > 0) {
      const interval = setInterval(() => {
        if (this.store.isConnected && this.store.node.isRunning) {
          this.refreshNodeStatus();
        }
      }, this.config.nodeStatusInterval);
      this.intervals.set('nodeStatus', interval);
    }

    // Wallet balance refresh
    if (this.config.walletBalanceInterval > 0) {
      const interval = setInterval(() => {
        const activeWallet = this.store.wallets.activeWallet;
        if (activeWallet) {
          this.store.refreshWalletBalance(activeWallet.address);
        }
      }, this.config.walletBalanceInterval);
      this.intervals.set('walletBalance', interval);
    }

    // Contract events refresh
    if (this.config.contractEventsInterval > 0) {
      const interval = setInterval(() => {
        if (this.store.contracts.deployed.length > 0) {
          this.refreshContractEvents();
        }
      }, this.config.contractEventsInterval);
      this.intervals.set('contractEvents', interval);
    }
  }

  private stopAllIntervals(): void {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
  }

  // ========================================================================
  // Event Listeners Setup
  // ========================================================================

  private setupEventListeners(): void {
    // Connection events
    this.on('state:connected', () => {
      console.log('State: Connected to Conflux network');
      this.addNotification({
        type: 'success',
        title: 'Connected',
        message: 'Successfully connected to Conflux network',
      });
    });

    this.on('state:disconnected', () => {
      console.log('State: Disconnected from Conflux network');
      this.addNotification({
        type: 'info',
        title: 'Disconnected',
        message: 'Disconnected from Conflux network',
      });
    });

    // Node events
    this.on('state:node:started', status => {
      console.log('State: Node started', status);
      this.addNotification({
        type: 'success',
        title: 'Node Started',
        message: `Conflux node is running on port ${status.corePort}`,
      });
    });

    this.on('state:node:stopped', () => {
      console.log('State: Node stopped');
      this.addNotification({
        type: 'info',
        title: 'Node Stopped',
        message: 'Conflux node has been stopped',
      });
    });

    // Wallet events
    this.on('state:wallet:created', wallet => {
      console.log('State: Wallet created', wallet.address);
      this.addNotification({
        type: 'success',
        title: 'Wallet Created',
        message: `New wallet created: ${wallet.address.slice(0, 10)}...`,
      });
    });

    this.on('state:wallet:selected', wallet => {
      console.log('State: Wallet selected', wallet.address);
    });

    // Contract events
    this.on('state:contract:deployed', contract => {
      console.log('State: Contract deployed', contract.address);
      this.addNotification({
        type: 'success',
        title: 'Contract Deployed',
        message: `${contract.name} deployed at ${contract.address.slice(0, 10)}...`,
      });
    });

    this.on('state:contract:called', call => {
      console.log('State: Contract called', call.method);
    });

    this.on('state:contract:event', event => {
      console.log('State: Contract event', event.eventName);
    });

    // Network events
    this.on('state:network:switched', network => {
      console.log('State: Network switched', network.name);
      this.addNotification({
        type: 'info',
        title: 'Network Switched',
        message: `Switched to ${network.name}`,
      });
    });

    // Error events
    this.on('state:error', (type, message) => {
      console.error(`State Error [${type}]:`, message);
      this.addNotification({
        type: 'error',
        title: 'Error',
        message: `${type}: ${message}`,
      });
    });

    // Notification events
    this.on('state:notification', notification => {
      console.log('State: Notification', notification.title);
    });
  }

  // ========================================================================
  // Refresh Methods
  // ========================================================================

  private async refreshNodeStatus(): Promise<void> {
    try {
      // Real node status refresh
      // This would call the blockchain package to get real status
      console.log('Refreshing node status...');
    } catch (error) {
      console.error('Failed to refresh node status:', error);
    }
  }

  private async refreshContractEvents(): Promise<void> {
    try {
      // Real contract events refresh
      // This would call the blockchain package to get new events
      console.log('Refreshing contract events...');
    } catch (error) {
      console.error('Failed to refresh contract events:', error);
    }
  }

  // ========================================================================
  // Public API Methods
  // ========================================================================

  // Connection management
  async connect(config: Partial<NodeConfig>): Promise<void> {
    return this.store.connect(config);
  }

  async disconnect(): Promise<void> {
    return this.store.disconnect();
  }

  // Node management
  async startNode(config?: Partial<NodeConfig>): Promise<void> {
    return this.store.startNode(config);
  }

  async stopNode(): Promise<void> {
    return this.store.stopNode();
  }

  async restartNode(config?: Partial<NodeConfig>): Promise<void> {
    return this.store.restartNode(config);
  }

  // Wallet management
  async createWallet(mnemonic?: string): Promise<BrowserWalletInfo> {
    const wallet = await realWalletService.createWallet(mnemonic);
    this.store.createWallet(mnemonic);
    return wallet;
  }

  async importWallet(privateKey: string): Promise<BrowserWalletInfo> {
    return this.store.importWallet(privateKey);
  }

  selectWallet(address: string): void {
    this.store.selectWallet(address);
  }

  async refreshWalletBalance(address: string): Promise<void> {
    return this.store.refreshWalletBalance(address);
  }

  async getWallets(): Promise<BrowserWalletInfo[]> {
    const wallets = await realWalletService.getWallets();
    return wallets;
  }

  async removeWallet(address: string): Promise<boolean> {
    await realWalletService.removeWallet(address);
    this.store.getState().removeWallet(address);
    return true;
  }

  // Contract management
  async deployContract(
    contractName: string,
    bytecode: string,
    abi: any[],
    constructorArgs?: unknown[]
  ): Promise<BrowserContractOrchestrator> {
    // Call the real contract service
    const contract = await realContractService.deployContract(
      contractName,
      bytecode as `0x${string}`,
      abi,
      constructorArgs,
      '' // privateKey - placeholder
    );

    // Add to store
    this.store.getState().addContract(contract);

    return contract;
  }

  selectContract(address: string): void {
    this.store.selectContract(address);
  }

  async callContractMethod(
    params: ContractCallParams
  ): Promise<ContractCallState> {
    // Call the real contract service
    const result = await realContractService.callContract(
      params.contractAddress,
      params.method,
      params.args
    );

    // Create a contract call state
    const callState: ContractCallState = {
      id: `call_${Date.now()}`,
      contractAddress: params.contractAddress,
      method: params.method,
      methodName: params.method,
      args: params.args,
      result: result,
      error: null,
      timestamp: new Date(),
      status: 'success',
    };

    // Add to store
    this.store.contracts.contractCalls.push(callState);

    return callState;
  }

  async callContract(
    contractAddress: string,
    methodName: string,
    args?: unknown[]
  ): Promise<unknown> {
    // Call the real contract service
    const result = await realContractService.callContract(
      contractAddress,
      methodName,
      args || []
    );

    return result;
  }

  async getContracts(): Promise<BrowserContractOrchestrator[]> {
    const contracts = await realContractService.getContracts();
    return contracts;
  }

  subscribeToEvents(contractAddress: string, eventName?: string): void {
    this.store.subscribeToEvents(contractAddress, eventName);
  }

  unsubscribeFromEvents(contractAddress: string, eventName?: string): void {
    this.store.unsubscribeFromEvents(contractAddress, eventName);
  }

  // Network management
  async switchNetwork(networkId: string): Promise<void> {
    return this.store.switchNetwork(networkId);
  }

  // UI management
  toggleSidebar(): void {
    this.store.toggleSidebar();
  }

  setActiveTab(tab: string): void {
    this.store.setActiveTab(tab);
  }

  addNotification(
    notification: Omit<NotificationState, 'id' | 'timestamp'>
  ): void {
    this.store.addNotification(notification);
  }

  removeNotification(id: string): void {
    this.store.removeNotification(id);
  }

  openModal(type: string, props?: Record<string, unknown>): string {
    return this.store.openModal(type, props);
  }

  closeModal(id: string): void {
    this.store.closeModal(id);
  }

  setLoading(key: string, loading: boolean): void {
    this.store.setLoading(key, loading);
  }

  // Utility methods
  reset(): void {
    this.store.reset();
  }

  async refreshAll(): Promise<void> {
    return this.store.refreshAll();
  }

  // ========================================================================
  // State Getters (for API server)
  // ========================================================================

  getConnectionState() {
    return {
      isConnected: this.store.isConnected,
      isConnecting: this.store.isConnecting,
      error: this.store.connectionError,
    };
  }

  getNodeState() {
    return {
      status: this.store.node.status,
      isRunning: this.store.node.isRunning,
      isStarting: this.store.node.isStarting,
      isStopping: this.store.node.isStopping,
      error: this.store.node.error,
      uptime: this.store.node.uptime,
    };
  }

  getWalletState() {
    return {
      activeWallet: this.store.wallets.activeWallet,
      wallets: this.store.wallets.wallets,
      balance: this.store.wallets.balance,
      isCreating: this.store.wallets.isCreating,
      isImporting: this.store.wallets.isImporting,
      error: this.store.wallets.error,
    };
  }

  getContractState() {
    return {
      deployed: this.store.contracts.deployed,
      activeContract: this.store.contracts.activeContract,
      contractCalls: this.store.contracts.contractCalls,
      events: this.store.contracts.events,
      isDeploying: this.store.contracts.isDeploying,
      error: this.store.contracts.deploymentError,
    };
  }

  getNetworkState() {
    return {
      current: this.store.network.current,
      available: this.store.network.available,
      isSwitching: this.store.network.isSwitching,
      error: this.store.network.switchError,
    };
  }

  getUIState() {
    return {
      sidebarOpen: this.store.ui.sidebarOpen,
      activeTab: this.store.ui.activeTab,
      notifications: this.store.ui.notifications,
      modals: this.store.ui.modals,
      loading: this.store.ui.loading,
    };
  }

  // ========================================================================
  // API Server Integration
  // ========================================================================

  getStateForAPI() {
    return {
      connection: this.getConnectionState(),
      node: this.getNodeState(),
      wallets: this.getWalletState(),
      contracts: this.getContractState(),
      network: this.getNetworkState(),
      ui: this.getUIState(),
      timestamp: new Date().toISOString(),
    };
  }

  getContractDataForAPI(contractAddress: string) {
    const contract = this.store.contracts.deployed.find(
      c => c.address === contractAddress
    );
    if (!contract) {
      return null;
    }

    const calls = this.store.contracts.contractCalls.filter(
      c => c.contractAddress === contractAddress
    );
    const events = this.store.contracts.events.filter(
      e => e.contractAddress === contractAddress
    );

    return {
      contract,
      calls,
      events,
      isActive:
        this.store.contracts.activeContract?.address === contractAddress,
    };
  }

  getWalletDataForAPI(address: string) {
    const wallet = this.store.wallets.wallets.find(w => w.address === address);
    if (!wallet) {
      return null;
    }

    return {
      wallet,
      isActive: this.store.wallets.activeWallet?.address === address,
      balance: this.store.wallets.balance,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let stateServiceInstance: StateService | null = null;

export const getStateService = (
  config?: Partial<StoreConfig>
): StateService => {
  if (!stateServiceInstance) {
    stateServiceInstance = new StateService(config);
  }
  return stateServiceInstance;
};

export const destroyStateService = (): void => {
  if (stateServiceInstance) {
    stateServiceInstance.destroy();
    stateServiceInstance = null;
  }
};
