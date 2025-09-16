"use client";

import React, { useState, useEffect } from 'react';

interface Delegation {
  id: number;
  delegator: string;
  delegate: string;
  expiresAt: number;
  dailyLimit: string;
  perTxLimit: string;
  dailySpent: string;
  isActive: boolean;
}

interface DelegatedTransaction {
  id: string;
  delegationId: number;
  from: string;
  to: string;
  value: string;
  data: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed: string;
  blockNumber: number;
  timestamp: string;
  signature: string;
}

export default function PatternBDemo() {
  const [config, setConfig] = useState({
    network: 'localEspace',
    rpcUrl: 'http://localhost:8545'
  });
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [transactions, setTransactions] = useState<DelegatedTransaction[]>([]);
  const [selectedDelegation, setSelectedDelegation] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [userAddress, setUserAddress] = useState<string>('0xFCAd0B19bB29D4674531d6f115237E16AfCE377c');
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [counterInfo, setCounterInfo] = useState<any>(null);
  const [counterValue, setCounterValue] = useState<string>('10');
  const [showDelegationWizard, setShowDelegationWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    delegate: '',
    duration: 7,
    dailyLimit: '1.0',
    perTxLimit: '0.1'
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

  // Load contract info and sample data on mount
  useEffect(() => {
    loadContractInfo();
    loadCounterInfo();
    
    const sampleDelegations: Delegation[] = [
      {
        id: 1,
        delegator: '0xFCAd0B19bB29D4674531d6f115237E16AfCE377c',
        delegate: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        expiresAt: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
        dailyLimit: '1000000000000000000', // 1 CFX in wei
        perTxLimit: '100000000000000000', // 0.1 CFX in wei
        dailySpent: '0',
        isActive: true,
      },
      {
        id: 2,
        delegator: '0xFCAd0B19bB29D4674531d6f115237E16AfCE377c',
        delegate: '0x8bfc6fd9437cf1879fb84aade867b6e81efb5631',
        expiresAt: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
        dailyLimit: '5000000000000000000', // 5 CFX in wei
        perTxLimit: '500000000000000000', // 0.5 CFX in wei
        dailySpent: '200000000000000000', // 0.2 CFX in wei
        isActive: true,
      },
    ];

    const sampleTransactions: DelegatedTransaction[] = [
      {
        id: 'tx_001',
        delegationId: 1,
        from: '0xFCAd0B19bB29D4674531d6f115237E16AfCE377c',
        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        value: '0.05',
        data: '0x',
        status: 'confirmed',
        gasUsed: '21000',
        blockNumber: 12345,
        timestamp: '2024-01-16T14:22:00Z',
        signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      },
      {
        id: 'tx_002',
        delegationId: 2,
        from: '0xFCAd0B19bB29D4674531d6f115237E16AfCE377c',
        to: '0x8bfc6fd9437cf1879fb84aade867b6e81efb5631',
        value: '0.1',
        data: '0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b8d4c9db96c4b4d8b6000000000000000000000000000000000000000000000000000000000000000a',
        status: 'confirmed',
        gasUsed: '45000',
        blockNumber: 12346,
        timestamp: '2024-01-16T09:15:00Z',
        signature: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      },
      {
        id: 'tx_003',
        delegationId: 1,
        from: '0xFCAd0B19bB29D4674531d6f115237E16AfCE377c',
        to: '0x1234567890123456789012345678901234567890',
        value: '0.08',
        data: '0x',
        status: 'pending',
        gasUsed: '0',
        blockNumber: 0,
        timestamp: '2024-01-16T16:30:00Z',
        signature: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
      }
    ];

    setDelegations(sampleDelegations);
    setTransactions(sampleTransactions);
    setSelectedDelegation(1); // Select first delegation by default
  }, []);

  const createDelegation = async (delegate: string, duration: number, dailyLimit: string, perTxLimit: string) => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate delegation creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newDelegation: Delegation = {
        id: Math.max(...delegations.map(d => d.id), 0) + 1,
        delegator: userAddress,
        delegate,
        expiresAt: Math.floor(Date.now() / 1000) + duration * 24 * 60 * 60,
        dailyLimit: (parseFloat(dailyLimit) * 1e18).toString(),
        perTxLimit: (parseFloat(perTxLimit) * 1e18).toString(),
        dailySpent: '0',
        isActive: true,
      };

      setDelegations(prev => [...prev, newDelegation]);
      setError('');
    } catch (err) {
      setError('Failed to create delegation');
    } finally {
      setIsLoading(false);
    }
  };

  const openDelegationWizard = () => {
    setWizardData({
      delegate: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      duration: 7,
      dailyLimit: '1.0',
      perTxLimit: '0.1'
    });
    setWizardStep(1);
    setShowDelegationWizard(true);
  };

  const closeDelegationWizard = () => {
    setShowDelegationWizard(false);
    setWizardStep(1);
  };

  const nextWizardStep = () => {
    if (wizardStep < 3) {
      setWizardStep(wizardStep + 1);
    }
  };

  const prevWizardStep = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    }
  };

  const submitDelegationWizard = async () => {
    await createDelegation(wizardData.delegate, wizardData.duration, wizardData.dailyLimit, wizardData.perTxLimit);
    closeDelegationWizard();
  };

  const revokeDelegation = async (delegationId: number) => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate delegation revocation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDelegations(prev =>
        prev.map(del =>
          del.id === delegationId ? { ...del, isActive: false } : del
        )
      );
      setError('');
    } catch (err) {
      setError('Failed to revoke delegation');
    } finally {
      setIsLoading(false);
    }
  };

  const updateDelegationLimits = async (delegationId: number, newDailyLimit: string, newPerTxLimit: string) => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate limits update
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDelegations(prev =>
        prev.map(del =>
          del.id === delegationId
            ? {
                ...del,
                dailyLimit: (parseFloat(newDailyLimit) * 1e18).toString(),
                perTxLimit: (parseFloat(newPerTxLimit) * 1e18).toString(),
              }
            : del
        )
      );
      setError('');
    } catch (err) {
      setError('Failed to update limits');
    } finally {
      setIsLoading(false);
    }
  };

  const executeDelegatedTransaction = async (to: string, value: string, data: string = '0x') => {
    if (!selectedDelegation) {
      setError('Please select a delegation first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate transaction execution
      const newTransaction: DelegatedTransaction = {
        id: `tx_${Date.now()}`,
        delegationId: selectedDelegation,
        from: delegations.find(d => d.id === selectedDelegation)?.delegator || '',
        to,
        value,
        data,
        status: 'pending',
        gasUsed: '0',
        blockNumber: 0,
        timestamp: new Date().toISOString(),
        signature: '0x' + Math.random().toString(16).substr(2, 130),
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
      setError('Failed to execute transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCFX = (wei: string) => {
    return (parseFloat(wei) / 1e18).toFixed(4);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Pattern B: User-Delegated Wallets
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          User-controlled delegations with configurable limits and automated transaction execution
        </p>
      </div>

      {/* Network Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Network Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">User Address</label>
            <input
              type="text"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              placeholder="0x..."
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

      {/* Delegation Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Delegation Management</h2>
          <button
            onClick={openDelegationWizard}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Delegation'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {delegations.map((delegation) => (
            <div key={delegation.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900">Delegation #{delegation.id}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  delegation.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {delegation.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="font-mono text-xs break-all">
                  <strong>Delegate:</strong> {delegation.delegate}
                </div>
                <div>
                  <strong>Daily Limit:</strong> <span className="font-semibold text-gray-900">{formatCFX(delegation.dailyLimit)} CFX</span>
                </div>
                <div>
                  <strong>Per-Tx Limit:</strong> <span className="font-semibold text-gray-900">{formatCFX(delegation.perTxLimit)} CFX</span>
                </div>
                <div>
                  <strong>Daily Spent:</strong> <span className="font-semibold text-gray-900">{formatCFX(delegation.dailySpent)} CFX</span>
                </div>
                <div>
                  <strong>Expires:</strong> {new Date(delegation.expiresAt * 1000).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setSelectedDelegation(delegation.id)}
                  className={`px-3 py-1 text-xs rounded ${
                    selectedDelegation === delegation.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {selectedDelegation === delegation.id ? 'Selected' : 'Select'}
                </button>
                <button
                  onClick={() => {
                    const newDailyLimit = prompt('Enter new daily limit in CFX:', formatCFX(delegation.dailyLimit));
                    const newPerTxLimit = prompt('Enter new per-transaction limit in CFX:', formatCFX(delegation.perTxLimit));
                    
                    if (newDailyLimit && newPerTxLimit) {
                      updateDelegationLimits(delegation.id, newDailyLimit, newPerTxLimit);
                    }
                  }}
                  disabled={isLoading}
                  className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                >
                  Update Limits
                </button>
                <button
                  onClick={() => revokeDelegation(delegation.id)}
                  disabled={isLoading}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>

        {delegations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No delegations created yet. Click "Create Delegation" to get started.
          </div>
        )}
      </div>

      {/* Delegated Transaction Execution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Delegated Transaction Execution</h2>
        
        {selectedDelegation ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected Delegation:</strong> #{selectedDelegation} - {delegations.find(d => d.id === selectedDelegation)?.delegate.slice(0, 10)}...{delegations.find(d => d.id === selectedDelegation)?.delegate.slice(-6)}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Remaining Daily Limit:</strong> {formatCFX(
                  (parseFloat(delegations.find(d => d.id === selectedDelegation)?.dailyLimit || '0') - 
                   parseFloat(delegations.find(d => d.id === selectedDelegation)?.dailySpent || '0')).toString()
                )} CFX
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
                  defaultValue="0.05"
                  placeholder="0.1"
                  step="0.001"
                  min="0"
                  max={formatCFX(delegations.find(d => d.id === selectedDelegation)?.perTxLimit || '0')}
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
                  executeDelegatedTransaction(to, value, data);
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Executing...' : 'Execute Delegated Transaction'}
              </button>
              <button
                onClick={() => {
                  // Fill with sample data
                  (document.getElementById('to-address') as HTMLInputElement).value = '0x1234567890123456789012345678901234567890';
                  (document.getElementById('value') as HTMLInputElement).value = '0.02';
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
            Please select a delegation to execute transactions.
          </div>
        )}
      </div>

      {/* Delegated Transaction History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Delegated Transaction History</h2>
        
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delegation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signature</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {tx.id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{tx.delegationId}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {tx.signature.slice(0, 10)}...{tx.signature.slice(-6)}
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
            No delegated transactions yet. Execute a transaction to see it here.
          </div>
        )}
      </div>

      {/* Pattern B Features */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Pattern B Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">User-Controlled Delegation</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• User-controlled private keys</li>
              <li>• Configurable spending limits</li>
              <li>• Time-based delegation expiry</li>
              <li>• Real-time limit tracking</li>
              <li>• Signature-based authorization</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Use Cases</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Personal wallet management</li>
              <li>• Family account sharing</li>
              <li>• Business expense management</li>
              <li>• Automated payment systems</li>
              <li>• Multi-signature workflows</li>
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

      {/* Delegation Creation Wizard Modal */}
      {showDelegationWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Delegation</h3>
              <button
                onClick={closeDelegationWizard}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Delegate Address */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delegate Address
                  </label>
                  <input
                    type="text"
                    value={wizardData.delegate}
                    onChange={(e) => setWizardData(prev => ({ ...prev, delegate: e.target.value }))}
                    placeholder="0x..."
                    className="w-full p-2 border border-gray-300 rounded text-black"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The address that will be authorized to spend on your behalf
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={nextWizardStep}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Duration */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delegation Duration (Days)
                  </label>
                  <select
                    value={wizardData.duration}
                    onChange={(e) => setWizardData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded text-black"
                  >
                    <option value={1}>1 Day</option>
                    <option value={7}>7 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={365}>1 Year</option>
                  </select>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevWizardStep}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextWizardStep}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Limits */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Spending Limit (CFX)
                  </label>
                  <input
                    type="number"
                    value={wizardData.dailyLimit}
                    onChange={(e) => setWizardData(prev => ({ ...prev, dailyLimit: e.target.value }))}
                    step="0.1"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Per-Transaction Limit (CFX)
                  </label>
                  <input
                    type="number"
                    value={wizardData.perTxLimit}
                    onChange={(e) => setWizardData(prev => ({ ...prev, perTxLimit: e.target.value }))}
                    step="0.01"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded text-black"
                  />
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <h4 className="font-medium text-blue-900 mb-2">Delegation Summary</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Delegate:</strong> {wizardData.delegate.slice(0, 10)}...{wizardData.delegate.slice(-6)}</p>
                    <p><strong>Duration:</strong> {wizardData.duration} days</p>
                    <p><strong>Daily Limit:</strong> {wizardData.dailyLimit} CFX</p>
                    <p><strong>Per-Tx Limit:</strong> {wizardData.perTxLimit} CFX</p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={prevWizardStep}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Back
                  </button>
                  <button
                    onClick={submitDelegationWizard}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create Delegation'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
    </div>
  );
}
