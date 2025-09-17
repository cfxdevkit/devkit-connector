// Main Zustand store for Conflux DevKit state management

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { EventEmitter } from 'events';
import type {
  AppState,
  AppActions,
  AppStore,
  StoreConfig,
  DEFAULT_STORE_CONFIG,
  ContractCallParams,
  ContractCallState,
  NotificationState,
  ModalState,
  StateEvents,
} from '../types/state';
import type {
  NodeConfig,
  BrowserNodeStatus,
  BrowserWalletInfo,
  BrowserContractOrchestrator,
  BrowserNetworkConfig,
} from '@conflux-devkit/core';

// ============================================================================
// Event Emitter for State Events
// ============================================================================

class StateEventEmitter extends EventEmitter {
  emit<K extends keyof StateEvents>(event: K, ...args: StateEvents[K]): boolean {
    return super.emit(event as string, ...args);
  }

  on<K extends keyof StateEvents>(event: K, listener: (...args: StateEvents[K]) => void): this {
    return super.on(event as string, listener as (...args: any[]) => void);
  }

  off<K extends keyof StateEvents>(event: K, listener: (...args: StateEvents[K]) => void): this {
    return super.off(event as string, listener as (...args: any[]) => void);
  }
}

const stateEventEmitter = new StateEventEmitter();

// ============================================================================
// Initial State
// ============================================================================

