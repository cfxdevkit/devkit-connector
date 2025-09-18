import {
  useNode,
  useNodeControls,
  useNodeMetrics,
  useNodeStatus,
} from '@conflux-devkit/ui-primitives';
import { useState } from 'react';

export function NodeControl() {
  const { status, isRunning, isStarting, isStopping, error } = useNode();
  const { start, stop, restart, canStart, canStop, canRestart } =
    useNodeControls();
  const { statusColor, statusText } = useNodeStatus();
  const { metrics } = useNodeMetrics();

  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStart = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const success = await start();
      if (!success) {
        setActionError('Failed to start node');
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const success = await stop();
      if (!success) {
        setActionError('Failed to stop node');
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const success = await restart();
      if (!success) {
        setActionError('Failed to restart node');
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-grid">
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">🖥️</span>
            Node Control
          </h3>
          <span
            className={`status-badge status-${isRunning ? 'online' : 'offline'}`}
          >
            {statusText}
          </span>
        </div>
        <div className="card-content">
          <div className="node-controls">
            <button
              className={`btn btn-success ${!canStart || isLoading ? 'disabled' : ''}`}
              onClick={handleStart}
              disabled={!canStart || isLoading}
            >
              {isLoading && isStarting ? <span className="spinner" /> : '▶️'}
              Start Node
            </button>
            <button
              className={`btn btn-danger ${!canStop || isLoading ? 'disabled' : ''}`}
              onClick={handleStop}
              disabled={!canStop || isLoading}
            >
              {isLoading && isStopping ? <span className="spinner" /> : '⏹️'}
              Stop Node
            </button>
            <button
              className={`btn btn-secondary ${!canRestart || isLoading ? 'disabled' : ''}`}
              onClick={handleRestart}
              disabled={!canRestart || isLoading}
            >
              {isLoading ? <span className="spinner" /> : '🔄'}
              Restart Node
            </button>
          </div>

          {actionError && (
            <div className="error-message">
              <strong>Error:</strong> {actionError}
            </div>
          )}

          {error && (
            <div className="error-message">
              <strong>Node Error:</strong> {error}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">📊</span>
            Node Status
          </h3>
        </div>
        <div className="card-content">
          {status ? (
            <div className="node-status-details">
              <div className="status-item">
                <span className="status-label">Status:</span>
                <span className={`status-value status-${statusColor}`}>
                  {statusText}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Block Number:</span>
                <span className="status-value">
                  {metrics?.blockNumber || 'N/A'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Peer Count:</span>
                <span className="status-value">
                  {metrics?.peerCount || 'N/A'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Gas Price:</span>
                <span className="status-value">N/A</span>
              </div>
              <div className="status-item">
                <span className="status-label">TPS:</span>
                <span className="status-value">N/A</span>
              </div>
              <div className="status-item">
                <span className="status-label">Health:</span>
                <span className="status-value">
                  {status.health || 'Unknown'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Last Check:</span>
                <span className="status-value">
                  {status.lastHealthCheck
                    ? new Date(status.lastHealthCheck).toLocaleString()
                    : 'Never'}
                </span>
              </div>
            </div>
          ) : (
            <div className="no-status">
              <p>No node status available. Start the node to see details.</p>
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
          <p>This demonstrates the NodeStatus web component integration:</p>
          <div className="web-component-demo">
            <conflux-node-status
              running={isRunning.toString()}
              chain-id={status?.chainId || 'N/A'}
              evm-chain-id={status?.evmChainId || 'N/A'}
              block-number={metrics?.blockNumber || '0'}
              peer-count={metrics?.peerCount || '0'}
              health={status?.health || 'unknown'}
              show-actions="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Additional styles for node control
const nodeControlStyles = `
.node-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.node-controls .btn {
  flex: 1;
  min-width: 120px;
  justify-content: center;
}

.node-status-details {
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

.status-value.status-online {
  color: #10b981;
}

.status-value.status-offline {
  color: #ef4444;
}

.status-value.status-loading {
  color: #f59e0b;
}

.error-message {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.no-status {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
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
  styleSheet.textContent = nodeControlStyles;
  document.head.appendChild(styleSheet);
}
