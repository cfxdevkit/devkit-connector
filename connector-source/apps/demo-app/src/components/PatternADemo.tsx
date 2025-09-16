"use client";

import React, { useState, useEffect } from 'react';

interface ServerWallet {
  id: string;
  address: string;
  balance: string;
  isActive: boolean;
  createdAt: string;
  lastUsed: string;
}

interface ServerTransaction {
  id: string;
  from: string;
  to: string;
  value: string;
  data: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed: string;
  blockNumber: number;
  timestamp: string;
}

export default function PatternADemo() {
  const [serverWallets, setServerWallets] = useState<ServerWallet[]>([]);
  const [transactions, setTransactions] = useState<ServerTransaction[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [counterInfo, setCounterInfo] = useState<any>(null);
  const [counterValue, setCounterValue] = useState<string>('10');
  const [config, setConfig] = useState({
    network: 'localEspace',
    rpcUrl: 'http://localhost:8545'
  });


  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  // Update config
  const updateConfig = (newConfig: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Load contract info
  const loadContractInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contracts/status`);
      if (response.ok) {
        const data = await response.json();
        setContractInfo(data.data);
      }
    } catch (err) {
      console.error('Failed to load contract info:', err);
    }
  };

  // Load counter info
  const loadCounterInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contracts/counter/status`);
      if (response.ok) {
        const data = await response.json();
        setCounterInfo(data.data);
      }
    } catch (err) {
      console.error('Failed to load counter info:', err);
    }
  };

  // Perform counter operations
  const performCounterOperation = async (operation: string, value?: number) => {
    setIsLoading(true);
    setError('');

    try {
      const endpoint = value !== undefined 
        ? `${API_BASE_URL}/api/contracts/counter/${operation}`
        : `${API_BASE_URL}/api/contracts/counter/${operation}`;
      
      const body = value !== undefined ? { value } : {};
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.success) {
        // Reload counter info to get updated count
        await loadCounterInfo();
        setError('');
      } else {
        setError(data.error || 'Operation failed');
      }
    } catch (err) {
      setError('Failed to perform counter operation');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock server wallet management
  const createServerWallet = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate server wallet creation
      const newWallet: ServerWallet = {
        id: `wallet_${Date.now()}`,
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        balance: '0.0',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      };
      
      setServerWallets(prev => [...prev, newWallet]);
      
      // Simulate contract interaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setError('');
    } catch (err) {
      setError('Failed to create server wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTransaction = async (to: string, value: string, data: string = '0x') => {
    if (!selectedWallet) {
      setError('Please select a wallet first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate transaction creation
      const newTransaction: ServerTransaction = {
        id: `tx_${Date.now()}`,
        from: selectedWallet,
        to,
        value,
        data,
        status: 'pending',
        gasUsed: '0',
        blockNumber: 0,
        timestamp: new Date().toISOString(),
      };

      setTransactions(prev => [newTransaction, ...prev]);

      // Simulate transaction processing
      setTimeout(() => {
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === newTransaction.id 
              ? { ...tx, status: 'confirmed', gasUsed: '21000', blockNumber: 12345 }
              : tx
          )
        );
      }, 2000);

      setError('');
    } catch (err) {
      setError('Failed to send transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWalletBalance = async (walletId: string) => {
    setIsLoading(true);
    
    try {
      // Simulate balance refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setServerWallets(prev =>
        prev.map(wallet =>
          wallet.id === walletId
            ? { ...wallet, balance: (Math.random() * 10).toFixed(4), lastUsed: new Date().toISOString() }
            : wallet
        )
      );
    } catch (err) {
      setError('Failed to refresh balance');
    } finally {
      setIsLoading(false);
    }
  };

  // Load contract info and sample data on component mount
  useEffect(() => {
    loadContractInfo();
    loadCounterInfo();
    // Load sample data for demonstration
    const sampleWallets: ServerWallet[] = [
      {
        id: 'wallet_001',
        address: '0xFCAd0B19bB29D4674531d6f115237E16AfCE377c',
        balance: '1.2345',
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z',
        lastUsed: '2024-01-16T14:22:00Z',
      },
      {
        id: 'wallet_002',
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        balance: '0.5678',
        isActive: true,
        createdAt: '2024-01-15T11:45:00Z',
        lastUsed: '2024-01-16T09:15:00Z',
      },
      {
        id: 'wallet_003',
        address: '0x8bfc6fd9437cf1879fb84aade867b6e81efb5631',
        balance: '0.0000',
        isActive: false,
        createdAt: '2024-01-15T15:20:00Z',
        lastUsed: '2024-01-15T15:20:00Z',
      }
    ];

    const sampleTransactions: ServerTransaction[] = [
      {
        id: 'tx_001',
        from: '0xFCAd0B19bB29D4674531d6f115237E16AfCE377c',
        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        value: '0.1',
        data: '0x',
        status: 'confirmed',
        gasUsed: '21000',
        blockNumber: 12345,
        timestamp: '2024-01-16T14:22:00Z',
      },
      {
        id: 'tx_002',
        from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        to: '0x8bfc6fd9437cf1879fb84aade867b6e81efb5631',
        value: '0.05',
        data: '0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b8d4c9db96c4b4d8b6000000000000000000000000000000000000000000000000000000000000000a',
        status: 'confirmed',
        gasUsed: '45000',
        blockNumber: 12346,
        timestamp: '2024-01-16T09:15:00Z',
      },
      {
        id: 'tx_003',
        from: '0xFCAd0B19bB29D4674531d6f115237E16AfCE377c',
        to: '0x1234567890123456789012345678901234567890',
        value: '0.25',
        data: '0x',
        status: 'pending',
        gasUsed: '0',
        blockNumber: 0,
        timestamp: '2024-01-16T16:30:00Z',
      }
    ];

    setServerWallets(sampleWallets);
    setTransactions(sampleTransactions);
    setSelectedWallet('wallet_001'); // Select first wallet by default
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Pattern A: Server-Side Managed Wallets
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Server-managed wallets with centralized control and automated transaction processing
        </p>
      </div>

      {/* Network Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Network Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Network</label>
            <select
              value={config.network}
              onChange={(e) => updateConfig({ network: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded text-black"
            >
              <option value="confluxEspaceTestnet">Conflux eSpace Testnet</option>
              <option value="confluxEspace">Conflux eSpace Mainnet</option>
              <option value="confluxCoreTestnet">Conflux Core Testnet</option>
              <option value="confluxCore">Conflux Core Mainnet</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">RPC URL</label>
            <input
              type="text"
              value={config.rpcUrl || ''}
              onChange={(e) => updateConfig({ rpcUrl: e.target.value })}
              placeholder="Custom RPC URL"
              className="w-full p-2 border border-gray-300 rounded text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contract Address</label>
            <input
              type="text"
              value={contractInfo?.contracts?.espace?.address || '0x8bfc6fd9437cf1879fb84aade867b6e81efb5631'}
              placeholder="Contract address"
              disabled
              className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-black"
            />
          </div>
        </div>
      </div>

      {/* Server Wallet Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Server Wallet Management</h2>
          <button
            onClick={createServerWallet}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Server Wallet'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serverWallets.map((wallet) => (
            <div key={wallet.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-sm text-gray-900">Wallet {wallet.id.slice(-6)}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  wallet.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {wallet.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-mono text-xs break-all"><strong>Address:</strong> {wallet.address}</p>
                <p><strong>Balance:</strong> <span className="font-semibold text-gray-900">{wallet.balance} CFX</span></p>
                <p><strong>Created:</strong> {new Date(wallet.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Used:</strong> {new Date(wallet.lastUsed).toLocaleDateString()}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setSelectedWallet(wallet.id)}
                  className={`px-3 py-2 text-xs rounded-lg font-medium ${
                    selectedWallet === wallet.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedWallet === wallet.id ? 'Selected' : 'Select'}
                </button>
                <button
                  onClick={() => refreshWalletBalance(wallet.id)}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
                >
                  Refresh
                </button>
              </div>
            </div>
          ))}
        </div>

        {serverWallets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No server wallets created yet. Click "Create Server Wallet" to get started.
          </div>
        )}
      </div>

      {/* Transaction Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Transaction Management</h2>
        
        {selectedWallet ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected Wallet:</strong> {serverWallets.find(w => w.id === selectedWallet)?.address}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Address</label>
                <input
                  type="text"
                  id="to-address"
                  defaultValue="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
                  placeholder="0x..."
                  className="w-full p-2 border border-gray-300 rounded text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value (CFX)</label>
                <input
                  type="number"
                  id="value"
                  defaultValue="0.1"
                  placeholder="0.1"
                  step="0.001"
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data (Hex)</label>
                <input
                  type="text"
                  id="data"
                  defaultValue="0x"
                  placeholder="0x"
                  className="w-full p-2 border border-gray-300 rounded text-black"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  const to = (document.getElementById('to-address') as HTMLInputElement).value;
                  const value = (document.getElementById('value') as HTMLInputElement).value;
                  const data = (document.getElementById('data') as HTMLInputElement).value;
                  sendTransaction(to, value, data);
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Transaction'}
              </button>
              <button
                onClick={() => {
                  // Fill with sample data
                  (document.getElementById('to-address') as HTMLInputElement).value = '0x1234567890123456789012345678901234567890';
                  (document.getElementById('value') as HTMLInputElement).value = '0.05';
                  (document.getElementById('data') as HTMLInputElement).value = '0xa9059cbb0000000000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000000000000a';
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Fill Sample Data
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Please select a server wallet to send transactions.
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
        
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gas Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {tx.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {tx.from.slice(0, 10)}...{tx.from.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {tx.to.slice(0, 10)}...{tx.to.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.value} CFX
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tx.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.gasUsed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No transactions yet. Send a transaction to see it here.
          </div>
        )}
      </div>

      {/* Counter Contract Demo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Counter Contract Demo</h2>
        
        {/* Counter Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Current Counter Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-600">Current Count:</span>
              <div className="text-2xl font-bold text-blue-600">
                {counterInfo?.count || '0'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Max Count:</span>
              <div className="text-lg font-semibold text-gray-900">
                {counterInfo?.maxCount || '1,000,000'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Contract Address:</span>
              <div className="text-sm font-mono text-gray-700 break-all">
                {counterInfo?.address || 'Not deployed'}
              </div>
            </div>
          </div>
        </div>

        {/* Counter Operations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4">Single Operations</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={counterValue}
                  onChange={(e) => setCounterValue(e.target.value)}
                  placeholder="Value"
                  className="flex-1 p-2 border border-gray-300 rounded text-black"
                  min="0"
                />
                <button
                  onClick={() => performCounterOperation('add', parseInt(counterValue))}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={counterValue}
                  onChange={(e) => setCounterValue(e.target.value)}
                  placeholder="Value"
                  className="flex-1 p-2 border border-gray-300 rounded text-black"
                  min="0"
                />
                <button
                  onClick={() => performCounterOperation('subtract', parseInt(counterValue))}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Subtract
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={counterValue}
                  onChange={(e) => setCounterValue(e.target.value)}
                  placeholder="Value"
                  className="flex-1 p-2 border border-gray-300 rounded text-black"
                  min="1"
                />
                <button
                  onClick={() => performCounterOperation('multiply', parseInt(counterValue))}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Multiply
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={counterValue}
                  onChange={(e) => setCounterValue(e.target.value)}
                  placeholder="Value"
                  className="flex-1 p-2 border border-gray-300 rounded text-black"
                  min="1"
                />
                <button
                  onClick={() => performCounterOperation('divide', parseInt(counterValue))}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  Divide
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => performCounterOperation('reset')}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                >
                  Reset Counter
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => performCounterOperation('add', 1)}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                +1
              </button>
              <button
                onClick={() => performCounterOperation('add', 10)}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                +10
              </button>
              <button
                onClick={() => performCounterOperation('add', 100)}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                +100
              </button>
              <button
                onClick={() => performCounterOperation('multiply', 2)}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                ×2
              </button>
              <button
                onClick={() => performCounterOperation('divide', 2)}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
              >
                ÷2
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern A Features */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Pattern A Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Server-Side Management</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Centralized wallet creation and management</li>
              <li>• Automated transaction processing</li>
              <li>• Server-controlled private keys</li>
              <li>• Batch transaction processing</li>
              <li>• Advanced security measures</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Use Cases</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Enterprise applications</li>
              <li>• High-frequency trading</li>
              <li>• Automated payment systems</li>
              <li>• Institutional wallets</li>
              <li>• Compliance-heavy environments</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