const initialState: AppState = {
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  
  node: {
    status: null,
    isRunning: false,
    isStarting: false,
    isStopping: false,
    error: null,
    lastHealthCheck: null,
    uptime: 0,
  },
  
  wallets: {
    activeWallet: null,
    wallets: [],
    isCreating: false,
    isImporting: false,
    error: null,
    balance: null,
    isRefreshing: false,
  },
  
  contracts: {
    deployed: [],
    isDeploying: false,
    deploymentError: null,
    activeContract: null,
    contractCalls: [],
    events: [],
  },
  
  network: {
    current: null,
    available: [],
    isSwitching: false,
    switchError: null,
  },
  
  ui: {
    sidebarOpen: true,
    activeTab: 'dashboard',
    notifications: [],
    modals: [],
    loading: {},
  },
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useAppStore = create<AppStore>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // ====================================================================
        // Connection Actions
        // ====================================================================
        
        connect: async (config: Partial<NodeConfig>) => {
          set((state) => {
            state.isConnecting = true;
            state.connectionError = null;
          });
          
          try {
            // TODO: Implement actual connection logic
            // This would use the blockchain package to establish connection
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
            
            set((state) => {
              state.isConnected = true;
              state.isConnecting = false;
            });
            
            stateEventEmitter.emit('state:connected');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Connection failed';
            set((state) => {
              state.isConnected = false;
              state.isConnecting = false;
              state.connectionError = errorMessage;
            });
            stateEventEmitter.emit('state:error', 'connection', errorMessage);
          }
        },
        
        disconnect: async () => {
          set((state) => {
            state.isConnected = false;
            state.isConnecting = false;
            state.connectionError = null;
            state.node.isRunning = false;
            state.wallets.activeWallet = null;
            state.wallets.wallets = [];
            state.contracts.deployed = [];
            state.contracts.activeContract = null;
          });
          
          stateEventEmitter.emit('state:disconnected');
        },
        
        setConnectionError: (error: string | null) => {
          set((state) => {
            state.connectionError = error;
          });
        },
        
        // ====================================================================
        // Node Actions
        // ====================================================================
        
        startNode: async (config?: Partial<NodeConfig>) => {
          set((state) => {
            state.node.isStarting = true;
            state.node.error = null;
          });
          
          try {
            // TODO: Implement actual node start logic
            await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
            
            const mockStatus: BrowserNodeStatus = {
              running: true,
              corePort: config?.corePort || 12537,
              evmPort: config?.evmPort || 8545,
              chainId: config?.chainId || 2029,
              evmChainId: config?.evmChainId || 2030,
              blockNumber: '0',
              peerCount: 0,
              walletMode: 'mnemonic',
              wallets: [],
              isRunning: true,
              health: 'healthy',
              startTime: new Date().toISOString(),
              uptime: 0,
              lastHealthCheck: new Date().toISOString(),
            };
            
            set((state) => {
              state.node.status = mockStatus;
              state.node.isRunning = true;
              state.node.isStarting = false;
              state.node.lastHealthCheck = new Date();
            });
            
            stateEventEmitter.emit('state:node:started', mockStatus);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to start node';
            set((state) => {
              state.node.error = errorMessage;
              state.node.isStarting = false;
            });
            stateEventEmitter.emit('state:error', 'node', errorMessage);
          }
        },
        
        stopNode: async () => {
          set((state) => {
            state.node.isStopping = true;
          });
          
          try {
            // TODO: Implement actual node stop logic
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
            
            set((state) => {
              state.node.isRunning = false;
              state.node.isStopping = false;
              state.node.status = null;
            });
            
            stateEventEmitter.emit('state:node:stopped');
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to stop node';
            set((state) => {
              state.node.error = errorMessage;
              state.node.isStopping = false;
            });
            stateEventEmitter.emit('state:error', 'node', errorMessage);
          }
        },
        
        restartNode: async (config?: Partial<NodeConfig>) => {
          const { stopNode, startNode } = get();
          await stopNode();
          await startNode(config);
        },
        
        updateNodeStatus: (status: BrowserNodeStatus) => {
          set((state) => {
            state.node.status = status;
            state.node.lastHealthCheck = new Date();
            state.node.uptime = status.uptime || 0;
          });
        },
        
        setNodeError: (error: string | null) => {
          set((state) => {
            state.node.error = error;
          });
        },
        
        // ====================================================================
        // Wallet Actions
        // ====================================================================
        
        createWallet: async (mnemonic?: string): Promise<BrowserWalletInfo> => {
          set((state) => {
            state.wallets.isCreating = true;
            state.wallets.error = null;
          });
          
          try {
            // TODO: Implement actual wallet creation logic
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
            
            const mockWallet: BrowserWalletInfo = {
              address: `0x${Math.random().toString(16).substring(2, 42)}`,
              privateKey: `0x${Math.random().toString(16).substring(2, 66)}`,
              mnemonic: mnemonic || 'mock mnemonic phrase for testing purposes only',
              index: get().wallets.wallets.length,
              balance: '0',
              network: 'local',
              createdAt: new Date().toISOString(),
            };
            
            set((state) => {
              state.wallets.wallets.push(mockWallet);
              state.wallets.isCreating = false;
            });
            
            stateEventEmitter.emit('state:wallet:created', mockWallet);
            return mockWallet;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create wallet';
            set((state) => {
              state.wallets.error = errorMessage;
              state.wallets.isCreating = false;
            });
            stateEventEmitter.emit('state:error', 'wallet', errorMessage);
            throw error;
          }
        },
        
        importWallet: async (privateKey: string): Promise<BrowserWalletInfo> => {
          set((state) => {
            state.wallets.isImporting = true;
            state.wallets.error = null;
          });
          
          try {
            // TODO: Implement actual wallet import logic
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
            
            const mockWallet: BrowserWalletInfo = {
              address: `0x${Math.random().toString(16).substring(2, 42)}`,
              privateKey,
              mnemonic: '',
              index: get().wallets.wallets.length,
              balance: '0',
              network: 'local',
              createdAt: new Date().toISOString(),
            };
            
            set((state) => {
              state.wallets.wallets.push(mockWallet);
              state.wallets.isImporting = false;
            });
            
            stateEventEmitter.emit('state:wallet:created', mockWallet);
            return mockWallet;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to import wallet';
            set((state) => {
              state.wallets.error = errorMessage;
              state.wallets.isImporting = false;
            });
            stateEventEmitter.emit('state:error', 'wallet', errorMessage);
            throw error;
          }
        },
        
        selectWallet: (address: string) => {
          const wallet = get().wallets.wallets.find(w => w.address === address);
          if (wallet) {
            set((state) => {
              state.wallets.activeWallet = wallet;
            });
            stateEventEmitter.emit('state:wallet:selected', wallet);
          }
        },
        
        refreshWalletBalance: async (address: string) => {
          set((state) => {
            state.wallets.isRefreshing = true;
          });
          
          try {
            // TODO: Implement actual balance refresh logic
            await new Promise(resolve => setTimeout(resolve, 500)); // Mock delay
            
            const mockBalance = (Math.random() * 100).toFixed(4);
            set((state) => {
              state.wallets.balance = mockBalance;
              state.wallets.isRefreshing = false;
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to refresh balance';
            set((state) => {
              state.wallets.error = errorMessage;
              state.wallets.isRefreshing = false;
            });
            stateEventEmitter.emit('state:error', 'wallet', errorMessage);
          }
        },
        
        setWalletError: (error: string | null) => {
          set((state) => {
            state.wallets.error = error;
          });
        },
        
        // ====================================================================
        // Contract Actions
        // ====================================================================
        
        deployContract: async (contractName: string, args: unknown[] = []): Promise<BrowserContractOrchestrator> => {
          set((state) => {
            state.contracts.isDeploying = true;
            state.contracts.deploymentError = null;
          });
          
          try {
            // TODO: Implement actual contract deployment logic
            await new Promise(resolve => setTimeout(resolve, 3000)); // Mock delay
            
            const mockContract: BrowserContractOrchestrator = {
              contractName,
              address: `0x${Math.random().toString(16).substring(2, 42)}`,
              abi: [],
              bytecode: `0x${Math.random().toString(16).substring(2, 100)}`,
              deployedBytecode: `0x${Math.random().toString(16).substring(2, 100)}`,
              transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
              blockNumber: '1',
              blockHash: `0x${Math.random().toString(16).substring(2, 66)}`,
              gasUsed: '1000000',
              gasPrice: '1000000000',
              deployedAt: new Date().toISOString(),
              network: 'local',
              networkId: '1',
              chainId: '2029',
              evmChainId: '2030',
              chainType: 'evm',
              typesGenerated: false,
              methods: {
                read: [],
                write: [],
                events: [],
                constructor: null,
              },
            };
            
            set((state) => {
              state.contracts.deployed.push(mockContract);
              state.contracts.isDeploying = false;
            });
            
            stateEventEmitter.emit('state:contract:deployed', mockContract);
            return mockContract;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to deploy contract';
            set((state) => {
              state.contracts.deploymentError = errorMessage;
              state.contracts.isDeploying = false;
            });
            stateEventEmitter.emit('state:error', 'contract', errorMessage);
            throw error;
          }
        },
        
        selectContract: (address: string) => {
          const contract = get().contracts.deployed.find(c => c.address === address);
          if (contract) {
            set((state) => {
              state.contracts.activeContract = contract;
            });
          }
        },
        
        callContractMethod: async (params: ContractCallParams): Promise<ContractCallState> => {
          const callId = `call_${Date.now()}_${Math.random().toString(16).substring(2, 8)}`;
          
          const callState: ContractCallState = {
            id: callId,
            contractAddress: params.contractAddress,
            method: params.method,
            args: params.args,
            result: null,
            error: null,
            status: 'pending',
            timestamp: new Date(),
          };
          
          set((state) => {
            state.contracts.contractCalls.push(callState);
          });
          
          try {
            // TODO: Implement actual contract call logic
            await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
            
            const mockResult = {
              success: true,
              data: `Mock result for ${params.method}`,
              gasUsed: '50000',
              transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
            };
            
            set((state) => {
              const call = state.contracts.contractCalls.find(c => c.id === callId);
              if (call) {
                call.status = 'success';
                call.result = mockResult;
                call.gasUsed = mockResult.gasUsed;
                call.transactionHash = mockResult.transactionHash;
              }
            });
            
            stateEventEmitter.emit('state:contract:called', callState);
            return callState;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Contract call failed';
            set((state) => {
              const call = state.contracts.contractCalls.find(c => c.id === callId);
              if (call) {
                call.status = 'error';
                call.error = errorMessage;
              }
            });
            stateEventEmitter.emit('state:error', 'contract', errorMessage);
            return callState;
          }
        },
        
        subscribeToEvents: (contractAddress: string, eventName?: string) => {
          // TODO: Implement actual event subscription logic
          console.log(`Subscribing to events for contract ${contractAddress}${eventName ? `, event: ${eventName}` : ''}`);
        },
        
        unsubscribeFromEvents: (contractAddress: string, eventName?: string) => {
          // TODO: Implement actual event unsubscription logic
          console.log(`Unsubscribing from events for contract ${contractAddress}${eventName ? `, event: ${eventName}` : ''}`);
        },
        
        setContractError: (error: string | null) => {
          set((state) => {
            state.contracts.deploymentError = error;
          });
        },
        
        // ====================================================================
        // Network Actions
        // ====================================================================
        
        switchNetwork: async (networkId: string) => {
          set((state) => {
            state.network.isSwitching = true;
            state.network.switchError = null;
          });
          
          try {
            // TODO: Implement actual network switching logic
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
            
            const mockNetwork: BrowserNetworkConfig = {
              name: 'Local Network',
              chainId: '2029',
              evmChainId: '2030',
              rpcUrl: 'http://localhost:12537',
              evmRpcUrl: 'http://localhost:8545',
              explorerUrl: 'http://localhost:3000',
              isTestnet: true,
              isLocal: true,
            };
            
            set((state) => {
              state.network.current = mockNetwork;
              state.network.isSwitching = false;
            });
            
            stateEventEmitter.emit('state:network:switched', mockNetwork);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to switch network';
            set((state) => {
              state.network.switchError = errorMessage;
              state.network.isSwitching = false;
            });
            stateEventEmitter.emit('state:error', 'network', errorMessage);
          }
        },
        
        setNetworkError: (error: string | null) => {
          set((state) => {
            state.network.switchError = error;
          });
        },
        
        // ====================================================================
        // UI Actions
        // ====================================================================
        
        toggleSidebar: () => {
          set((state) => {
            state.ui.sidebarOpen = !state.ui.sidebarOpen;
          });
        },
        
        setActiveTab: (tab: string) => {
          set((state) => {
            state.ui.activeTab = tab;
          });
        },
        
        addNotification: (notification: Omit<NotificationState, 'id' | 'timestamp'>) => {
          const id = `notif_${Date.now()}_${Math.random().toString(16).substring(2, 8)}`;
          const fullNotification: NotificationState = {
            ...notification,
            id,
            timestamp: new Date(),
          };
          
          set((state) => {
            state.ui.notifications.push(fullNotification);
            
            // Remove old notifications if we exceed the limit
            if (state.ui.notifications.length > 10) {
              state.ui.notifications = state.ui.notifications.slice(-10);
            }
          });
          
          stateEventEmitter.emit('state:notification', fullNotification);
          
          // Auto-remove notification after duration
          if (fullNotification.duration) {
            setTimeout(() => {
              get().removeNotification(id);
            }, fullNotification.duration);
          }
        },
        
        removeNotification: (id: string) => {
          set((state) => {
            state.ui.notifications = state.ui.notifications.filter(n => n.id !== id);
          });
        },
        
        openModal: (type: string, props: Record<string, unknown> = {}): string => {
          const id = `modal_${Date.now()}_${Math.random().toString(16).substring(2, 8)}`;
          const modal: ModalState = {
            id,
            type,
            props,
            isOpen: true,
          };
          
          set((state) => {
            state.ui.modals.push(modal);
          });
          
          return id;
        },
        
        closeModal: (id: string) => {
          set((state) => {
            state.ui.modals = state.ui.modals.filter(m => m.id !== id);
          });
        },
        
        setLoading: (key: string, loading: boolean) => {
          set((state) => {
            state.ui.loading[key] = loading;
          });
        },
        
        // ====================================================================
        // Utility Actions
        // ====================================================================
        
        reset: () => {
          set(() => ({ ...initialState }));
        },
        
        refreshAll: async () => {
          const { refreshWalletBalance } = get();

          // Refresh wallet balance if there's an active wallet
          const activeWallet = get().wallets.activeWallet;
          if (activeWallet) {
            await refreshWalletBalance(activeWallet.address);
          }

          // Update node status if connected
          if (get().isConnected) {
            // TODO: Implement actual status refresh
            console.log('Refreshing all state...');
          }
        },
      })),
      {
        name: 'conflux-devkit-state',
        partialize: (state) => ({
          ui: {
            sidebarOpen: state.ui.sidebarOpen,
            activeTab: state.ui.activeTab,
          },
          wallets: {
            wallets: state.wallets.wallets,
            activeWallet: state.wallets.activeWallet,
          },
        }),
      }
    )
  )
);

