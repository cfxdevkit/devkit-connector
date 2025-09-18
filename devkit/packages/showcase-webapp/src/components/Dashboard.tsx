import { useState, useEffect } from 'react';
import { HardhatDeploymentStatus } from './HardhatDeploymentStatus.js';
import { NodeControl } from './NodeControl.js';
import { WalletManagement } from './WalletManagement.js';
import { NetworkSelection } from './NetworkSelection.js';
import type {
  BrowserNetworkConfig,
  BrowserWalletInfo,
  BrowserNodeStatus,
} from '@conflux-devkit/core';

type TabType = 'overview' | 'node' | 'wallets' | 'hardhat';

interface ShowcaseState {
  networks: BrowserNetworkConfig[];
  currentNetwork: BrowserNetworkConfig | null;
  wallets: BrowserWalletInfo[];
  activeWallet: BrowserWalletInfo | null;
  nodeStatus: BrowserNodeStatus | null;
  isLoading: boolean;
  error: string | null;
}

interface DashboardProps {
  state: ShowcaseState;
  onNetworkChange: (networkId: string) => void;
  onWalletChange: (walletAddress: string) => void;
  onRefresh: () => void;
  nodeActions: {
    startNode: (config?: any) => Promise<void>;
    stopNode: () => Promise<void>;
    restartNode: (config?: any) => Promise<void>;
  };
  walletActions: {
    createWallet: (mnemonic?: string) => Promise<any>;
    selectWallet: (address: string) => void;
    refreshWalletBalance: (address: string) => Promise<void>;
  };
  networkActions: {
    switchNetwork: (networkId: string) => Promise<void>;
  };
  hardhatActions: {
    deployContract: (contractName: string, args?: any[]) => Promise<any>;
  };
}

// Overview Tab Component
function OverviewTab({
  state,
  onRefresh,
}: {
  state: ShowcaseState;
  onRefresh: () => void;
}) {
  return (
    <div className="overview-tab">
      <div className="overview-grid">
        {/* Network Status Card */}
        <div className="overview-card">
          <h3>🌐 Current Network</h3>
          {state.currentNetwork ? (
            <div className="network-info">
              <p>
                <strong>Name:</strong> {state.currentNetwork.name}
              </p>
              <p>
                <strong>Type:</strong>{' '}
                {state.currentNetwork.networkType?.toUpperCase() || 'Unknown'}
              </p>
              <p>
                <strong>Chain ID:</strong> {state.currentNetwork.chainId}
              </p>
              <p>
                <strong>EVM Chain ID:</strong>{' '}
                {state.currentNetwork.evmChainId || 'N/A'}
              </p>
              <p>
                <strong>RPC URL:</strong> {state.currentNetwork.rpcUrl}
              </p>
              <p>
                <strong>Testnet:</strong>{' '}
                {state.currentNetwork.isTestnet ? 'Yes' : 'No'}
              </p>
            </div>
          ) : (
            <p>No network selected</p>
          )}
        </div>

        {/* Wallet Status Card */}
        <div className="overview-card">
          <h3>👛 Active Wallet</h3>
          {state.activeWallet ? (
            <div className="wallet-info">
              <p>
                <strong>Name:</strong> {state.activeWallet.name}
              </p>
              <p>
                <strong>Address:</strong>{' '}
                {state.activeWallet.address.slice(0, 10)}...
              </p>
              <p>
                <strong>Balance:</strong> {state.activeWallet.balance}
              </p>
            </div>
          ) : (
            <p>No wallet connected</p>
          )}
        </div>

        {/* Node Status Card */}
        <div className="overview-card">
          <h3>🖥️ Node Status</h3>
          {state.nodeStatus ? (
            <div className="node-info">
              <p>
                <strong>Status:</strong>{' '}
                {state.nodeStatus.running ? '✅ Running' : '❌ Stopped'}
              </p>
              <p>
                <strong>Health:</strong> {state.nodeStatus.health}
              </p>
              <p>
                <strong>Chain ID:</strong> {state.nodeStatus.chainId}
              </p>
              <p>
                <strong>Block Number:</strong> {state.nodeStatus.blockNumber}
              </p>
            </div>
          ) : (
            <p>Node status unknown</p>
          )}
        </div>
      </div>

      <div className="overview-actions">
        <div className="refresh-info">
          <span className="refresh-icon">🔄</span>
          <span>Data updates automatically via state subscriptions</span>
        </div>
      </div>
    </div>
  );
}

