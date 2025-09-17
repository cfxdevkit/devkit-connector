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
import { realWalletService } from '../services/RealWalletService';
import { realContractService } from '../services/RealContractService';
import { networkManager } from '@conflux-devkit/blockchain';

// ============================================================================
// Event Emitter for State Events
// ============================================================================

class StateEventEmitter extends EventEmitter {
  emit<K extends keyof StateEvents>(
    event: K,
    ...args: StateEvents[K]
  ): boolean {
    return super.emit(event as string, ...args);
  }

  on<K extends keyof StateEvents>(
    event: K,
    listener: (...args: StateEvents[K]) => void
  ): this {
    return super.on(event as string, listener as (...args: any[]) => void);
  }

  off<K extends keyof StateEvents>(
    event: K,
    listener: (...args: StateEvents[K]) => void
  ): this {
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
          set(state => {
            state.isConnecting = true;
            state.connectionError = null;
          });

          try {
            // Set up real blockchain connection
            if (config.chainId) {
              const networkId = config.chainId.toString();
              // Set network for services
              realWalletService.setNetwork(networkId);
              realContractService.setNetwork(networkId);

              // Update network state
              const network = networkManager.getNetwork(networkId);
              if (network) {
                set(state => {
                  state.network.current = {
                    name: network.name,
                    chainId: network.chainId.toString(),
                    evmChainId: network.evmChainId?.toString(),
                    rpcUrl: network.rpcUrl,
                    currency: {
                      name: network.currency.name,
                      symbol: network.currency.symbol,
                      decimals: network.currency.decimals.toString(),
                    },
                    isTestnet: network.isTestnet,
                    networkType: 'evm',
                  };
                });
              }
            }

            set(state => {
              state.isConnected = true;
              state.isConnecting = false;
            });

            stateEventEmitter.emit('state:connected');
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Connection failed';
            set(state => {
              state.isConnected = false;
              state.isConnecting = false;
              state.connectionError = errorMessage;
            });
            stateEventEmitter.emit('state:error', 'connection', errorMessage);
          }
        },