// ============================================================================
// Event Emitter Access
// ============================================================================

export const getStateEventEmitter = () => stateEventEmitter;

// ============================================================================
// Store Selectors
// ============================================================================

export const selectors = {
  isConnected: (state: AppStore) => state.isConnected,
  isConnecting: (state: AppStore) => state.isConnecting,
  connectionError: (state: AppStore) => state.connectionError,
  
  nodeStatus: (state: AppStore) => state.node.status,
  isNodeRunning: (state: AppStore) => state.node.isRunning,
  nodeError: (state: AppStore) => state.node.error,
  
  activeWallet: (state: AppStore) => state.wallets.activeWallet,
  wallets: (state: AppStore) => state.wallets.wallets,
  walletBalance: (state: AppStore) => state.wallets.balance,
  walletError: (state: AppStore) => state.wallets.error,
  
  deployedContracts: (state: AppStore) => state.contracts.deployed,
  activeContract: (state: AppStore) => state.contracts.activeContract,
  contractCalls: (state: AppStore) => state.contracts.contractCalls,
  contractEvents: (state: AppStore) => state.contracts.events,
  contractError: (state: AppStore) => state.contracts.deploymentError,
  
  currentNetwork: (state: AppStore) => state.network.current,
  availableNetworks: (state: AppStore) => state.network.available,
  isNetworkSwitching: (state: AppStore) => state.network.isSwitching,
  networkError: (state: AppStore) => state.network.switchError,
  
  sidebarOpen: (state: AppStore) => state.ui.sidebarOpen,
  activeTab: (state: AppStore) => state.ui.activeTab,
  notifications: (state: AppStore) => state.ui.notifications,
  modals: (state: AppStore) => state.ui.modals,
  isLoading: (state: AppStore) => (key: string) => state.ui.loading[key] || false,
};