export function Dashboard({
  state,
  onNetworkChange,
  onWalletChange,
  onRefresh,
  nodeActions,
  walletActions,
  networkActions,
  hardhatActions,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const [hardhatStatus, setHardhatStatus] = useState<{
    status: 'idle' | 'compiling' | 'deploying' | 'completed' | 'error';
    progress: number;
    currentStep: string;
    contracts: any[];
    errors: string[];
    startTime?: Date;
    endTime?: Date;
  }>({
    status: 'idle',
    progress: 0,
    currentStep: 'Ready',
    contracts: [],
    errors: [],
  });

  // Hardhat handlers
  const handleHardhatDeploy = async (
    contractNames: string[],
    network: string,
    constructorArgs: { [key: string]: any[] }
  ) => {
    setHardhatStatus(prev => ({
      ...prev,
      status: 'deploying',
      progress: 0,
      currentStep: 'Preparing deployment...',
      errors: [],
      startTime: new Date(),
    }));

    // Check if it's a local network and show appropriate message
    const isLocalNetwork =
      network === 'confluxESpaceLocal' || network === 'hardhat';
    if (isLocalNetwork) {
      setHardhatStatus(prev => ({
        ...prev,
        currentStep: 'Checking local node status...',
        progress: 10,
      }));
    }

    try {
      const response = await fetch('/api/hardhat/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractNames, network, constructorArgs }),
      });
      const result = await response.json();

      if (result.success) {
        setHardhatStatus(prev => ({
          ...prev,
          status: 'completed',
          progress: 100,
          currentStep: `Successfully deployed ${result.deployments.length} contract(s)`,
          contracts: result.deployments,
          endTime: new Date(),
        }));
        // State will update automatically through subscriptions
      } else {
        setHardhatStatus(prev => ({
          ...prev,
          status: 'error',
          currentStep: 'Deployment failed',
          errors: [result.error || 'Unknown deployment error'],
          endTime: new Date(),
        }));
      }
    } catch (error) {
      console.error('Hardhat deployment failed:', error);
      setHardhatStatus(prev => ({
        ...prev,
        status: 'error',
        currentStep: 'Deployment failed',
        errors: [error instanceof Error ? error.message : 'Network error'],
        endTime: new Date(),
      }));
    }
  };

  const handleHardhatCompile = async () => {
    setHardhatStatus(prev => ({
      ...prev,
      status: 'compiling',
      progress: 0,
      currentStep: 'Compiling contracts...',
      errors: [],
      startTime: new Date(),
    }));

    try {
      const response = await fetch('/api/hardhat/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();

      if (result.success) {
        setHardhatStatus(prev => ({
          ...prev,
          status: 'completed',
          progress: 100,
          currentStep: 'Compilation completed successfully',
          endTime: new Date(),
        }));
      } else {
        setHardhatStatus(prev => ({
          ...prev,
          status: 'error',
          currentStep: 'Compilation failed',
          errors: [result.error || 'Unknown compilation error'],
          endTime: new Date(),
        }));
      }
    } catch (error) {
      console.error('Hardhat compilation failed:', error);
      setHardhatStatus(prev => ({
        ...prev,
        status: 'error',
        currentStep: 'Compilation failed',
        errors: [error instanceof Error ? error.message : 'Network error'],
        endTime: new Date(),
      }));
    }
  };

  const handleHardhatReset = () => {
    setHardhatStatus({
      status: 'idle',
      progress: 0,
      currentStep: 'Ready',
      contracts: [],
      errors: [],
    });
  };

  const handleLoadDeployments = async () => {
    try {
      const response = await fetch('/api/hardhat/deployments');
      const result = await response.json();
      if (result.success) {
        setHardhatStatus(prev => ({
          ...prev,
          contracts: result.deployments,
        }));
      }
    } catch (error) {
      console.error('Failed to load deployments:', error);
    }
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: '📊' },
    { id: 'node' as TabType, label: 'Node Control', icon: '🖥️' },
    { id: 'wallets' as TabType, label: 'Wallets', icon: '👛' },
    { id: 'hardhat' as TabType, label: 'Hardhat', icon: '🔨' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab state={state} onRefresh={onRefresh} />;
      case 'node':
        return (
          <NodeControl
            nodeStatus={state.nodeStatus}
            onRefresh={onRefresh}
            nodeActions={nodeActions}
          />
        );
      case 'wallets':
        return (
          <WalletManagement
            wallets={state.wallets}
            activeWallet={state.activeWallet}
            onWalletChange={onWalletChange}
            onRefresh={onRefresh}
            walletActions={walletActions}
          />
        );
      case 'hardhat':
        return (
          <HardhatDeploymentStatus
            status={hardhatStatus}
            onDeploy={handleHardhatDeploy}
            onCompile={handleHardhatCompile}
            onReset={handleHardhatReset}
            onLoadDeployments={handleLoadDeployments}
            hardhatActions={hardhatActions}
          />
        );
      default:
        return <OverviewTab state={state} onRefresh={onRefresh} />;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">🚀 Conflux DevKit Showcase</h1>
          <p className="dashboard-subtitle">
            Complete UI Ecosystem Demonstration with Full State Management
          </p>
        </div>
        <div className="dashboard-controls">
          <NetworkSelection
            currentNetwork={state.currentNetwork}
            onNetworkChange={onNetworkChange}
            isSwitching={false}
          />
        </div>
      </div>

      <div className="tab-navigation">
        <div className="tab-list">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
}

// Tab Navigation Styles
const tabStyles = `
.dashboard-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.dashboard-title-section {
  text-align: left;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.dashboard-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tab-navigation {
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.tab-list {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 500;
}

.tab-button:hover {
  background: #f7fafc;
  color: #4a5568;
}

.tab-button.active {
  background: #3b82f6;
  color: white;
}

.tab-icon {
  font-size: 1rem;
}

.tab-label {
  font-weight: 500;
}

.tab-content {
  min-height: 400px;
}

.overview-tab {
  padding: 1rem;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.overview-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.overview-card h3 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.125rem;
  font-weight: 600;
}

.overview-card p {
  margin: 0.5rem 0;
  color: #4a5568;
  font-size: 0.875rem;
}

.overview-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.refresh-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  color: #0369a1;
  font-size: 0.875rem;
}

.refresh-icon {
  font-size: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.btn.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn.primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    text-align: center;
  }
  
  .dashboard-title-section {
    text-align: center;
  }
  
  .dashboard-controls {
    width: 100%;
    justify-content: center;
  }
  
  .tab-list {
    flex-wrap: wrap;
  }
  
  .tab-button {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }
}

`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = tabStyles;
  document.head.appendChild(styleSheet);
}
