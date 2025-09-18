// Hardhat Deployment Status Component - Only renders controls
import React, { useState, useEffect } from 'react';

interface HardhatDeploymentStatusProps {
  status: {
    status: 'idle' | 'compiling' | 'deploying' | 'completed' | 'error';
    progress: number;
    currentStep: string;
    contracts: Array<{
      contractName: string;
      address: string;
      transactionHash: string;
      gasUsed: string;
      deployedAt: string;
      network: string;
    }>;
    errors: string[];
    startTime?: Date;
    endTime?: Date;
  };
  onDeploy: (
    contractNames: string[],
    network: string,
    constructorArgs: { [key: string]: any[] }
  ) => void;
  onCompile: () => void;
  onReset: () => void;
  onLoadDeployments: () => void;
  hardhatActions?: {
    deployContract: (contractName: string, args?: any[]) => Promise<any>;
  };
}

export const HardhatDeploymentStatus: React.FC<
  HardhatDeploymentStatusProps
> = ({ status, onDeploy, onCompile, onReset, onLoadDeployments }) => {
  const [contractNames, setContractNames] = useState<string>(
    'Counter,DelegationManager'
  );
  const [network, setNetwork] = useState<string>('confluxESpaceLocal');
  const [constructorArgs, setConstructorArgs] = useState<string>('{}');

  const handleDeploy = () => {
    const contracts = contractNames
      .split(',')
      .map(name => name.trim())
      .filter(Boolean);
    let args = {};
    try {
      args = JSON.parse(constructorArgs);
    } catch (error) {
      console.error('Invalid constructor args JSON:', error);
      return;
    }
    onDeploy(contracts, network, args);
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'idle':
        return 'text-gray-500';
      case 'compiling':
        return 'text-blue-500';
      case 'deploying':
        return 'text-yellow-500';
      case 'completed':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'idle':
        return '⏸️';
      case 'compiling':
        return '🔨';
      case 'deploying':
        return '🚀';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏸️';
    }
  };

  return (
    <div className="hardhat-deployment-status">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔨</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Hardhat Deployment
              </h3>
              <p className="text-sm text-gray-600">
                Contract compilation and deployment
              </p>
            </div>
          </div>
          <div
            className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${getStatusColor()} bg-opacity-10`}
          >
            <span className="text-3xl animate-pulse">{getStatusIcon()}</span>
            <div>
              <span className="font-semibold capitalize text-lg">
                {status.status}
              </span>
              <div className="text-xs opacity-75">Status</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {status.status !== 'idle' && (
          <div className="mb-6">
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Progress</span>
              <span className="text-blue-600">{status.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${status.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Current Step */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-blue-900">
                {status.currentStep}
              </p>
            </div>
          </div>
        </div>

        {/* Deployment Controls */}
        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Contract Names (comma-separated)
              </label>
              <input
                type="text"
                value={contractNames}
                onChange={e => setContractNames(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Counter,DelegationManager"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Network
              </label>
              <select
                value={network}
                onChange={e => setNetwork(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="confluxESpaceLocal">Conflux eSpace Local</option>
                <option value="confluxESpaceTestnet">
                  Conflux eSpace Testnet
                </option>
                <option value="confluxESpace">Conflux eSpace Mainnet</option>
                <option value="hardhat">Hardhat Network</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Constructor Arguments (JSON)
            </label>
            <textarea
              value={constructorArgs}
              onChange={e => setConstructorArgs(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
              rows={3}
              placeholder='{"Counter": [], "DelegationManager": []}'
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onCompile}
              disabled={
                status.status === 'compiling' || status.status === 'deploying'
              }
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl"
            >
              🔨 Compile
            </button>
            <button
              onClick={handleDeploy}
              disabled={
                status.status === 'compiling' || status.status === 'deploying'
              }
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl"
            >
              🚀 Deploy
            </button>
            <button
              onClick={onLoadDeployments}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              📋 Load Deployments
            </button>
            <button
              onClick={onReset}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Deployed Contracts */}
        {status.contracts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900">
                Deployed Contracts ({status.contracts.length})
              </h4>
            </div>
            <div className="grid gap-4">
              {status.contracts.map((contract, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-xl"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">📄</span>
                        <p className="font-bold text-gray-900 text-lg">
                          {contract.contractName}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Address:</span>
                          <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                            {contract.address}
                          </code>
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Network:</span>{' '}
                          {contract.network}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Gas Used:</span>{' '}
                          {contract.gasUsed}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p className="font-medium">
                        {new Date(contract.deployedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {status.errors.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm">⚠</span>
              </div>
              <h4 className="text-lg font-bold text-red-900">
                Errors ({status.errors.length})
              </h4>
            </div>
            <div className="space-y-3">
              {status.errors.map((error, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 p-4 rounded-xl"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-red-500 text-lg">❌</span>
                    <p className="text-sm text-red-800 font-mono leading-relaxed">
                      {error}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timing Information */}
        {(status.startTime || status.endTime) && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg">⏱️</span>
              <h4 className="text-sm font-semibold text-gray-800">
                Timing Information
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {status.startTime && (
                <div>
                  <p className="text-gray-600 font-medium">Started</p>
                  <p className="text-gray-800 font-mono">
                    {status.startTime.toLocaleString()}
                  </p>
                </div>
              )}
              {status.endTime && (
                <div>
                  <p className="text-gray-600 font-medium">Completed</p>
                  <p className="text-gray-800 font-mono">
                    {status.endTime.toLocaleString()}
                  </p>
                </div>
              )}
              {status.startTime && status.endTime && (
                <div>
                  <p className="text-gray-600 font-medium">Duration</p>
                  <p className="text-gray-800 font-mono">
                    {Math.round(
                      (status.endTime.getTime() - status.startTime.getTime()) /
                        1000
                    )}
                    s
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
