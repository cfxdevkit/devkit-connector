'use client';

import React, { useState, useEffect } from 'react';

interface ContractDashboardProps {
  serverUrl?: string;
}

export function ContractDashboard({ serverUrl = 'http://localhost:3001' }: ContractDashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHealthy, setIsHealthy] = useState(false);
  const [contractStatus, setContractStatus] = useState<any>(null);
  const [networkInfo, setNetworkInfo] = useState<any>(null);

  const [delegateAddress, setDelegateAddress] = useState('');
  const [delegationLimit, setDelegationLimit] = useState('');
  const [delegatorAddress, setDelegatorAddress] = useState('');
  const [lastResult, setLastResult] = useState<any>(null);

  // API functions
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${serverUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      return await response.json();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const refreshStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const statusResponse = await apiCall('/api/contracts/status');
      if (statusResponse.success && statusResponse.data) {
        setContractStatus(statusResponse.data.contracts);
        setNetworkInfo(statusResponse.data.networks);
      } else {
        setError(statusResponse.error || 'Failed to load contract status');
      }
      
      const healthResponse = await apiCall('/health');
      setIsHealthy(healthResponse.status === 'healthy');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Load initial status
  useEffect(() => {
    refreshStatus();
  }, []);

  const handleCreateEspaceDelegation = async () => {
    if (!delegateAddress || !delegationLimit) return;
    
    setIsLoading(true);
    try {
      const result = await apiCall('/api/contracts/espace/create-delegation', {
        method: 'POST',
        body: JSON.stringify({
          delegate: delegateAddress,
          limit: delegationLimit
        })
      });
      setLastResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCoreDelegation = async () => {
    if (!delegateAddress || !delegationLimit) return;
    
    setIsLoading(true);
    try {
      const result = await apiCall('/api/contracts/core/create-delegation', {
        method: 'POST',
        body: JSON.stringify({
          delegate: delegateAddress,
          limit: delegationLimit
        })
      });
      setLastResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeEspaceDelegation = async () => {
    setIsLoading(true);
    try {
      const result = await apiCall('/api/contracts/espace/revoke-delegation', {
        method: 'POST'
      });
      setLastResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeCoreDelegation = async () => {
    setIsLoading(true);
    try {
      const result = await apiCall('/api/contracts/core/revoke-delegation', {
        method: 'POST'
      });
      setLastResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetEspaceDelegation = async () => {
    if (!delegatorAddress) return;
    
    setIsLoading(true);
    try {
      const result = await apiCall(`/api/contracts/espace/get-delegation/${delegatorAddress}`);
      setLastResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCoreDelegation = async () => {
    if (!delegatorAddress) return;
    
    setIsLoading(true);
    try {
      const result = await apiCall(`/api/contracts/core/get-delegation/${delegatorAddress}`);
      setLastResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetEspaceOwner = async () => {
    setIsLoading(true);
    try {
      const result = await apiCall('/api/contracts/espace/owner');
      setLastResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCoreOwner = async () => {
    setIsLoading(true);
    try {
      const result = await apiCall('/api/contracts/core/owner');
      setLastResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Contract Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isHealthy ? '🟢 Healthy' : '🔴 Unhealthy'}
            </div>
            <button
              onClick={refreshStatus}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Contract Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">eSpace Contract</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  contractStatus?.espace.deployed ? 'text-green-600' : 'text-red-600'
                }`}>
                  {contractStatus?.espace.deployed ? 'Deployed' : 'Not Deployed'}
                </span>
              </div>
              {contractStatus?.espace.address && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-mono text-sm text-blue-600">
                    {contractStatus.espace.address.slice(0, 10)}...{contractStatus.espace.address.slice(-8)}
                  </span>
                </div>
              )}
              {contractStatus?.espace.mock && (
                <div className="text-yellow-600 text-sm">⚠️ Mock Response</div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Core Contract</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  contractStatus?.core.deployed ? 'text-green-600' : 'text-red-600'
                }`}>
                  {contractStatus?.core.deployed ? 'Deployed' : 'Not Deployed'}
                </span>
              </div>
              {contractStatus?.core.address && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-mono text-sm text-blue-600">
                    {contractStatus.core.address.slice(0, 10)}...{contractStatus.core.address.slice(-8)}
                  </span>
                </div>
              )}
              {contractStatus?.core.mock && (
                <div className="text-yellow-600 text-sm">⚠️ Mock Response</div>
              )}
            </div>
          </div>
        </div>

        {/* Network Info */}
        {networkInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">eSpace Network</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Chain ID:</span>
                  <span className="font-mono">{networkInfo.espace.chainId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Block Number:</span>
                  <span className="font-mono">{networkInfo.espace.blockNumber.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gas Price:</span>
                  <span className="font-mono">{networkInfo.espace.gasPrice} wei</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Core Network</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Network ID:</span>
                  <span className="font-mono">{networkInfo.core.networkId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Epoch Number:</span>
                  <span className="font-mono">{networkInfo.core.epochNumber.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contract Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* eSpace Operations */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">eSpace Operations</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delegate Address
                </label>
                <input
                  type="text"
                  value={delegateAddress}
                  onChange={(e) => setDelegateAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delegation Limit (wei)
                </label>
                <input
                  type="text"
                  value={delegationLimit}
                  onChange={(e) => setDelegationLimit(e.target.value)}
                  placeholder="1000000000000000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleCreateEspaceDelegation}
                  disabled={isLoading || !delegateAddress || !delegationLimit}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Create Delegation
                </button>
                <button
                  onClick={handleRevokeEspaceDelegation}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Revoke Delegation
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delegator Address (for lookup)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={delegatorAddress}
                    onChange={(e) => setDelegatorAddress(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                  <button
                    onClick={handleGetEspaceDelegation}
                    disabled={isLoading || !delegatorAddress}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Get
                  </button>
                </div>
              </div>

              <button
                onClick={handleGetEspaceOwner}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Get Owner
              </button>
            </div>
          </div>

          {/* Core Operations */}
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Core Operations</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delegate Address
                </label>
                <input
                  type="text"
                  value={delegateAddress}
                  onChange={(e) => setDelegateAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delegation Limit (wei)
                </label>
                <input
                  type="text"
                  value={delegationLimit}
                  onChange={(e) => setDelegationLimit(e.target.value)}
                  placeholder="1000000000000000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleCreateCoreDelegation}
                  disabled={isLoading || !delegateAddress || !delegationLimit}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Create Delegation
                </button>
                <button
                  onClick={handleRevokeCoreDelegation}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Revoke Delegation
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delegator Address (for lookup)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={delegatorAddress}
                    onChange={(e) => setDelegatorAddress(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black"
                  />
                  <button
                    onClick={handleGetCoreDelegation}
                    disabled={isLoading || !delegatorAddress}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Get
                  </button>
                </div>
              </div>

              <button
                onClick={handleGetCoreOwner}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Get Owner
              </button>
            </div>
          </div>
        </div>

        {/* Last Result */}
        {lastResult && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Last Result</h3>
            <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
