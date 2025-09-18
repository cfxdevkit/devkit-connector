import { useState, useEffect } from 'react';
import type { BrowserContractOrchestrator } from '@conflux-devkit/core';

interface ContractManagementProps {
  contracts: BrowserContractOrchestrator[];
  onRefresh: () => void;
}

export function ContractManagement({
  contracts,
  onRefresh,
}: ContractManagementProps) {
  const [activeContract, setActiveContract] =
    useState<BrowserContractOrchestrator | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showDeployForm, setShowDeployForm] = useState(false);
  const [contractName, setContractName] = useState('');
  const [constructorArgs, setConstructorArgs] = useState('');
  const [contractType, setContractType] = useState('simple');
  const [showCallForm, setShowCallForm] = useState(false);
  const [callMethodName, setCallMethodName] = useState('');
  const [callArgs, setCallArgs] = useState('');
  const [interactionResult, setInteractionResult] = useState<any>(null);
  const [contractBalance, setContractBalance] = useState<string>('0');
  const [showEvents, setShowEvents] = useState(false);

  const contractTypes = [
    {
      value: 'simple',
      label: 'Simple Contract',
      description: 'Basic state management',
    },
    {
      value: 'erc20',
      label: 'ERC20 Token',
      description: 'Fungible token with transfers',
    },
    { value: 'nft', label: 'NFT Contract', description: 'Non-fungible token' },
    {
      value: 'voting',
      label: 'Voting Contract',
      description: 'Governance and voting',
    },
    {
      value: 'multisig',
      label: 'Multisig Wallet',
      description: 'Multi-signature wallet',
    },
  ];

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
          contracts: [contractName],
          contractType,
          constructorArgs: args,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        setActionError(result.error || 'Failed to deploy contract');
      } else {
        console.log('✅ Contract deployed with full potential:', result);
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

      const response = await fetch('/api/contracts/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractAddress: activeContract.address,
          methodName: callMethodName,
          args: args,
          abi: activeContract.abi,
        }),
      });

      const result = await response.json();
      setInteractionResult(result);
      console.log('📞 Method call result:', result);
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

  const handleSendTransaction = async () => {
    if (!activeContract || !callMethodName.trim()) {
      setActionError('Active contract and method name are required');
      return;
    }

    setIsLoading(true);
    setActionError(null);
    try {
      const args = callArgs.trim() ? JSON.parse(callArgs) : [];

      const response = await fetch('/api/contracts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractAddress: activeContract.address,
          methodName: callMethodName,
          args: args,
          abi: activeContract.abi,
          fromAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Use first wallet
        }),
      });

      const result = await response.json();
      setInteractionResult(result);
      console.log('📤 Transaction result:', result);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Failed to send transaction'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadContractBalance = async (address: string) => {
    try {
      const response = await fetch(`/api/contracts/${address}/balance`);
      const data = await response.json();
      if (data.success) {
        setContractBalance(data.balanceFormatted);
      }
    } catch (error) {
      console.error('Failed to load contract balance:', error);
    }
  };

  const loadContractEvents = async (address: string) => {
    try {
      const response = await fetch(`/api/contracts/${address}/events`);
      const data = await response.json();
      if (data.success) {
        setInteractionResult({
          success: true,
          events: data.events,
          count: data.count,
        });
        setShowEvents(true);
      }
    } catch (error) {
      console.error('Failed to load contract events:', error);
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
                <label htmlFor="contractType">Contract Type:</label>
                <select
                  id="contractType"
                  value={contractType}
                  onChange={e => setContractType(e.target.value)}
                  className="form-input"
                >
                  {contractTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="contractName">Contract Name:</label>
                <input
                  id="contractName"
                  type="text"
                  value={contractName}
                  onChange={e => setContractName(e.target.value)}
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
                  onChange={e => setConstructorArgs(e.target.value)}
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
                  Deploy{' '}
                  {contractTypes.find(t => t.value === contractType)?.label}
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
                  <h4>Contract Interaction</h4>
                  <div className="form-group">
                    <label htmlFor="callMethodName">Method Name:</label>
                    <input
                      id="callMethodName"
                      type="text"
                      value={callMethodName}
                      onChange={e => setCallMethodName(e.target.value)}
                      placeholder="e.g., transfer, balanceOf, mint"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="callArgs">Arguments (JSON array):</label>
                    <input
                      id="callArgs"
                      type="text"
                      value={callArgs}
                      onChange={e => setCallArgs(e.target.value)}
                      placeholder='e.g., ["0x123...", "100"]'
                      className="form-input"
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      className="btn btn-primary"
                      onClick={handleCallMethod}
                      disabled={isLoading || !callMethodName.trim()}
                    >
                      {isLoading ? <span className="spinner" /> : '📞'}
                      Call Method (Read)
                    </button>
                    <button
                      className="btn btn-warning"
                      onClick={handleSendTransaction}
                      disabled={isLoading || !callMethodName.trim()}
                    >
                      {isLoading ? <span className="spinner" /> : '📤'}
                      Send Transaction (Write)
                    </button>
                    <button
                      className="btn btn-info"
                      onClick={() =>
                        loadContractBalance(activeContract.address)
                      }
                      disabled={isLoading}
                    >
                      💰 Get Balance
                    </button>
                    <button
                      className="btn btn-info"
                      onClick={() => loadContractEvents(activeContract.address)}
                      disabled={isLoading}
                    >
                      📋 Get Events
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

              {interactionResult && (
                <div className="interaction-result">
                  <h4>Interaction Result</h4>
                  <div className="result-content">
                    <pre>{JSON.stringify(interactionResult, null, 2)}</pre>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setInteractionResult(null)}
                  >
                    Clear Result
                  </button>
                </div>
              )}

              {contractBalance !== '0' && (
                <div className="contract-balance">
                  <h4>Contract Balance</h4>
                  <p className="balance-amount">{contractBalance}</p>
                </div>
              )}

              {showEvents && interactionResult?.events && (
                <div className="contract-events">
                  <h4>Contract Events ({interactionResult.count})</h4>
                  <div className="events-list">
                    {interactionResult.events.map(
                      (event: any, index: number) => (
                        <div key={index} className="event-item">
                          <div className="event-header">
                            <span className="event-name">
                              {event.event || 'Unknown Event'}
                            </span>
                            <span className="event-block">
                              Block: {event.blockNumber}
                            </span>
                          </div>
                          <div className="event-data">
                            <pre>
                              {JSON.stringify(
                                event.args || event.data,
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowEvents(false)}
                  >
                    Hide Events
                  </button>
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

.interaction-result {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.interaction-result h4 {
  margin-bottom: 0.5rem;
  color: #0c4a6e;
}

.result-content {
  background: #1e293b;
  color: #f1f5f9;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.result-content pre {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
}

.contract-balance {
  background: #f0fdf4;
  border: 1px solid #22c55e;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.contract-balance h4 {
  margin-bottom: 0.5rem;
  color: #166534;
}

.balance-amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #15803d;
  margin: 0;
}

.contract-events {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.contract-events h4 {
  margin-bottom: 0.5rem;
  color: #92400e;
}

.events-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.event-item {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.event-name {
  font-weight: 600;
  color: #374151;
}

.event-block {
  font-size: 0.875rem;
  color: #6b7280;
}

.event-data {
  background: #f9fafb;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.event-data pre {
  margin: 0;
  color: #374151;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-info {
  background: #0ea5e9;
  color: white;
  border: 1px solid #0284c7;
}

.btn-info:hover {
  background: #0284c7;
}

.btn-warning {
  background: #f59e0b;
  color: white;
  border: 1px solid #d97706;
}

.btn-warning:hover {
  background: #d97706;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = contractStyles;
  document.head.appendChild(styleSheet);
}
