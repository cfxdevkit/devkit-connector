import { useState, useEffect } from 'react';
import type { BrowserContractOrchestrator } from '@conflux-devkit/core';

interface ContractManagementProps {
  contracts: BrowserContractOrchestrator[];
  onRefresh: () => void;
}

export function ContractManagement({ contracts, onRefresh }: ContractManagementProps) {
  const [activeContract, setActiveContract] = useState<BrowserContractOrchestrator | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showDeployForm, setShowDeployForm] = useState(false);
  const [contractName, setContractName] = useState('');
  const [constructorArgs, setConstructorArgs] = useState('');
  const [showCallForm, setShowCallForm] = useState(false);
  const [callMethodName, setCallMethodName] = useState('');
  const [callArgs, setCallArgs] = useState('');

  const handleDeployContract = async () => {
    if (!contractName.trim()) {
      setActionError('Contract name is required');
      return;
    }

    setIsLoading(true);
    setIsDeploying(true);
    setActionError(null);
    try {
      const args = constructorArgs.trim() ? JSON.parse(constructorArgs) : [];
      
      const response = await fetch('/api/contracts/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contractName,
          constructorArgs: args,
        }),
      });
      
      const result = await response.json();
      if (!result.success) {
        setActionError(result.error || 'Failed to deploy contract');
      } else {
        setShowDeployForm(false);
        setContractName('');
        setConstructorArgs('');
        onRefresh(); // Refresh contracts list
      }
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Failed to deploy contract'
      );
    } finally {
      setIsLoading(false);
      setIsDeploying(false);
    }
  };

  const handleCallMethod = async () => {
    if (!activeContract || !callMethodName.trim()) {
      setActionError('Active contract and method name are required');
      return;
    }

    setIsLoading(true);
    setActionError(null);
    try {
      const args = callArgs.trim() ? JSON.parse(callArgs) : [];
      // TODO: Implement contract method calling via API
      console.log('Calling method:', callMethodName, 'on contract:', activeContract.address, 'with args:', args);
      setShowCallForm(false);
      setCallMethodName('');
      setCallArgs('');
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Failed to call contract method'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshContracts = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      onRefresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Failed to refresh contracts'
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
            <span className="card-icon">📦</span>
            Contract Management
          </h3>
          <span
            className={`status-badge status-${contracts.length > 0 ? 'online' : 'offline'}`}
          >
            {contracts.length} contract{contracts.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="card-content">
          <div className="contract-controls">
            <button
              className="btn btn-primary"
              onClick={() => setShowDeployForm(!showDeployForm)}
              disabled={isDeploying || isLoading}
            >
              {isDeploying ? <span className="spinner" /> : '🚀'}
              {showDeployForm ? 'Cancel' : 'Deploy Contract'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleRefreshContracts}
              disabled={isLoading}
            >
              {isLoading ? <span className="spinner" /> : '🔄'}
              Refresh
            </button>
          </div>

          {showDeployForm && (
            <div className="deploy-contract-form">
              <h4>Deploy New Contract</h4>
              <div className="form-group">
                <label htmlFor="contractName">Contract Name:</label>
                <input
                  id="contractName"
                  type="text"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  placeholder="e.g., MyToken"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="constructorArgs">
                  Constructor Arguments (JSON array):
                </label>
                <input
                  id="constructorArgs"
                  type="text"
                  value={constructorArgs}
                  onChange={(e) => setConstructorArgs(e.target.value)}
                  placeholder='e.g., ["arg1", "arg2"]'
                  className="form-input"
                />
              </div>
              <div className="form-actions">
                <button
                  className="btn btn-success"
                  onClick={handleDeployContract}
                  disabled={isDeploying || isLoading || !contractName.trim()}
                >
                  {isDeploying ? <span className="spinner" /> : '✨'}
                  Deploy Contract
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeployForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

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
            <span className="card-icon">🔧</span>
            Contract Interaction
          </h3>
        </div>
        <div className="card-content">
          {activeContract ? (
            <div className="contract-interaction">
              <div className="active-contract">
                <h4>Active Contract</h4>
                <div className="contract-details">
                  <div className="contract-detail">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">
                      {activeContract.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="contract-detail">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">
                      {activeContract.address}
                    </span>
                  </div>
                  <div className="contract-detail">
                    <span className="detail-label">Network:</span>
                    <span className="detail-value">
                      {activeContract.network?.name || 'Unknown'}
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setShowCallForm(!showCallForm)}
                >
                  {showCallForm ? 'Cancel' : 'Call Method'}
                </button>
              </div>

              {showCallForm && (
                <div className="call-method-form">
                  <h4>Call Contract Method</h4>
                  <div className="form-group">
                    <label htmlFor="callMethodName">Method Name:</label>
                    <input
                      id="callMethodName"
                      type="text"
                      value={callMethodName}
                      onChange={(e) => setCallMethodName(e.target.value)}
                      placeholder="e.g., transfer"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="callArgs">Arguments (JSON array):</label>
                    <input
                      id="callArgs"
                      type="text"
                      value={callArgs}
                      onChange={(e) => setCallArgs(e.target.value)}
                      placeholder='e.g., ["0x123...", "100"]'
                      className="form-input"
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      className="btn btn-success"
                      onClick={handleCallMethod}
                      disabled={isLoading || !callMethodName.trim()}
                    >
                      {isLoading ? <span className="spinner" /> : '▶️'}
                      Call Method
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowCallForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-active-contract">
              <p>No active contract selected</p>
              <p className="text-muted">
                Select a contract from the list below to interact with it
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card full-width">
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">📋</span>
            Contract List
          </h3>
        </div>
        <div className="card-content">
          {contracts.length > 0 ? (
            <div className="contract-list">
              {contracts.map((contract: any, _index: number) => (
                <div
                  key={contract.address}
                  className={`contract-item ${activeContract?.address === contract.address ? 'active' : ''}`}
                  onClick={() => setActiveContract(contract)}
                >
                  <div className="contract-info">
                    <div className="contract-name">
                      {contract.name || 'Unknown'}
                    </div>
                    <div className="contract-address">
                      {contract.address.slice(0, 8)}...
                      {contract.address.slice(-8)}
                    </div>
                    <div className="contract-network">
                      {contract.network?.name || 'Unknown Network'}
                    </div>
                  </div>
                  <div className="contract-actions">
                    {activeContract?.address === contract.address && (
                      <span className="active-indicator">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-contracts">
              <p>No contracts found</p>
              <p className="text-muted">
                Deploy your first contract to get started
              </p>
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
          <p>This demonstrates the ContractCard web component integration:</p>
          <div className="web-component-demo">
            {activeContract ? (
              <div>
                <conflux-contract-card
                  name={activeContract.name || 'Unknown'}
                  address={activeContract.address}
                  chain-type="evm"
                  network-id={activeContract.network?.chainId || 'unknown'}
                  methods={JSON.stringify({
                    read: [],
                    write: [],
                    events: [],
                  })}
                  active="true"
                  show-actions="true"
                />
              </div>
            ) : (
              <div className="no-contract-placeholder">
                <p>Select a contract to see the ContractCard component</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Additional styles for contract management
const contractStyles = `
.contract-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.deploy-contract-form, .call-method-form {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
}

.deploy-contract-form h4, .call-method-form h4 {
  margin-bottom: 1rem;
  color: #2d3748;
}

.contract-interaction {
  display: grid;
  gap: 1rem;
}

.active-contract h4 {
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.contract-details {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.contract-detail {
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

.contract-list {
  display: grid;
  gap: 0.5rem;
}

.contract-item {
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

.contract-item:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.contract-item.active {
  background: #dbeafe;
  border-color: #3b82f6;
}

.contract-info {
  flex: 1;
}

.contract-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.contract-address {
  font-family: monospace;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.contract-network {
  color: #9ca3af;
  font-size: 0.75rem;
}

.contract-actions {
  display: flex;
  align-items: center;
}

.active-indicator {
  color: #10b981;
  font-weight: bold;
  font-size: 1.2rem;
}

.no-active-contract, .no-contracts {
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

.no-contract-placeholder {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

.full-width {
  grid-column: 1 / -1;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = contractStyles;
  document.head.appendChild(styleSheet);
}
