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

  // Initialize DevKit services
  useEffect(() => {
    const initializeDevKit = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Load networks
        const networksResponse = await fetch('/api/networks');
        const networksData = await networksResponse.json();

        if (networksData.success) {
          setState(prev => ({
            ...prev,
            networks: networksData.data,
            currentNetwork: networksData.data[0] || null,
          }));
        }

        // Load initial data
        await Promise.all([loadWallets(), loadNodeStatus(), loadContracts()]);

        setState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error('Failed to initialize DevKit:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      }
    };

    initializeDevKit();
  }, []);

  const loadWallets = async () => {
    try {
      const response = await fetch('/api/wallet/info');
      const data = await response.json();

      if (data.available) {
        const wallet: BrowserWalletInfo = {
          index: 0,
          address: data.address,
          privateKey: '', // Not exposed in API
          balance: data.balance,
          balanceFormatted: data.balance,
          isMining: false,
          isDefault: true,
          name: data.name || 'Default Wallet',
        };

        setState(prev => ({
          ...prev,
          wallets: [wallet],
          activeWallet: wallet,
        }));
      }
    } catch (error) {
      console.error('Failed to load wallets:', error);
    }
  };

  const loadNodeStatus = async () => {
    try {
      const response = await fetch('/api/node/status');
      const data = await response.json();

      if (data.running) {
        const nodeStatus: BrowserNodeStatus = {
          running: data.running,
          corePort: '8080',
          evmPort: '8545',
          chainId: data.chainId?.toString() || '1',
          evmChainId: data.evmChainId?.toString() || '1',
          blockNumber: data.blockNumber?.toString() || '0',
          peerCount: data.peerCount?.toString() || '0',
          walletMode: 'mnemonic',
          wallets: [],
          miningAddress: null,
          health: 'healthy',
          lastHealthCheck: new Date().toISOString(),
        };

        setState(prev => ({ ...prev, nodeStatus }));
      }
    } catch (error) {
      console.error('Failed to load node status:', error);
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
              canWrite: contract.deployed,
              hasEvents: true,
            },
          })
        );

        setState(prev => ({ ...prev, contracts }));
      }
    } catch (error) {
      console.error('Failed to load contracts:', error);
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
          onRefresh={() => {
            loadWallets();
            loadNodeStatus();
            loadContracts();
          }}
        />
      ) : (
        <Dashboard
          state={state}
          onNetworkChange={handleNetworkChange}
          onWalletChange={handleWalletChange}
          onRefresh={() => {
            loadWallets();
            loadNodeStatus();
            loadContracts();
          }}
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
