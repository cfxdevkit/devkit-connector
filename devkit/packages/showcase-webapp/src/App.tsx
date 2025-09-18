import { useEffect } from 'react';
import { Dashboard } from './components/Dashboard.js';
import { useAppStore } from '@conflux-devkit/state';
import { networkManager } from '@conflux-devkit/blockchain/browser';

function App() {
  // Use the state library store
  const {
    // State
    isConnected,
    isConnecting,
    connectionError,
    node,
    wallets,
    contracts,
    network,
    ui,
    // Actions
    connect,
    disconnect,
    startNode,
    stopNode,
    restartNode,
    createWallet,
    selectWallet,
    refreshWalletBalance,
    switchNetwork,
    setActiveTab,
    deployContract,
  } = useAppStore();

  // Initialize networks and connect to default network
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get available networks from network manager
        const availableNetworks = networkManager.getAllNetworks();

        // Connect to local network by default
        const localNetwork = availableNetworks.find(n =>
          n.name.includes('Local')
        );
        if (localNetwork) {
          await connect({
            chainId: localNetwork.chainId,
            corePort: 12537,
            evmPort: 8545,
          });
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [connect]);

  // Subscribe to state changes for real-time updates
  useEffect(() => {
    // Subscribe to wallet changes
    const unsubscribeWallets = useAppStore.subscribe(
      state => state.wallets,
      wallets => {
        // Wallet state has changed, no need to manually refresh
      }
    );

    // Subscribe to node changes
    const unsubscribeNode = useAppStore.subscribe(
      state => state.node,
      node => {
        // Node state has changed, no need to manually refresh
      }
    );

    // Subscribe to network changes
    const unsubscribeNetwork = useAppStore.subscribe(
      state => state.network,
      network => {
        // Network state has changed, no need to manually refresh
      }
    );

    // Subscribe to contract changes
    const unsubscribeContracts = useAppStore.subscribe(
      state => state.contracts,
      contracts => {
        // Contract state has changed, no need to manually refresh
      }
    );

    // Cleanup subscriptions
    return () => {
      unsubscribeWallets();
      unsubscribeNode();
      unsubscribeNetwork();
      unsubscribeContracts();
    };
  }, []);

  // Handler functions that use state library actions
  const handleNetworkChange = async (networkId: string) => {
    try {
      await switchNetwork(networkId);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const handleWalletChange = (walletAddress: string) => {
    selectWallet(walletAddress);
  };

  const handleRefresh = () => {
    // No need to manually refresh - state library handles this automatically
    // This is kept for backward compatibility with components
  };

  // Create state object for Dashboard component compatibility
  const state = {
    networks: networkManager.getAllNetworks().map(n => ({
      name: n.name,
      chainId: n.chainId.toString(),
      evmChainId: n.evmChainId?.toString(),
      rpcUrl: n.rpcUrl,
      currency: {
        name: n.currency.name,
        symbol: n.currency.symbol,
        decimals: n.currency.decimals.toString(),
      },
      isTestnet: n.isTestnet,
      networkType: n.networkType || 'evm',
    })),
    currentNetwork: network.current,
    wallets: wallets.wallets,
    activeWallet: wallets.activeWallet,
    nodeStatus: node.status,
    isLoading:
      isConnecting ||
      node.isStarting ||
      node.isStopping ||
      wallets.isCreating ||
      wallets.isRefreshing,
    error:
      connectionError || node.error || wallets.error || network.switchError,
  };

  return (
    <div className="app">
      {state.error && (
        <div className="error-banner">
          <strong>Error:</strong> {state.error}
        </div>
      )}

      <Dashboard
        state={state}
        onNetworkChange={handleNetworkChange}
        onWalletChange={handleWalletChange}
        onRefresh={handleRefresh}
        // Pass state library actions directly
        nodeActions={{
          startNode,
          stopNode,
          restartNode,
        }}
        walletActions={{
          createWallet,
          selectWallet,
          refreshWalletBalance,
        }}
        networkActions={{
          switchNetwork,
        }}
        hardhatActions={{
          deployContract,
        }}
      />
    </div>
  );
}

export default App;

// App Styles
const appStyles = `
.app {
  min-height: 100vh;
  background: #f7fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.error-banner {
  background: #fed7d7;
  border: 1px solid #feb2b2;
  color: #c53030;
  padding: 1rem 2rem;
  margin: 0;
  font-size: 0.875rem;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = appStyles;
  document.head.appendChild(styleSheet);
}
