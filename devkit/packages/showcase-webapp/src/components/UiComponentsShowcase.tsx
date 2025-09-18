import { useEffect, useRef, useState } from 'react';
import type {
  BrowserNetworkConfig,
  BrowserWalletInfo,
  BrowserNodeStatus,
  BrowserContractOrchestrator,
} from '@conflux-devkit/core';

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

interface UiComponentsShowcaseProps {
  state: ShowcaseState;
  onNetworkChange: (network: BrowserNetworkConfig) => void;
  onWalletChange: (wallet: BrowserWalletInfo) => void;
  onRefresh: () => void;
}

export function UiComponentsShowcase({
  state,
  onNetworkChange,
  onWalletChange,
  onRefresh,
}: UiComponentsShowcaseProps) {
  return (
    <div className="ui-components-showcase">
      <div className="showcase-header">
        <h2>🎨 UI Components Showcase</h2>
        <p>Interactive web components from @conflux-devkit/ui-components</p>
      </div>

      <div className="components-grid">
        {/* Network Selector Component */}
        <div className="component-demo">
          <h3>🌐 Network Selector</h3>
          <p>Select and switch between different Conflux networks</p>
          <div className="component-container">
            <div className="mock-component">
              <select
                value={
                  state.currentNetwork
                    ? `${state.currentNetwork.networkType}-${state.currentNetwork.chainId}`
                    : ''
                }
                onChange={e => {
                  const [networkType, chainId] = e.target.value.split('-');
                  const network = state.networks.find(
                    n => n.networkType === networkType && n.chainId === chainId
                  );
                  if (network) onNetworkChange(network);
                }}
                className="network-selector"
              >
                <option value="">Select Network</option>

                {/* Main Networks */}
                <optgroup label="🌐 Main">
                  {state.networks
                    .filter(
                      network =>
                        !network.isTestnet &&
                        !network.rpcUrl.includes('localhost')
                    )
                    .map(network => (
                      <option
                        key={`main-${network.networkType}-${network.chainId}`}
                        value={`${network.networkType}-${network.chainId}`}
                      >
                        {network.name} ({network.networkType.toUpperCase()})
                      </option>
                    ))}
                </optgroup>

                {/* Test Networks */}
                <optgroup label="🧪 Test">
                  {state.networks
                    .filter(
                      network =>
                        network.isTestnet &&
                        !network.rpcUrl.includes('localhost')
                    )
                    .map(network => (
                      <option
                        key={`test-${network.networkType}-${network.chainId}`}
                        value={`${network.networkType}-${network.chainId}`}
                      >
                        {network.name} ({network.networkType.toUpperCase()})
                      </option>
                    ))}
                </optgroup>

                {/* Local Networks */}
                <optgroup label="🏠 Local">
                  {state.networks
                    .filter(network => network.rpcUrl.includes('localhost'))
                    .map(network => (
                      <option
                        key={`local-${network.networkType}-${network.chainId}`}
                        value={`${network.networkType}-${network.chainId}`}
                      >
                        {network.name} ({network.networkType.toUpperCase()})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Wallet Card Component */}
        <div className="component-demo">
          <h3>👛 Wallet Card</h3>
          <p>Display wallet information and manage wallet interactions</p>
          <div className="component-container">
            {state.activeWallet ? (
              <div className="mock-wallet-card">
                <h4>Wallet Information</h4>
                <p>
                  <strong>Name:</strong> {state.activeWallet.name}
                </p>
                <p>
                  <strong>Address:</strong> {state.activeWallet.address}
                </p>
                <p>
                  <strong>Balance:</strong>{' '}
                  {state.activeWallet.balanceFormatted}
                </p>
                <p>
                  <strong>Mining:</strong>{' '}
                  {state.activeWallet.isMining ? 'Yes' : 'No'}
                </p>
                <button
                  onClick={() => onWalletChange(state.activeWallet!)}
                  className="btn btn-primary"
                >
                  Select Wallet
                </button>
              </div>
            ) : (
              <div className="no-wallet">
                <p>No wallet connected</p>
                <button onClick={onRefresh} className="btn btn-primary">
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Node Status Component */}
        <div className="component-demo">
          <h3>🖥️ Node Status</h3>
          <p>Monitor Conflux node status and health</p>
          <div className="component-container">
            {state.nodeStatus ? (
              <div className="mock-node-status">
                <h4>Node Information</h4>
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
                <p>
                  <strong>Peer Count:</strong> {state.nodeStatus.peerCount}
                </p>
              </div>
            ) : (
              <div className="no-node">
                <p>Node status unknown</p>
                <button onClick={onRefresh} className="btn btn-primary">
                  Check Status
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contract Cards */}
        <div className="component-demo full-width">
          <h3>📦 Contract Cards</h3>
          <p>Display and interact with smart contracts</p>
          <div className="contracts-grid">
            {state.contracts.length > 0 ? (
              state.contracts.map((contract, index) => (
                <div key={index} className="mock-contract-card">
                  <h4>{contract.name}</h4>
                  <p>
                    <strong>Address:</strong> {contract.address}
                  </p>
                  <p>
                    <strong>Chain Type:</strong> {contract.chainType}
                  </p>
                  <p>
                    <strong>Chain ID:</strong> {contract.chainId}
                  </p>
                  <div className="capabilities">
                    {Object.entries(contract.capabilities || {}).map(
                      ([key, value]) => (
                        <span
                          key={key}
                          className={`capability ${value ? 'active' : ''}`}
                        >
                          {key}
                        </span>
                      )
                    )}
                  </div>
                  <button
                    onClick={() => console.log('Contract selected:', contract)}
                    className="btn btn-primary"
                  >
                    Select Contract
                  </button>
                </div>
              ))
            ) : (
              <div className="no-contracts">
                <p>No contracts available</p>
                <button onClick={onRefresh} className="btn btn-primary">
                  Load Contracts
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="showcase-info">
        <h3>ℹ️ Component Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>Network Selector</h4>
            <p>
              Custom element: <code>&lt;conflux-network-selector&gt;</code>
            </p>
            <p>
              Events: <code>network-select</code>
            </p>
            <p>
              Properties: <code>current</code>, <code>available</code>,{' '}
              <code>isLoading</code>
            </p>
          </div>
          <div className="info-item">
            <h4>Wallet Card</h4>
            <p>
              Custom element: <code>&lt;conflux-wallet-card&gt;</code>
            </p>
            <p>
              Events: <code>wallet-select</code>, <code>wallet-refresh</code>
            </p>
            <p>
              Properties: <code>wallet</code>, <code>active</code>,{' '}
              <code>showActions</code>
            </p>
          </div>
          <div className="info-item">
            <h4>Contract Card</h4>
            <p>
              Custom element: <code>&lt;conflux-contract-card&gt;</code>
            </p>
            <p>
              Events: <code>contract-select</code>, <code>contract-call</code>
            </p>
            <p>
              Properties: <code>contract</code>, <code>active</code>,{' '}
              <code>showActions</code>
            </p>
          </div>
          <div className="info-item">
            <h4>Node Status</h4>
            <p>
              Custom element: <code>&lt;conflux-node-status&gt;</code>
            </p>
            <p>
              Properties: <code>status</code>, <code>isLoading</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles for the UI components showcase
const showcaseStyles = `
.ui-components-showcase {
  padding: 1rem;
}

.showcase-header {
  text-align: center;
  margin-bottom: 2rem;
}

.showcase-header h2 {
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.showcase-header p {
  color: #6b7280;
  font-size: 1rem;
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.component-demo {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.component-demo.full-width {
  grid-column: 1 / -1;
}

.component-demo h3 {
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.component-demo p {
  color: #6b7280;
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
}

.component-container {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
}

.mock-component, .mock-wallet-card, .mock-node-status, .mock-contract-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
  max-width: 400px;
}

.mock-wallet-card h4, .mock-node-status h4, .mock-contract-card h4 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1rem;
  font-weight: 600;
}

.mock-wallet-card p, .mock-node-status p, .mock-contract-card p {
  margin: 0.5rem 0;
  color: #4a5568;
  font-size: 0.875rem;
}

.network-selector {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #4a5568;
  font-size: 0.875rem;
}

.capabilities {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.capability {
  padding: 0.25rem 0.5rem;
  background: #edf2f7;
  color: #4a5568;
  border-radius: 4px;
  font-size: 0.75rem;
}

.capability.active {
  background: #bee3f8;
  color: #2b6cb0;
}

.contracts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.no-wallet, .no-contracts {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.ui-components-loading {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.showcase-info {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.showcase-info h3 {
  color: #2d3748;
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
}

.info-item h4 {
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.info-item p {
  color: #6b7280;
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

.info-item code {
  background: #edf2f7;
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.75rem;
  color: #2d3748;
}

.btn {
  padding: 0.5rem 1rem;
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
  .components-grid {
    grid-template-columns: 1fr;
  }
  
  .contracts-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = showcaseStyles;
  document.head.appendChild(styleSheet);
}
