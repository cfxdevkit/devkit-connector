import { useState, useEffect } from 'react';
import { ApiIntegration } from './ApiIntegration.js';
import { ContractManagement } from './ContractManagement.js';
import { NetworkControl } from './NetworkControl.js';
import { NodeControl } from './NodeControl.js';
import { WalletManagement } from './WalletManagement.js';
import { UiComponentsShowcase } from './UiComponentsShowcase.js';
import type {
  BrowserNetworkConfig,
  BrowserWalletInfo,
  BrowserNodeStatus,
  BrowserContractOrchestrator,
} from '@conflux-devkit/core';

type TabType =
  | 'overview'
  | 'node'
  | 'wallets'
  | 'contracts'
  | 'network'
  | 'api'
  | 'ui-components';

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

interface DashboardProps {
  state: ShowcaseState;
  onNetworkChange: (network: BrowserNetworkConfig) => void;
  onWalletChange: (wallet: BrowserWalletInfo) => void;
  onRefresh: () => void;
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

        {/* Contracts Status Card */}
        <div className="overview-card">
          <h3>📦 Contracts</h3>
          <p>
            <strong>Available:</strong> {state.contracts.length}
          </p>
          <p>
            <strong>Deployed:</strong>{' '}
            {
              state.contracts.filter(
                c => c.address !== '0x0000000000000000000000000000000000000000'
              ).length
            }
          </p>
        </div>
      </div>

      <div className="overview-actions">
        <button onClick={onRefresh} className="btn btn-primary">
          🔄 Refresh All Data
        </button>
      </div>
    </div>
  );
}

export function Dashboard({
  state,
  onNetworkChange,
  onWalletChange,
  onRefresh,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: '📊' },
    { id: 'node' as TabType, label: 'Node Control', icon: '🖥️' },
    { id: 'wallets' as TabType, label: 'Wallets', icon: '👛' },
    { id: 'contracts' as TabType, label: 'Contracts', icon: '📦' },
    { id: 'network' as TabType, label: 'Network', icon: '🌐' },
    { id: 'api' as TabType, label: 'API Integration', icon: '🔗' },
    { id: 'ui-components' as TabType, label: 'UI Components', icon: '🎨' },
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
          />
        );
      case 'wallets':
        return (
          <WalletManagement
            wallets={state.wallets}
            activeWallet={state.activeWallet}
            onWalletChange={onWalletChange}
            onRefresh={onRefresh}
          />
        );
      case 'contracts':
        return (
          <ContractManagement
            contracts={state.contracts}
            onRefresh={onRefresh}
          />
        );
      case 'network':
        return (
          <div className="placeholder-content">
            <h3>Network Control</h3>
            <p>Network control functionality will be implemented here.</p>
          </div>
        );
      case 'api':
        return (
          <div className="placeholder-content">
            <h3>API Integration</h3>
            <p>API integration functionality will be implemented here.</p>
          </div>
        );
      case 'ui-components':
        return (
          <UiComponentsShowcase
            state={state}
            onNetworkChange={onNetworkChange}
            onWalletChange={onWalletChange}
            onRefresh={onRefresh}
          />
        );
      default:
        return <OverviewTab state={state} onRefresh={onRefresh} />;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">🚀 Conflux DevKit Showcase</h1>
        <p className="dashboard-subtitle">
          Complete UI Ecosystem Demonstration with Full State Management
        </p>
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

.placeholder-content {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.placeholder-content h3 {
  color: #2d3748;
  margin-bottom: 1rem;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = tabStyles;
  document.head.appendChild(styleSheet);
}
