// State service for managing Conflux DevKit state and providing API integration

// Browser-compatible EventEmitter type
type EventEmitter = {
  on(event: string, listener: Function): EventEmitter;
  off(event: string, listener: Function): EventEmitter;
  emit(event: string, ...args: any[]): boolean;
  removeAllListeners?(event?: string): EventEmitter;
};
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
  ContractAbi,
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

  getStore() {
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
    this.eventEmitter.on(event, callback as (...args: unknown[]) => void);
  }

  off<K extends keyof StateEvents>(
    event: K,
    callback: (...args: StateEvents[K]) => void
  ): void {
    this.eventEmitter.off(event, callback as (...args: unknown[]) => void);
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
    this.store.getState().reset();
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
        if (
          this.store.getState().isConnected &&
          this.store.getState().node.isRunning
        ) {
          this.refreshNodeStatus();
        }
      }, this.config.nodeStatusInterval);
      this.intervals.set('nodeStatus', interval);
    }

    // Wallet balance refresh
    if (this.config.walletBalanceInterval > 0) {
      const interval = setInterval(() => {
        const activeWallet = this.store.getState().wallets.activeWallet;
        if (activeWallet) {
          this.store.getState().refreshWalletBalance(activeWallet.address);
        }
      }, this.config.walletBalanceInterval);
      this.intervals.set('walletBalance', interval);
    }

    // Contract events refresh
    if (this.config.contractEventsInterval > 0) {
      const interval = setInterval(() => {
        if (this.store.getState().contracts.deployed.length > 0) {
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
        persistent: false,
      });
    });

    this.on('state:disconnected', () => {
      console.log('State: Disconnected from Conflux network');
      this.addNotification({
        type: 'info',
        title: 'Disconnected',
        message: 'Disconnected from Conflux network',
        persistent: false,
      });
    });

    // Node events
    this.on('state:node:started', (status) => {
      console.log('State: Node started', status);
      this.addNotification({
        type: 'success',
        title: 'Node Started',
        message: `Conflux node is running on port ${status.corePort}`,
        persistent: false,
      });
    });

    this.on('state:node:stopped', () => {
      console.log('State: Node stopped');
      this.addNotification({
        type: 'info',
        title: 'Node Stopped',
        message: 'Conflux node has been stopped',
        persistent: false,
      });
    });

    // Wallet events
    this.on('state:wallet:created', (wallet) => {
      console.log('State: Wallet created', wallet.address);
      this.addNotification({
        type: 'success',
        title: 'Wallet Created',
        message: `New wallet created: ${wallet.address.slice(0, 10)}...`,
        persistent: false,
      });
    });

    this.on('state:wallet:selected', (wallet) => {
      console.log('State: Wallet selected', wallet.address);
    });

    // Contract events
    this.on('state:contract:deployed', (contract) => {
      console.log('State: Contract deployed', contract.address);
      this.addNotification({
        type: 'success',
        title: 'Contract Deployed',
        message: `${contract.name} deployed at ${contract.address.slice(0, 10)}...`,
        persistent: false,
      });
    });

    this.on('state:contract:called', (call) => {
      console.log('State: Contract called', call.method);
    });

    this.on('state:contract:event', (event) => {
      console.log('State: Contract event', event.eventName);
    });

    // Network events
    this.on('state:network:switched', (network) => {
      console.log('State: Network switched', network.name);
      this.addNotification({
        type: 'info',
        title: 'Network Switched',
        message: `Switched to ${network.name}`,
        persistent: false,
      });
    });

    // Error events
    this.on('state:error', (type, message) => {
      console.error(`State Error [${type}]:`, message);
      this.addNotification({
        type: 'error',
        title: 'Error',
        message: `${type}: ${message}`,
        persistent: true,
      });
    });

    // Notification events
    this.on('state:notification', (notification) => {
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
    return this.store.getState().connect(config);
  }

  async disconnect(): Promise<void> {
    return this.store.getState().disconnect();
  }

  // Node management
  async startNode(config?: Partial<NodeConfig>): Promise<void> {
    return this.store.getState().startNode(config);
  }

  async stopNode(): Promise<void> {
    return this.store.getState().stopNode();
  }

  async restartNode(config?: Partial<NodeConfig>): Promise<void> {
    return this.store.getState().restartNode(config);
  }

  // Wallet management
  async createWallet(mnemonic?: string): Promise<BrowserWalletInfo> {
    const wallet = await realWalletService.createWallet(mnemonic);
    this.store.getState().createWallet(mnemonic);
    return wallet;
  }

  async importWallet(privateKey: string): Promise<BrowserWalletInfo> {
    return this.store.getState().importWallet(privateKey);
  }

  selectWallet(address: string): void {
    this.store.getState().selectWallet(address);
  }

  async refreshWalletBalance(address: string): Promise<void> {
    return this.store.getState().refreshWalletBalance(address);
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
    abi: ContractAbi,
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
    this.store.getState().selectContract(address);
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
    this.store.getState().contracts.contractCalls.push(callState);

    return callState;
  }

  async callContract(
    contractAddress: string,
    methodName: string,
    args?: unknown[]
  ): Promise<string | number | bigint | boolean | `0x${string}` | unknown[]> {
    // Call the real contract service
    const result = await realContractService.callContract(
      contractAddress,
      methodName,
      args || []
    );

    return result.result as
      | string
      | number
      | bigint
      | boolean
      | `0x${string}`
      | unknown[];
  }

  async getContracts(): Promise<BrowserContractOrchestrator[]> {
    // Get contracts from the real contract service
    const contracts = await realContractService.getContracts();
    // Convert to browser-safe format
    return contracts.map((contract) => ({
      name: contract.name,
      address: contract.address as `0x${string}`,
      abi: JSON.stringify(contract.abi),
      bytecode: contract.bytecode || '',
      deployedBytecode: '',
      chainType: 'evm' as const,
      networkId: '1',
      chainId: '1',
      evmChainId: '1',
      network: {
        name: 'Ethereum',
        rpcUrl: 'https://mainnet.infura.io/v3/your-key',
        chainId: '1',
        evmChainId: '1',
        currency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: '18',
        },
        isTestnet: false,
        networkType: 'evm' as const,
      },
      methods: {
        read: [],
        write: [],
        events: [],
      },
      capabilities: {
        read: true,
        write: true,
        events: true,
      },
    }));
  }

  subscribeToEvents(contractAddress: string, eventName?: string): void {
    this.store.getState().subscribeToEvents(contractAddress, eventName);
  }

  unsubscribeFromEvents(contractAddress: string, eventName?: string): void {
    this.store.getState().unsubscribeFromEvents(contractAddress, eventName);
  }

  // Network management
  async switchNetwork(networkId: string): Promise<void> {
    return this.store.getState().switchNetwork(networkId);
  }

  // UI management
  toggleSidebar(): void {
    this.store.getState().toggleSidebar();
  }

  setActiveTab(tab: string): void {
    this.store.getState().setActiveTab(tab);
  }

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.store.getState().setTheme(theme);
  }

  addNotification(
    notification: Omit<NotificationState, 'id' | 'timestamp'>
  ): void {
    this.store.getState().addNotification(notification);
  }

  removeNotification(id: string): void {
    this.store.getState().removeNotification(id);
  }

  openModal(type: string, props?: Record<string, unknown>): string {
    return this.store.getState().openModal(type, props);
  }

  closeModal(id: string): void {
    this.store.getState().closeModal(id);
  }

  setLoading(key: string, loading: boolean): void {
    this.store.getState().setLoading(key, loading);
  }

  // Utility methods
  reset(): void {
    this.store.getState().reset();
  }

  async refreshAll(): Promise<void> {
    return this.store.getState().refreshAll();
  }

  // ========================================================================
  // State Getters (for API server)
  // ========================================================================

  getConnectionState() {
    return {
      isConnected: this.store.getState().isConnected,
      isConnecting: this.store.getState().isConnecting,
      error: this.store.getState().connectionError,
    };
  }

  getNodeState() {
    return {
      status: this.store.getState().node.status,
      isRunning: this.store.getState().node.isRunning,
      isStarting: this.store.getState().node.isStarting,
      isStopping: this.store.getState().node.isStopping,
      error: this.store.getState().node.error,
      uptime: this.store.getState().node.uptime,
    };
  }

  getWalletState() {
    return {
      activeWallet: this.store.getState().wallets.activeWallet,
      wallets: this.store.getState().wallets.wallets,
      balance: this.store.getState().wallets.balance,
      isCreating: this.store.getState().wallets.isCreating,
      isImporting: this.store.getState().wallets.isImporting,
      error: this.store.getState().wallets.error,
    };
  }

  getContractState() {
    return {
      deployed: this.store.getState().contracts.deployed,
      activeContract: this.store.getState().contracts.activeContract,
      contractCalls: this.store.getState().contracts.contractCalls,
      events: this.store.getState().contracts.events,
      isDeploying: this.store.getState().contracts.isDeploying,
      deploymentError: this.store.getState().contracts.deploymentError,
      error: this.store.getState().contracts.error,
    };
  }

  getNetworkState() {
    return {
      current: this.store.getState().network.current,
      available: this.store.getState().network.available,
      isSwitching: this.store.getState().network.isSwitching,
      error: this.store.getState().network.switchError,
    };
  }

  getUIState() {
    return {
      sidebarOpen: this.store.getState().ui.sidebarOpen,
      activeTab: this.store.getState().ui.activeTab,
      notifications: this.store.getState().ui.notifications,
      modals: this.store.getState().ui.modals,
      loading: this.store.getState().ui.loading,
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
    const contract = this.store
      .getState()
      .contracts.deployed.find((c) => c.address === contractAddress);
    if (!contract) {
      return null;
    }

    const calls = this.store
      .getState()
      .contracts.contractCalls.filter(
        (c) => c.contractAddress === contractAddress
      );
    const events = this.store
      .getState()
      .contracts.events.filter((e) => e.contractAddress === contractAddress);

    return {
      contract,
      calls,
      events,
      isActive:
        this.store.getState().contracts.activeContract?.address ===
        contractAddress,
    };
  }

  getWalletDataForAPI(address: string) {
    const wallet = this.store
      .getState()
      .wallets.wallets.find((w) => w.address === address);
    if (!wallet) {
      return null;
    }

    return {
      wallet,
      isActive: this.store.getState().wallets.activeWallet?.address === address,
      balance: this.store.getState().wallets.balance,
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
