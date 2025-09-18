import { useState, useEffect } from 'react';
import type {
  BrowserNetworkConfig,
  BrowserWalletInfo,
  BrowserNodeStatus,
  BrowserContractOrchestrator,
} from '@conflux-devkit/core';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  error?: string;
  action?: () => void;
  requiresRealServices?: boolean;
}

interface ApiStatus {
  success: boolean;
  message: string;
  timestamp: string;
  services?: {
    core: string;
    blockchain: string;
    state: string;
    'api-server': string;
  };
}

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

interface DemoChecklistProps {
  state: ShowcaseState;
  onNetworkChange: (network: BrowserNetworkConfig) => void;
  onWalletChange: (wallet: BrowserWalletInfo) => void;
  onRefresh: () => void;
}

export function DemoChecklist({
  state,
  onNetworkChange,
  onWalletChange,
  onRefresh,
}: DemoChecklistProps) {
  const [realServicesAvailable, setRealServicesAvailable] = useState(false);
  const [servicesStatus, setServicesStatus] = useState<string>('checking');
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'api-status',
      title: 'Check API Status',
      description: 'Verify the API server is running and responsive',
      status: 'pending',
    },
    {
      id: 'wallet-check',
      title: 'Check Server Wallet',
      description: 'Verify wallet availability and get wallet information',
      status: 'pending',
    },
    {
      id: 'node-status',
      title: 'Check Node Status',
      description: 'Check if Conflux node is running and get node information',
      status: 'pending',
    },
    {
      id: 'start-node',
      title: 'Start Node (if needed)',
      description: "Start the Conflux node if it's not running",
      status: 'pending',
      requiresRealServices: true,
    },
    {
      id: 'contracts-list',
      title: 'List Available Contracts',
      description: 'Show available contracts for deployment',
      status: 'pending',
      requiresRealServices: true,
    },
    {
      id: 'deploy-contracts',
      title: 'Deploy Contracts',
      description: 'Deploy selected contracts to the network',
      status: 'pending',
      requiresRealServices: true,
    },
  ]);

  const updateChecklistItem = (
    id: string,
    status: ChecklistItem['status'],
    error?: string
  ) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, status, error } : item))
    );
  };

  const checkApiStatus = async () => {
    updateChecklistItem('api-status', 'in-progress');
    try {
      const response = await fetch('/api/health');
      const data: ApiStatus = await response.json();
      setApiStatus(data);
      updateChecklistItem('api-status', 'completed');

      // Check if real services are available (not mock)
      const hasRealServices =
        data.services &&
        Object.values(data.services).every(status => status === '✅ Available');

      if (hasRealServices) {
        setRealServicesAvailable(true);
        setServicesStatus('real');
      } else {
        setRealServicesAvailable(false);
        setServicesStatus('mock');
      }
    } catch (error) {
      updateChecklistItem('api-status', 'error', `API check failed: ${error}`);
      setRealServicesAvailable(false);
      setServicesStatus('error');
    }
  };

  const checkWallet = async () => {
    updateChecklistItem('wallet-check', 'in-progress');
    try {
      if (state.activeWallet) {
        updateChecklistItem('wallet-check', 'completed');
      } else {
        updateChecklistItem('wallet-check', 'error', 'No wallet available');
      }
    } catch (error) {
      updateChecklistItem(
        'wallet-check',
        'error',
        `Wallet check failed: ${error}`
      );
    }
  };

  const checkNodeStatus = async () => {
    updateChecklistItem('node-status', 'in-progress');
    try {
      if (state.nodeStatus?.running) {
        updateChecklistItem('node-status', 'completed');
      } else {
        updateChecklistItem('node-status', 'error', 'Node is not running');
      }
    } catch (error) {
      updateChecklistItem(
        'node-status',
        'error',
        `Node status check failed: ${error}`
      );
    }
  };

  const startNode = async () => {
    updateChecklistItem('start-node', 'in-progress');
    try {
      const response = await fetch('/api/node/start', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        updateChecklistItem('start-node', 'completed');
        // Recheck node status
        setTimeout(checkNodeStatus, 2000);
      } else {
        updateChecklistItem(
          'start-node',
          'error',
          data.message || 'Failed to start node'
        );
      }
    } catch (error) {
      updateChecklistItem('start-node', 'error', `Node start failed: ${error}`);
    }
  };

  const loadContracts = async () => {
    updateChecklistItem('contracts-list', 'in-progress');
    try {
      if (state.contracts.length > 0) {
        updateChecklistItem('contracts-list', 'completed');
      } else {
        updateChecklistItem(
          'contracts-list',
          'error',
          'No contracts available'
        );
      }
    } catch (error) {
      updateChecklistItem(
        'contracts-list',
        'error',
        `Failed to load contracts: ${error}`
      );
    }
  };

  const deployContracts = async () => {
    updateChecklistItem('deploy-contracts', 'in-progress');
    try {
      const response = await fetch('/api/contracts/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contracts: selectedContracts }),
      });
      const data = await response.json();
      if (data.success) {
        updateChecklistItem('deploy-contracts', 'completed');
        // Refresh the parent state
        onRefresh();
      } else {
        updateChecklistItem(
          'deploy-contracts',
          'error',
          data.message || 'Deployment failed'
        );
      }
    } catch (error) {
      updateChecklistItem(
        'deploy-contracts',
        'error',
        `Deployment failed: ${error}`
      );
    }
  };

  const runAllChecks = async () => {
    await checkApiStatus();
    await checkWallet();
    await checkNodeStatus();
    await loadContracts();
  };

  useEffect(() => {
    runAllChecks();
  }, [state.activeWallet, state.nodeStatus, state.contracts]);

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in-progress':
        return '⏳';
      case 'error':
        return '❌';
      default:
        return '⭕';
    }
  };

  const getStatusColor = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'completed':
        return 'status-success';
      case 'in-progress':
        return 'status-loading';
      case 'error':
        return 'status-error';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="demo-checklist">
      <div className="demo-checklist-container">
        <h1 className="demo-checklist-title">
          🚀 Conflux DevKit Demo Checklist
        </h1>

        <div className="demo-checklist-actions">
          <button onClick={runAllChecks} className="btn btn-primary">
            🔄 Run All Checks
          </button>
        </div>

        {servicesStatus === 'mock' && (
          <div className="alert alert-warning">
            <strong>⚠️ Mock Services Detected</strong>
            <p>
              This showcase is running with mock data. To use real DevKit
              services, ensure all packages are properly built and the server is
              running with real blockchain integration.
            </p>
          </div>
        )}

        {servicesStatus === 'error' && (
          <div className="alert alert-error">
            <strong>❌ Service Error</strong>
            <p>
              Unable to connect to DevKit services. Please check that the server
              is running and all packages are properly built.
            </p>
          </div>
        )}

        {servicesStatus === 'real' && (
          <div className="alert alert-success">
            <strong>✅ Real DevKit Services Active</strong>
            <p>
              Connected to actual DevKit packages. All operations will use real
              blockchain functionality.
            </p>
          </div>
        )}

        <div className="demo-checklist-items">
          {checklist
            .filter(item => !item.requiresRealServices || realServicesAvailable)
            .map(item => (
              <div key={item.id} className="demo-checklist-item">
                <div className="demo-checklist-item-content">
                  <div className="demo-checklist-item-info">
                    <span className="demo-checklist-item-icon">
                      {getStatusIcon(item.status)}
                    </span>
                    <div>
                      <h3
                        className={`demo-checklist-item-title ${getStatusColor(item.status)}`}
                      >
                        {item.title}
                      </h3>
                      <p className="demo-checklist-item-description">
                        {item.description}
                      </p>
                      {item.error && (
                        <p className="demo-checklist-item-error">
                          {item.error}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="demo-checklist-item-actions">
                    {item.id === 'api-status' && (
                      <button
                        onClick={checkApiStatus}
                        disabled={item.status === 'in-progress'}
                        className="btn btn-secondary btn-sm"
                      >
                        Check
                      </button>
                    )}
                    {item.id === 'wallet-check' && (
                      <button
                        onClick={checkWallet}
                        disabled={item.status === 'in-progress'}
                        className="btn btn-secondary btn-sm"
                      >
                        Check
                      </button>
                    )}
                    {item.id === 'node-status' && (
                      <button
                        onClick={checkNodeStatus}
                        disabled={item.status === 'in-progress'}
                        className="btn btn-secondary btn-sm"
                      >
                        Check
                      </button>
                    )}
                    {item.id === 'start-node' &&
                      state.nodeStatus &&
                      !state.nodeStatus.running && (
                        <button
                          onClick={startNode}
                          disabled={item.status === 'in-progress'}
                          className="btn btn-success btn-sm"
                        >
                          Start Node
                        </button>
                      )}
                    {item.id === 'contracts-list' && (
                      <button
                        onClick={loadContracts}
                        disabled={item.status === 'in-progress'}
                        className="btn btn-secondary btn-sm"
                      >
                        Load
                      </button>
                    )}
                    {item.id === 'deploy-contracts' &&
                      state.contracts.length > 0 && (
                        <button
                          onClick={deployContracts}
                          disabled={
                            item.status === 'in-progress' ||
                            selectedContracts.length === 0
                          }
                          className="btn btn-success btn-sm"
                        >
                          Deploy Selected
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Status Information */}
        <div className="demo-status-grid">
          {/* API Status */}
          <div className="demo-status-card">
            <h3 className="demo-status-title">API Status</h3>
            {apiStatus ? (
              <div className="demo-status-content">
                <p
                  className={
                    apiStatus.success ? 'status-success' : 'status-error'
                  }
                >
                  {apiStatus.success ? '✅ Connected' : '❌ Error'}
                </p>
                <p className="demo-status-text">{apiStatus.message}</p>
                <p className="demo-status-timestamp">{apiStatus.timestamp}</p>
              </div>
            ) : (
              <p className="demo-status-placeholder">Not checked</p>
            )}
          </div>

          {/* Wallet Info */}
          <div className="demo-status-card">
            <h3 className="demo-status-title">Wallet Info</h3>
            {state.activeWallet ? (
              <div className="demo-status-content">
                <p className="status-success">✅ Available</p>
                <p className="demo-status-text">
                  Name: {state.activeWallet.name}
                </p>
                <p className="demo-status-text">
                  Address: {state.activeWallet.address.slice(0, 10)}...
                </p>
                <p className="demo-status-text">
                  Balance: {state.activeWallet.balance}
                </p>
              </div>
            ) : (
              <p className="demo-status-placeholder">Not available</p>
            )}
          </div>

          {/* Node Status */}
          <div className="demo-status-card">
            <h3 className="demo-status-title">Node Status</h3>
            {state.nodeStatus ? (
              <div className="demo-status-content">
                <p
                  className={
                    state.nodeStatus.running ? 'status-success' : 'status-error'
                  }
                >
                  {state.nodeStatus.running ? '✅ Running' : '❌ Stopped'}
                </p>
                <p className="demo-status-text">
                  Health: {state.nodeStatus.health}
                </p>
                <p className="demo-status-text">
                  Chain ID: {state.nodeStatus.chainId}
                </p>
                <p className="demo-status-text">
                  Block Number: {state.nodeStatus.blockNumber}
                </p>
              </div>
            ) : (
              <p className="demo-status-placeholder">Not checked</p>
            )}
          </div>

          {/* Contracts */}
          <div className="demo-status-card">
            <h3 className="demo-status-title">Available Contracts</h3>
            {state.contracts.length > 0 ? (
              <div className="demo-contracts-list">
                {state.contracts.map((contract, index) => (
                  <div key={index} className="demo-contract-item">
                    <input
                      type="checkbox"
                      id={`contract-${index}`}
                      checked={selectedContracts.includes(contract.name)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedContracts([
                            ...selectedContracts,
                            contract.name,
                          ]);
                        } else {
                          setSelectedContracts(
                            selectedContracts.filter(
                              name => name !== contract.name
                            )
                          );
                        }
                      }}
                      className="demo-contract-checkbox"
                    />
                    <label
                      htmlFor={`contract-${index}`}
                      className="demo-contract-label"
                    >
                      {contract.name}{' '}
                      {contract.address !==
                        '0x0000000000000000000000000000000000000000' && (
                        <span className="status-success">(Deployed)</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="demo-status-placeholder">No contracts loaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
