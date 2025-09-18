import { useState, useEffect } from 'react';
import type { BrowserWalletInfo } from '@conflux-devkit/core';

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

interface WalletManagementProps {
  wallets: BrowserWalletInfo[];
  activeWallet: BrowserWalletInfo | null;
  onWalletChange: (walletAddress: string) => void;
  onRefresh: () => void;
  walletActions: {
    createWallet: (mnemonic?: string) => Promise<any>;
    selectWallet: (address: string) => void;
    refreshWalletBalance: (address: string) => Promise<void>;
  };
}

interface BrowserWallet {
  address: string;
  name: string;
  isConnected: boolean;
  balance?: string;
}

export function WalletManagement({
  wallets,
  activeWallet,
  onWalletChange,
  onRefresh,
  walletActions,
}: WalletManagementProps) {
  const [browserWallets, setBrowserWallets] = useState<BrowserWallet[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [mnemonic, setMnemonic] = useState('');

  // Detect browser wallets on mount
  useEffect(() => {
    detectBrowserWallets();
  }, []);

  const detectBrowserWallets = async () => {
    try {
      // Check for MetaMask
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
        if (accounts.length > 0) {
          const browserWallets: BrowserWallet[] = accounts.map(
            (address: string, index: number) => ({
              address,
              name: `MetaMask ${index + 1}`,
              isConnected: true,
            })
          );
          setBrowserWallets(browserWallets);
        }
      }
    } catch (error) {
      console.error('Failed to detect browser wallets:', error);
    }
  };

  const connectBrowserWallet = async () => {
    setIsConnecting(true);
    setActionError(null);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        const newWallets: BrowserWallet[] = accounts.map(
          (address: string, index: number) => ({
            address,
            name: `MetaMask ${index + 1}`,
            isConnected: true,
          })
        );

        setBrowserWallets(prev => [...prev, ...newWallets]);
      } else {
        setActionError('No browser wallet detected. Please install MetaMask.');
      }
    } catch (error) {
      setActionError('Failed to connect browser wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const selectWallet = (walletAddress: string) => {
    walletActions.selectWallet(walletAddress);
    onWalletChange(walletAddress);
  };

  const handleCreateWallet = async () => {
    setIsLoading(true);
    setIsCreating(true);
    setActionError(null);
    try {
      await walletActions.createWallet(mnemonic || undefined);
      setShowCreateForm(false);
      setMnemonic('');
      // State will update automatically through subscriptions
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Failed to create wallet'
      );
    } finally {
      setIsLoading(false);
      setIsCreating(false);
    }
  };

  const handleRefreshWallets = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      // State will update automatically through subscriptions
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Failed to refresh wallets'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshBalance = async () => {
    if (activeWallet) {
      setIsLoading(true);
      setActionError(null);
      try {
        await walletActions.refreshWalletBalance(activeWallet.address);
        // State will update automatically through subscriptions
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : 'Failed to refresh balance'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="dashboard-grid">
      {/* Browser Wallets */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">🌐</span>
            Browser Wallets
          </h3>
          <span
            className={`status-badge status-${browserWallets.length > 0 ? 'online' : 'offline'}`}
          >
            {browserWallets.length} connected
          </span>
        </div>
        <div className="card-content">
          <div className="wallet-controls">
            <button
              className="btn btn-primary"
              onClick={connectBrowserWallet}
              disabled={isConnecting}
            >
              {isConnecting ? <span className="spinner" /> : '🔗'}
              Connect MetaMask
            </button>
            <button
              className="btn btn-secondary"
              onClick={detectBrowserWallets}
              disabled={isLoading}
            >
              {isLoading ? <span className="spinner" /> : '🔄'}
              Refresh
            </button>
          </div>

          {browserWallets.length > 0 ? (
            <div className="wallet-list">
              {browserWallets.map((wallet, index) => (
                <div key={wallet.address} className="wallet-item">
                  <div className="wallet-info">
                    <div className="wallet-name">{wallet.name}</div>
                    <div className="wallet-address">
                      {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                    </div>
                    <div className="wallet-balance">
                      {wallet.balance || '0'} CFX
                    </div>
                  </div>
                  <div className="wallet-actions">
                    <span className="connected-indicator">✓</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-wallets">
              <p>No browser wallets connected</p>
              <p className="text-muted">
                Connect MetaMask or other browser wallets
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Server Wallets */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">🖥️</span>
            Server Wallets
          </h3>
          <span
            className={`status-badge status-${wallets.length > 0 ? 'online' : 'offline'}`}
          >
            {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="card-content">
          <div className="wallet-controls">
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
              disabled={isCreating || isLoading}
            >
              {isCreating ? <span className="spinner" /> : '➕'}
              {showCreateForm ? 'Cancel' : 'Create Wallet'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleRefreshWallets}
              disabled={isLoading}
            >
              {isLoading ? <span className="spinner" /> : '🔄'}
              Refresh
            </button>
          </div>

          {showCreateForm && (
            <div className="create-wallet-form">
              <h4>Create New Wallet</h4>
              <div className="form-group">
                <label htmlFor="mnemonic">Mnemonic (optional):</label>
                <input
                  id="mnemonic"
                  type="text"
                  value={mnemonic}
                  onChange={e => setMnemonic(e.target.value)}
                  placeholder="Enter 12-word mnemonic or leave empty for random"
                  className="form-input"
                />
              </div>
              <div className="form-actions">
                <button
                  className="btn btn-success"
                  onClick={handleCreateWallet}
                  disabled={isCreating || isLoading}
                >
                  {isCreating ? <span className="spinner" /> : '✨'}
                  Create Wallet
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCreateForm(false)}
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
            <span className="card-icon">💰</span>
            Balance Information
          </h3>
        </div>
        <div className="card-content">
          {activeWallet ? (
            <div className="balance-info">
              <div className="balance-item">
                <span className="balance-label">Address:</span>
                <span className="balance-value">{activeWallet.address}</span>
              </div>
              <div className="balance-item">
                <span className="balance-label">Balance:</span>
                <span className="balance-value">
                  {isLoading ? (
                    <span className="loading">Loading...</span>
                  ) : (
                    `${activeWallet.balance || '0'} CFX`
                  )}
                </span>
              </div>
              <div className="balance-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleRefreshBalance}
                  disabled={isLoading}
                >
                  {isLoading ? <span className="spinner" /> : '🔄'}
                  Refresh Balance
                </button>
              </div>
            </div>
          ) : (
            <div className="no-wallet">
              <p>No active wallet selected</p>
              <p className="text-muted">
                Create a wallet or select an existing one
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card full-width">
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">📋</span>
            Wallet List
          </h3>
        </div>
        <div className="card-content">
          {wallets.length > 0 ? (
            <div className="wallet-list">
              {wallets.map((wallet: any, _index: number) => (
                <div
                  key={wallet.address}
                  className={`wallet-item ${activeWallet?.address === wallet.address ? 'active' : ''}`}
                  onClick={() => selectWallet(wallet.address)}
                >
                  <div className="wallet-info">
                    <div className="wallet-address">
                      {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                    </div>
                    <div className="wallet-balance">
                      {wallet.balance || '0'} CFX
                    </div>
                  </div>
                  <div className="wallet-actions">
                    {activeWallet?.address === wallet.address && (
                      <span className="active-indicator">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-wallets">
              <p>No wallets found</p>
              <p className="text-muted">
                Create your first wallet to get started
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
          <p>This demonstrates the WalletCard web component integration:</p>
          <div className="web-component-demo">
            {activeWallet ? (
              <div>
                <conflux-wallet-card
                  address={activeWallet.address}
                  balance={activeWallet.balance || '0'}
                  balance-formatted={`${activeWallet.balance || '0'} CFX`}
                  is-mining="false"
                  theme="light"
                />
              </div>
            ) : (
              <div className="no-wallet-placeholder">
                <p>Select a wallet to see the WalletCard component</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Additional styles for wallet management
const walletStyles = `
.wallet-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.create-wallet-form {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
}

.create-wallet-form h4 {
  margin-bottom: 1rem;
  color: #2d3748;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.balance-info {
  display: grid;
  gap: 0.75rem;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f7fafc;
  border-radius: 4px;
}

.balance-label {
  font-weight: 500;
  color: #4a5568;
}

.balance-value {
  font-weight: 600;
  color: #2d3748;
  font-family: monospace;
}

.balance-actions {
  margin-top: 1rem;
}

.wallet-list {
  display: grid;
  gap: 0.5rem;
}

.wallet-item {
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

.wallet-item:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.wallet-item.active {
  background: #dbeafe;
  border-color: #3b82f6;
}

.wallet-info {
  flex: 1;
}

.wallet-address {
  font-family: monospace;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.wallet-balance {
  color: #6b7280;
  font-size: 0.875rem;
}

.wallet-actions {
  display: flex;
  align-items: center;
}

.active-indicator {
  color: #10b981;
  font-weight: bold;
  font-size: 1.2rem;
}

.no-wallet, .no-wallets {
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

.no-wallet-placeholder {
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
  styleSheet.textContent = walletStyles;
  document.head.appendChild(styleSheet);
}
