import {
  useNetwork,
  useNetworkStatus,
  useNetworkSwitcher,
} from '@conflux-devkit/ui-primitives';
import { useState } from 'react';

export function NetworkControl() {
  const { current, available, switchNetwork } = useNetwork();
  const { isConnected } = useNetworkStatus();
  const { isSwitching } = useNetworkSwitcher();

  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSwitchNetwork = async (networkId: string) => {
    setIsLoading(true);
    setActionError(null);
    try {
      await switchNetwork(networkId);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Failed to switch network'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshNetwork = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      // Refresh network status
      window.location.reload(); // Simple refresh for demo
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Failed to refresh network'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-grid">
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">🌐</span>
            Network Control
          </h3>
          <span
            className={`status-badge status-${isConnected ? 'online' : 'offline'}`}
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="card-content">
          <div className="network-controls">
            <button
              className="btn btn-secondary"
              onClick={handleRefreshNetwork}
              disabled={isLoading}
            >
              {isLoading ? <span className="spinner" /> : '🔄'}
              Refresh
            </button>
          </div>

          {actionError && (
            <div className="error-message">
              <strong>Error:</strong> {actionError}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">📊</span>
            Network Status
          </h3>
        </div>
        <div className="card-content">
          <div className="network-status">
            <div className="status-item">
              <span className="status-label">Connection:</span>
              <span
                className={`status-value ${isConnected ? 'online' : 'offline'}`}
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Latency:</span>
              <span className="status-value">N/A</span>
            </div>
            <div className="status-item">
              <span className="status-label">Last Check:</span>
              <span className="status-value">N/A</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">🔗</span>
            Current Network
          </h3>
        </div>
        <div className="card-content">
          {current ? (
            <div className="current-network">
              <div className="network-details">
                <div className="network-detail">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{current.name}</span>
                </div>
                <div className="network-detail">
                  <span className="detail-label">Chain ID:</span>
                  <span className="detail-value">{current.chainId}</span>
                </div>
                <div className="network-detail">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">
                    {(current as any).type || 'Unknown'}
                  </span>
                </div>
                <div className="network-detail">
                  <span className="detail-label">RPC URL:</span>
                  <span className="detail-value">{current.rpcUrl}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-network">
              <p>No network selected</p>
              <p className="text-muted">
                Select a network from the available options
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card full-width">
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">📋</span>
            Available Networks
          </h3>
        </div>
        <div className="card-content">
          {available.length > 0 ? (
            <div className="network-list">
              {available.map((network: any, index) => (
                <div
                  key={index}
                  className={`network-item ${current?.chainId === network.chainId ? 'active' : ''}`}
                  onClick={() => handleSwitchNetwork(network.chainId)}
                >
                  <div className="network-info">
                    <div className="network-name">{network.name}</div>
                    <div className="network-chain-id">
                      Chain ID: {network.chainId}
                    </div>
                    <div className="network-type">
                      Type: {network.type || 'Unknown'}
                    </div>
                  </div>
                  <div className="network-actions">
                    {current?.chainId === network.chainId && (
                      <span className="active-indicator">✓</span>
                    )}
                    {!isSwitching && current?.chainId !== network.chainId && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwitchNetwork(network.chainId);
                        }}
                        disabled={isLoading}
                      >
                        Switch
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-networks">
              <p>No networks available</p>
              <p className="text-muted">Check your network configuration</p>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card full-width">
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">🧩</span>
            Web Component Demo
          </h3>
        </div>
        <div className="card-content">
          <p>
            This demonstrates the NetworkSelector web component integration:
          </p>
          <div className="web-component-demo">
            <conflux-network-selector
              current-network={current?.chainId || ''}
              available-networks={JSON.stringify(
                available.map((network: any) => ({
                  name: network.name,
                  chainId: network.chainId,
                  type: network.type || 'Unknown',
                }))
              )}
              theme="light"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Additional styles for network control
const networkStyles = `
.network-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.network-status {
  display: grid;
  gap: 0.75rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f7fafc;
  border-radius: 4px;
}

.status-label {
  font-weight: 500;
  color: #4a5568;
}

.status-value {
  font-weight: 600;
  color: #2d3748;
}

.status-value.online {
  color: #10b981;
}

.status-value.offline {
  color: #ef4444;
}

.current-network {
  display: grid;
  gap: 0.75rem;
}

.network-details {
  display: grid;
  gap: 0.5rem;
}

.network-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f7fafc;
  border-radius: 4px;
}

.detail-label {
  font-weight: 500;
  color: #4a5568;
}

.detail-value {
  font-weight: 600;
  color: #2d3748;
  font-family: monospace;
  font-size: 0.875rem;
}

.network-list {
  display: grid;
  gap: 0.5rem;
}

.network-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.network-item:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.network-item.active {
  background: #dbeafe;
  border-color: #3b82f6;
}

.network-info {
  flex: 1;
}

.network-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.network-chain-id {
  font-family: monospace;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.network-type {
  color: #9ca3af;
  font-size: 0.75rem;
}

.network-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.active-indicator {
  color: #10b981;
  font-weight: bold;
  font-size: 1.2rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.no-network, .no-networks {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

.text-muted {
  color: #9ca3af;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.web-component-demo {
  margin-top: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.full-width {
  grid-column: 1 / -1;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = networkStyles;
  document.head.appendChild(styleSheet);
}