        disconnect: async () => {
          set(state => {
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
          set(state => {
            state.connectionError = error;
          });
        },

        // ====================================================================
        // Node Actions
        // ====================================================================

        startNode: async (config?: Partial<NodeConfig>) => {
          set(state => {
            state.node.isStarting = true;
            state.node.error = null;
          });

          try {
            // Real node start logic - for now, simulate successful start
            // In a real implementation, this would start an actual Conflux node
            const nodeStatus: BrowserNodeStatus = {
              running: true,
              corePort: String(config?.corePort || 12537),
              evmPort: String(config?.evmPort || 8545),
              chainId: String(config?.chainId || 2029),
              evmChainId: String(config?.evmChainId || 2030),
              blockNumber: '0',
              peerCount: '0',
              walletMode: 'mnemonic',
              wallets: [],
              miningAddress: null,
            };

            set(state => {
              state.node.status = nodeStatus;
              state.node.isRunning = true;
              state.node.isStarting = false;
              state.node.lastHealthCheck = new Date();
            });

            stateEventEmitter.emit('state:node:started', nodeStatus);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to start node';
            set(state => {
              state.node.error = errorMessage;
              state.node.isStarting = false;
            });
            stateEventEmitter.emit('state:error', 'node', errorMessage);
          }
        },

        stopNode: async () => {
          set(state => {
            state.node.isStopping = true;
          });

          try {
            // Real node stop logic - for now, simulate successful stop
            // In a real implementation, this would stop an actual Conflux node
            set(state => {
              state.node.isRunning = false;
              state.node.isStopping = false;
              state.node.status = null;
            });

            stateEventEmitter.emit('state:node:stopped');
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to stop node';
            set(state => {
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
          set(state => {
            state.node.status = status;
            state.node.lastHealthCheck = new Date();
            // state.node.uptime = status.uptime || 0; // uptime not available in BrowserNodeStatus
          });
        },

        setNodeError: (error: string | null) => {
          set(state => {
            state.node.error = error;
          });
        },

        // ====================================================================
        // Wallet Actions
        // ====================================================================

        createWallet: async (mnemonic?: string): Promise<BrowserWalletInfo> => {
          set(state => {
            state.wallets.isCreating = true;
            state.wallets.error = null;
          });

          try {
            // Set network for wallet service
            const currentNetwork = get().network.current;
            if (currentNetwork) {
              realWalletService.setNetwork(currentNetwork.chainId);
            }

            // Create real wallet using blockchain service
            const wallet = await realWalletService.createWallet(mnemonic);

            set(state => {
              state.wallets.wallets.push(wallet);
              state.wallets.isCreating = false;
            });

            stateEventEmitter.emit('state:wallet:created', wallet);
            return wallet;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to create wallet';
            set(state => {
              state.wallets.error = errorMessage;
              state.wallets.isCreating = false;
            });
            stateEventEmitter.emit('state:error', 'wallet', errorMessage);
            throw error;
          }
        },

        importWallet: async (
          privateKey: string
        ): Promise<BrowserWalletInfo> => {
          set(state => {
            state.wallets.isImporting = true;
            state.wallets.error = null;
          });

          try {
            // Set network for wallet service
            const currentNetwork = get().network.current;
            if (currentNetwork) {
              realWalletService.setNetwork(currentNetwork.chainId);
            }

            // Import real wallet using blockchain service
            const wallet = await realWalletService.importWallet(privateKey);

            set(state => {
              state.wallets.wallets.push(wallet);
              state.wallets.isImporting = false;
            });

            stateEventEmitter.emit('state:wallet:created', wallet);
            return wallet;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to import wallet';
            set(state => {
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
            set(state => {
              state.wallets.activeWallet = wallet;
            });
            stateEventEmitter.emit('state:wallet:selected', wallet);
          }
        },

        refreshWalletBalance: async (address: string) => {
          set(state => {
            state.wallets.isRefreshing = true;
          });

          try {
            // Set network for wallet service
            const currentNetwork = get().network.current;
            if (currentNetwork) {
              realWalletService.setNetwork(currentNetwork.chainId);
            }

            // Get real balance using blockchain service
            const balance = await realWalletService.getBalance(address);
            const formattedBalance =
              await realWalletService.getFormattedBalance(address);

            set(state => {
              state.wallets.balance = balance;
              state.wallets.isRefreshing = false;

              // Update the specific wallet's balance
              const wallet = state.wallets.wallets.find(
                w => w.address === address
              );
              if (wallet) {
                wallet.balance = balance;
                wallet.balanceFormatted = formattedBalance;
              }
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to refresh balance';
            set(state => {
              state.wallets.error = errorMessage;
              state.wallets.isRefreshing = false;
            });
            stateEventEmitter.emit('state:error', 'wallet', errorMessage);
          }
        },

        setWalletError: (error: string | null) => {
          set(state => {
            state.wallets.error = error;
          });
        },

        // ====================================================================
        // Contract Actions
        // ====================================================================

        deployContract: async (
          contractName: string,
          args: unknown[] = []
        ): Promise<BrowserContractOrchestrator> => {
          set(state => {
            state.contracts.isDeploying = true;
            state.contracts.deploymentError = null;
          });

          try {
            // Set network for contract service
            const currentNetwork = get().network.current;
            if (!currentNetwork) {
              throw new Error('No network selected');
            }
            realContractService.setNetwork(currentNetwork.chainId);

            // Get active wallet for deployment
            const activeWallet = get().wallets.activeWallet;
            if (!activeWallet) {
              throw new Error('No active wallet selected');
            }

            // For now, use a simple contract ABI and bytecode
            // In a real implementation, this would come from contract compilation
            const simpleContractABI = [
              {
                type: 'function',
                name: 'getValue',
                stateMutability: 'view',
                inputs: [],
                outputs: [{ type: 'uint256', name: '' }],
              },
              {
                type: 'function',
                name: 'setValue',
                stateMutability: 'nonpayable',
                inputs: [{ type: 'uint256', name: '_value' }],
                outputs: [],
              },
            ];

            const simpleContractBytecode =
              '0x608060405234801561001057600080fd5b50600436106100365760003560e01c8063209652551461003b5780635524107714610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007b565b005b60005481565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b61011a826100d1565b810181811067ffffffffffffffff82111715610139576101386100e2565b5b80604052505050565b600061014c6100b7565b90506101588282610111565b919050565b600067ffffffffffffffff821115610177576101766100e2565b5b610180826100d1565b9050602081019050919050565b82818337600083830152505050565b60006101af6101aa8461015c565b61014c565b9050828152602081018484840111156101cb576101ca6100cc565b5b6101d684828561018d565b509392505050565b600082601f8301126101f1576101f06100b7565b5b813561020184826020860161019c565b91505092915050565b6000602082840312156102205761021f6100c1565b5b600082013567ffffffffffffffff81111561023e5761023d6100c6565b5b61024a848285016101de565b91505092915050565b6000819050919050565b61026681610253565b82525050565b6000602082019050610281600083018461025d565b92915050565b61029081610253565b811461029b57600080fd5b50565b6000813590506102ad81610287565b92915050565b6000602082840312156102c9576102c86100c1565b5b60006102d78482850161029e565b9150509291505056fea2646970667358221220' as `0x${string}`;

            // Deploy real contract using blockchain service
            const contract = await realContractService.deployContract(
              contractName,
              simpleContractBytecode,
              simpleContractABI,
              args,
              activeWallet.privateKey
            );

            set(state => {
              state.contracts.deployed.push(contract);
              state.contracts.isDeploying = false;
            });

            stateEventEmitter.emit('state:contract:deployed', contract);
            return contract;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to deploy contract';
            set(state => {
              state.contracts.deploymentError = errorMessage;
              state.contracts.isDeploying = false;
            });
            stateEventEmitter.emit('state:error', 'contract', errorMessage);
            throw error;
          }
        },

        selectContract: (address: string) => {
          const contract = get().contracts.deployed.find(
            c => c.address === address
          );
          if (contract) {
            set(state => {
              state.contracts.activeContract = contract;
            });
          }
        },

        callContractMethod: async (
          params: ContractCallParams
        ): Promise<ContractCallState> => {
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

          set(state => {
            state.contracts.contractCalls.push(callState);
          });

          try {
            // Set network for contract service
            const currentNetwork = get().network.current;
            if (!currentNetwork) {
              throw new Error('No network selected');
            }
            realContractService.setNetwork(currentNetwork.chainId);

            // Get active wallet for transaction
            const activeWallet = get().wallets.activeWallet;
            if (!activeWallet) {
              throw new Error('No active wallet selected');
            }

            // Call real contract method using blockchain service
            const result = await realContractService.callContractMethod(
              params.contractAddress,
              params.method,
              params.args,
              activeWallet.privateKey
            );

            set(state => {
              const call = state.contracts.contractCalls.find(
                c => c.id === callId
              );
              if (call) {
                call.status = 'success';
                call.result = result;
                call.gasUsed = '0'; // Would be available from transaction receipt
                call.transactionHash = '0x0'; // Would be available from transaction receipt
              }
            });

            stateEventEmitter.emit('state:contract:called', callState);
            return callState;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Contract call failed';
            set(state => {
              const call = state.contracts.contractCalls.find(
                c => c.id === callId
              );
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
          console.log(
            `Subscribing to events for contract ${contractAddress}${eventName ? `, event: ${eventName}` : ''}`
          );
        },

        unsubscribeFromEvents: (
          contractAddress: string,
          eventName?: string
        ) => {
          // TODO: Implement actual event unsubscription logic
          console.log(
            `Unsubscribing from events for contract ${contractAddress}${eventName ? `, event: ${eventName}` : ''}`
          );
        },

        setContractError: (error: string | null) => {
          set(state => {
            state.contracts.deploymentError = error;
          });
        },

        // ====================================================================
        // Network Actions
        // ====================================================================

        switchNetwork: async (networkId: string) => {
          set(state => {
            state.network.isSwitching = true;
            state.network.switchError = null;
          });

          try {
            // Real network switching logic
            const network = networkManager.getNetwork(networkId);
            if (!network) {
              throw new Error(`Network not found: ${networkId}`);
            }

            // Set network for services
            realWalletService.setNetwork(networkId);
            realContractService.setNetwork(networkId);

            const browserNetwork: BrowserNetworkConfig = {
              name: network.name,
              chainId: network.chainId.toString(),
              evmChainId: network.evmChainId?.toString(),
              rpcUrl: network.rpcUrl,
              currency: {
                name: network.currency.name,
                symbol: network.currency.symbol,
                decimals: network.currency.decimals.toString(),
              },
              isTestnet: network.isTestnet,
              networkType: 'evm',
            };

            set(state => {
              state.network.current = browserNetwork;
              state.network.isSwitching = false;
            });

            stateEventEmitter.emit('state:network:switched', browserNetwork);
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to switch network';
            set(state => {
              state.network.switchError = errorMessage;
              state.network.isSwitching = false;
            });
            stateEventEmitter.emit('state:error', 'network', errorMessage);
          }
        },

        setNetworkError: (error: string | null) => {
          set(state => {
            state.network.switchError = error;
          });
        },

        // ====================================================================
        // UI Actions
        // ====================================================================

        toggleSidebar: () => {
          set(state => {
            state.ui.sidebarOpen = !state.ui.sidebarOpen;
          });
        },

        setActiveTab: (tab: string) => {
          set(state => {
            state.ui.activeTab = tab;
          });
        },

        addNotification: (
          notification: Omit<NotificationState, 'id' | 'timestamp'>
        ) => {
          const id = `notif_${Date.now()}_${Math.random().toString(16).substring(2, 8)}`;
          const fullNotification: NotificationState = {
            ...notification,
            id,
            timestamp: new Date(),
          };

          set(state => {
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
          set(state => {
            state.ui.notifications = state.ui.notifications.filter(
              n => n.id !== id
            );
          });
        },

        openModal: (
          type: string,
          props: Record<string, unknown> = {}
        ): string => {
          const id = `modal_${Date.now()}_${Math.random().toString(16).substring(2, 8)}`;
          const modal: ModalState = {
            id,
            type,
            props,
            isOpen: true,
          };

          set(state => {
            state.ui.modals.push(modal);
          });

          return id;
        },

        closeModal: (id: string) => {
          set(state => {
            state.ui.modals = state.ui.modals.filter(m => m.id !== id);
          });
        },

        setLoading: (key: string, loading: boolean) => {
          set(state => {
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
            // Real status refresh - refresh all connected services
            const currentNetwork = get().network.current;
            if (currentNetwork) {
              realWalletService.setNetwork(currentNetwork.chainId);
              realContractService.setNetwork(currentNetwork.chainId);
            }
            console.log('Refreshing all state...');
          }
        },
      })),
      {
        name: 'conflux-devkit-state',
        partialize: state => ({
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
  isLoading: (state: AppStore) => (key: string) =>
    state.ui.loading[key] || false,
};
