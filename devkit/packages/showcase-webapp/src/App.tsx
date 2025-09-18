import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard.js';
import { DemoChecklist } from './components/DemoChecklist.js';
import type {
  BrowserNetworkConfig,
  BrowserWalletInfo,
  BrowserNodeStatus,
  BrowserContractOrchestrator,
} from '@conflux-devkit/core';

// Global state for the showcase app
interface ShowcaseState {
  networks: BrowserNetworkConfig[];
  currentNetwork: BrowserNetworkConfig | null;
  wallets: BrowserWalletInfo[];
  activeWallet: BrowserWalletInfo | null;
  nodeStatus: BrowserNodeStatus | null;
  contracts: BrowserContractOrchestrator[];
  isLoading: boolean;
  error: string | null;
}

function App() {
  const [showMode, setShowMode] = useState<'demo' | 'dashboard'>('demo');
  const [state, setState] = useState<ShowcaseState>({
    networks: [],
    currentNetwork: null,
    wallets: [],
    activeWallet: null,
    nodeStatus: null,
    contracts: [],
    isLoading: true,
    error: null,
  });

  // Load all data
  const loadAllData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Load networks
      const networksResponse = await fetch('/api/networks');
      const networksData = await networksResponse.json();

      if (networksData.success) {
        setState(prev => ({
          ...prev,
          networks: networksData.data,
          currentNetwork: prev.currentNetwork || networksData.data[0] || null,
        }));
      }

      // Load initial data
      await Promise.all([loadWallets(), loadNodeStatus(), loadContracts()]);

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Failed to load DevKit data:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  // Initialize DevKit services
  useEffect(() => {
    loadAllData();
  }, []);

  // Auto-refresh data every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadAllData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadWallets = async () => {
    try {
      const response = await fetch('/api/wallet/list');
      const data = await response.json();

      if (data.success && data.wallets.length > 0) {
        const wallets: BrowserWalletInfo[] = data.wallets.map(
          (wallet: any) => ({
            index: wallet.index,
            address: wallet.address,
            privateKey: wallet.privateKey || '', // Server wallets expose private keys
            balance: wallet.balance,
            balanceFormatted: wallet.balanceFormatted,
            isMining: wallet.isMining,
            isDefault: wallet.isDefault,
            name: wallet.name,
          })
        );

        setState(prev => ({
          ...prev,
          wallets: wallets,
          activeWallet: wallets.find(w => w.isDefault) || wallets[0],
        }));
      } else {
        // Fallback to single wallet info
        const infoResponse = await fetch('/api/wallet/info');
        const infoData = await infoResponse.json();

        if (infoData.available) {
          const wallet: BrowserWalletInfo = {
            index: infoData.index || 0,
            address: infoData.address,
            privateKey: '', // Not exposed in single wallet API
            balance: infoData.balance,
            balanceFormatted: infoData.balance,
            isMining: infoData.isMining || false,
            isDefault: true,
            name: infoData.name || 'Default Wallet',
          };

          setState(prev => ({
            ...prev,
            wallets: [wallet],
            activeWallet: wallet,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load wallets:', error);
    }
  };

  const loadNodeStatus = async () => {
    try {
      const response = await fetch('/api/node/status');
      const data = await response.json();

      const nodeStatus: BrowserNodeStatus = {
        running: data.running || false,
        corePort: '12537',
        evmPort: '8545',
        chainId: data.chainId?.toString() || '1',
        evmChainId: data.evmChainId?.toString() || '71',
        blockNumber: data.blockNumber?.toString() || '0',
        peerCount: data.peerCount?.toString() || '0',
        walletMode: 'mnemonic',
        wallets: [],
        miningAddress: null,
        health: data.running ? 'healthy' : 'unhealthy',
        lastHealthCheck: new Date().toISOString(),
      };

      setState(prev => {
        const newState = { ...prev, nodeStatus };

        // If node is running, automatically switch to local networks
        if (data.running && prev.networks.length > 0) {
          const localNetworks = prev.networks.filter(
            network =>
              network.rpcUrl.includes('localhost') ||
              (network.chainId === '2029' && network.networkType === 'core') ||
              (network.chainId === '2030' && network.networkType === 'evm')
          );

          if (localNetworks.length > 0) {
            // Switch to the first local network (Core local)
            const localCoreNetwork = localNetworks.find(
              n => n.networkType === 'core'
            );
            if (localCoreNetwork) {
              newState.currentNetwork = localCoreNetwork;
              console.log(
                '🔄 Node started - automatically switched to local network:',
                localCoreNetwork.name
              );
            }
          }
        }

        return newState;
      });
    } catch (error) {
      console.error('Failed to load node status:', error);
      // Set node as stopped if API fails
      const nodeStatus: BrowserNodeStatus = {
        running: false,
        corePort: '12537',
        evmPort: '8545',
        chainId: '1',
        evmChainId: '71',
        blockNumber: '0',
        peerCount: '0',
        walletMode: 'mnemonic',
        wallets: [],
        miningAddress: null,
        health: 'unhealthy',
        lastHealthCheck: new Date().toISOString(),
      };
      setState(prev => ({ ...prev, nodeStatus }));
    }
  };

  const loadContracts = async () => {
    try {
      const response = await fetch('/api/contracts/list');
      const data = await response.json();

      if (data.success) {
        const contracts: BrowserContractOrchestrator[] = data.contracts.map(
          (contract: any) => ({
            name: contract.name,
            address:
              contract.address || '0x0000000000000000000000000000000000000000',
            chainId: state.currentNetwork?.chainId || 1,
            evmChainId: state.currentNetwork?.evmChainId || 1,
            chainType: 'conflux',
            capabilities: {
              canRead: true,
              canWrite: true, // Assume deployed contracts can be written to
              hasEvents: true,
            },
          })
        );

        console.log(`📋 Loaded ${contracts.length} contracts`);
        setState(prev => ({ ...prev, contracts }));
      } else {
        console.log('❌ Failed to load contracts:', data.error);
        setState(prev => ({ ...prev, contracts: [] }));
      }
    } catch (error) {
      console.error('Failed to load contracts:', error);
      setState(prev => ({ ...prev, contracts: [] }));
    }
  };

  const handleNetworkChange = (network: BrowserNetworkConfig) => {
    setState(prev => ({ ...prev, currentNetwork: network }));
    // Reload contracts for new network
    loadContracts();
  };

  const handleWalletChange = (wallet: BrowserWalletInfo) => {
    setState(prev => ({ ...prev, activeWallet: wallet }));
  };

  const handleRefresh = () => {
    loadAllData();
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1>🚀 Conflux DevKit Showcase</h1>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${showMode === 'demo' ? 'active' : ''}`}
            onClick={() => setShowMode('demo')}
          >
            📋 Demo Checklist
          </button>
          <button
            className={`mode-btn ${showMode === 'dashboard' ? 'active' : ''}`}
            onClick={() => setShowMode('dashboard')}
          >
            📊 Dashboard
          </button>
        </div>
      </div>

      {state.error && (
        <div className="error-banner">
          <strong>Error:</strong> {state.error}
        </div>
      )}

      {showMode === 'demo' ? (
        <DemoChecklist
          state={state}
          onNetworkChange={handleNetworkChange}
          onWalletChange={handleWalletChange}
          onRefresh={handleRefresh}
        />
      ) : (
        <Dashboard
          state={state}
          onNetworkChange={handleNetworkChange}
          onWalletChange={handleWalletChange}
          onRefresh={handleRefresh}
        />
      )}
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

.app-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
}

.mode-toggle {
  display: flex;
  gap: 0.5rem;
}

.mode-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.mode-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.mode-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.error-banner {
  background: #fed7d7;
  border: 1px solid #feb2b2;
  color: #c53030;
  padding: 1rem 2rem;
  margin: 0;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .mode-toggle {
    width: 100%;
    justify-content: center;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = appStyles;
  document.head.appendChild(styleSheet);
}
