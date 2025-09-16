import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { WalletMode } from '../types/wallet';
import { detectAvailableWallets, handleWalletConflicts, WalletInfo } from '../utils/walletDetection';
import WalletConflictHelper from './WalletConflictHelper';
import ErrorTracker from './ErrorTracker';

const WalletManager: React.FC = () => {
  const {
    currentMode,
    currentChain,
    walletState,
    switchToServerWallet,
    switchToBrowserWallet,
    switchChain,
    createBrowserDelegation,
    clearAllWallets,
    serverWallet,
    browserWallet,
  } = useWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);
  const [walletConflicts, setWalletConflicts] = useState<ReturnType<typeof handleWalletConflicts>>({
    hasConflicts: false,
    conflicts: [],
    recommendations: []
  });

  // Detect available wallets on mount
  useEffect(() => {
    const wallets = detectAvailableWallets();
    const conflicts = handleWalletConflicts();

    setAvailableWallets(wallets);
    setWalletConflicts(conflicts);
  }, []);

  const handleSwitchWallet = async (mode: WalletMode) => {
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'server-managed') {
        await switchToServerWallet();
      } else if (mode === 'browser-connected') {
        await switchToBrowserWallet();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDelegation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const sessionId = await createBrowserDelegation({
        sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
        allowedOperations: ['sign_transaction', 'sign_message', 'get_balance'],
        maxTransactionValue: '1000000000000000000', // 1 ETH
      });

      console.log('Delegation session created:', sessionId);
      setShowDelegationModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create delegation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearWallets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await clearAllWallets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear wallets');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (connected: boolean) => {
    return connected ? 'text-green-600' : 'text-red-600';
  };

  const getModeDisplayName = (mode: WalletMode | null) => {
    switch (mode) {
      case 'server-managed':
        return 'Server-Managed Wallet';
      case 'browser-connected':
        return 'Browser Wallet';
      case 'user-delegated':
        return 'Delegated Browser Wallet';
      default:
        return 'No Wallet Connected';
    }
  };

  return (
    <div className="wallet-manager p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Wallet Management</h2>

      {/* Error Tracker - Development Feature */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4">
          <ErrorTracker maxErrors={10} showDetails={true} />
        </div>
      )}

      {/* Wallet Conflict Helper */}
      <WalletConflictHelper />

      {/* Wallet Conflicts Warning */}
      {walletConflicts.hasConflicts && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <div className="flex items-start">
            <span className="text-yellow-600 mr-2">⚠️</span>
            <div>
              <strong>Multiple Wallets Detected:</strong>
              <p className="text-sm mt-1">
                Found: {walletConflicts.conflicts.join(', ')}
              </p>
              <ul className="text-xs mt-2 space-y-1">
                {walletConflicts.recommendations.map((rec, i) => (
                  <li key={i}>• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {(error || walletState.error) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error || walletState.error}
        </div>
      )}

      {/* Current Status */}
      <div className="current-status mb-8">
        <h3 className="text-lg font-semibold mb-4">Current Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="status-card p-4 border rounded-lg">
            <h4 className="font-medium text-gray-700">Active Wallet</h4>
            <p className="text-lg font-bold text-blue-600">
              {getModeDisplayName(currentMode)}
            </p>
            <p className={`text-sm ${getStatusColor(walletState.isConnected)}`}>
              {walletState.isConnected ? '✅ Connected' : '❌ Not Connected'}
            </p>
          </div>

          <div className="status-card p-4 border rounded-lg">
            <h4 className="font-medium text-gray-700">Current Chain</h4>
            <p className="text-lg font-bold text-purple-600">{currentChain}</p>
            <div className="mt-2">
              <button
                onClick={() => switchChain(currentChain === 'eSpace' ? 'core' : 'eSpace')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Switch to {currentChain === 'eSpace' ? 'Core' : 'eSpace'}
              </button>
            </div>
          </div>
        </div>

        {/* Address Display */}
        {walletState.isConnected && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Addresses</h4>
            {walletState.eSpaceAddress && (
              <p className="text-sm text-gray-600 break-all">
                <strong>eSpace:</strong> {walletState.eSpaceAddress}
              </p>
            )}
            {walletState.coreAddress && (
              <p className="text-sm text-gray-600 break-all">
                <strong>Core:</strong> {walletState.coreAddress}
              </p>
            )}
            {walletState.sessionId && (
              <p className="text-sm text-gray-600 break-all">
                <strong>Session ID:</strong> {walletState.sessionId}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Available Wallets Info */}
      <div className="available-wallets mb-8">
        <h3 className="text-lg font-semibold mb-4">Available Wallet Extensions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableWallets.map((wallet) => (
            <div key={wallet.name} className={`p-3 border rounded-lg ${wallet.installed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{wallet.icon}</span>
                <span className="font-medium">{wallet.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${wallet.installed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {wallet.installed ? 'Installed' : 'Not Installed'}
                </span>
              </div>
              {!wallet.installed && (
                <a
                  href={wallet.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                >
                  Download →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Wallet Options */}
      <div className="wallet-options mb-8">
        <h3 className="text-lg font-semibold mb-4">Wallet Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Server Wallet */}
          <div className="wallet-option p-4 border rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Server-Managed Wallet</h4>
            <p className="text-sm text-gray-600 mb-4">
              Secure server-side wallet with encrypted storage.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleSwitchWallet('server-managed')}
                disabled={isLoading || currentMode === 'server-managed'}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {currentMode === 'server-managed' ? 'Active' : 'Use Server Wallet'}
              </button>
              <p className="text-xs text-gray-500">
                Status: <span className={getStatusColor(serverWallet.isConnected)}>
                  {serverWallet.isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </p>
            </div>
          </div>

          {/* Browser Wallet */}
          <div className="wallet-option p-4 border rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Browser Wallet</h4>
            <p className="text-sm text-gray-600 mb-4">
              Connect directly with MetaMask or other browser wallets.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleSwitchWallet('browser-connected')}
                disabled={isLoading || currentMode === 'browser-connected'}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 disabled:opacity-50"
              >
                {currentMode === 'browser-connected' ? 'Active' : 'Connect Browser Wallet'}
              </button>
              <p className="text-xs text-gray-500">
                Status: <span className={getStatusColor(browserWallet.wallet?.connected || false)}>
                  {browserWallet.wallet?.connected ? 'Connected' : 'Not Connected'}
                </span>
              </p>
            </div>
          </div>

          {/* Delegated Wallet */}
          <div className="wallet-option p-4 border rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Delegated Wallet</h4>
            <p className="text-sm text-gray-600 mb-4">
              Delegate browser wallet operations to server for automation.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setShowDelegationModal(true)}
                disabled={isLoading || !browserWallet.wallet?.connected}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                Create Delegation
              </button>
              <p className="text-xs text-gray-500">
                Status: <span className={getStatusColor(currentMode === 'user-delegated')}>
                  {currentMode === 'user-delegated' ? 'Delegated' : 'Not Delegated'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="actions">
        <h3 className="text-lg font-semibold mb-4">Actions</h3>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleClearWallets}
            disabled={isLoading}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
          >
            Clear All Wallets
          </button>

          {currentMode === 'server-managed' && (
            <button
              onClick={serverWallet.clearWallet}
              disabled={isLoading}
              className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              Clear Server Wallet
            </button>
          )}

          {browserWallet.wallet?.connected && (
            <button
              onClick={browserWallet.disconnect}
              disabled={isLoading}
              className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 disabled:opacity-50"
            >
              Disconnect Browser Wallet
            </button>
          )}
        </div>
      </div>

      {/* Delegation Modal */}
      {showDelegationModal && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="modal-header flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create Delegation</h3>
              <button
                onClick={() => setShowDelegationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="modal-body mb-6">
              <p className="text-gray-600 mb-4">
                This will delegate your browser wallet operations to the server for automated processing.
              </p>

              <div className="delegation-details bg-gray-50 p-4 rounded">
                <h4 className="font-medium mb-2">Delegation Settings:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Duration: 24 hours</li>
                  <li>• Max transaction value: 1 ETH</li>
                  <li>• Allowed operations: Transactions, Messages, Balance checks</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer flex gap-3">
              <button
                onClick={() => setShowDelegationModal(false)}
                disabled={isLoading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDelegation}
                disabled={isLoading}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Delegation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {(isLoading || walletState.isLoading) && (
        <div className="loading fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-center">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManager;