import { useState } from 'react';
import { networkManager } from '@conflux-devkit/blockchain/browser';
import type { BrowserNetworkConfig } from '@conflux-devkit/core';

interface NetworkSelectionProps {
  currentNetwork: BrowserNetworkConfig | null;
  onNetworkChange: (networkId: string) => void;
  isSwitching?: boolean;
}

export function NetworkSelection({
  currentNetwork,
  onNetworkChange,
  isSwitching = false,
}: NetworkSelectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const availableNetworks = networkManager.getAllNetworks().map(network => {
    const displayInfo = networkManager.getNetworkDisplayInfo(network);
    return {
      id: displayInfo.id,
      name: displayInfo.name,
      chainId: displayInfo.chainId,
      evmChainId: displayInfo.evmChainId,
      isTestnet: displayInfo.isTestnet,
      networkType: displayInfo.type,
      rpcUrl: displayInfo.rpcUrl,
    };
  });

  const handleNetworkSelect = async (networkId: string) => {
    try {
      await onNetworkChange(networkId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  return (
    <div className="network-selection">
      <div className="network-selector">
        <button
          className={`network-button ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSwitching}
        >
          <div className="network-info">
            <span className="network-name">
              {currentNetwork?.name || 'Select Network'}
            </span>
            <span className="network-chain-id">
              {currentNetwork ? `Chain ID: ${currentNetwork.chainId}` : ''}
            </span>
          </div>
          <span className="network-arrow">
            {isSwitching ? '⏳' : isOpen ? '▲' : '▼'}
          </span>
        </button>

        {isOpen && (
          <div className="network-dropdown">
            <div className="network-list">
              {availableNetworks.map(network => (
                <button
                  key={network.id}
                  className={`network-option ${
                    currentNetwork?.chainId === network.chainId.toString()
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => handleNetworkSelect(network.id)}
                >
                  <div className="network-option-info">
                    <span className="network-option-name">{network.name}</span>
                    <span className="network-option-details">
                      {network.networkType.toUpperCase()} • Chain ID:{' '}
                      {network.chainId}
                      {network.evmChainId && ` • EVM: ${network.evmChainId}`}
                    </span>
                  </div>
                  <span className="network-option-status">
                    {network.isTestnet ? '🧪' : '🔗'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Network Selection Styles
const networkStyles = `
.network-selection {
  position: relative;
  display: inline-block;
}

.network-selector {
  position: relative;
}

.network-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 200px;
  font-size: 0.875rem;
}

.network-button:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.network-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.network-button.open {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.network-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.network-name {
  font-weight: 600;
  color: #2d3748;
}

.network-chain-id {
  font-size: 0.75rem;
  color: #6b7280;
}

.network-arrow {
  font-size: 0.75rem;
  color: #6b7280;
  transition: transform 0.2s;
}

.network-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 0.25rem;
  max-height: 300px;
  overflow-y: auto;
}

.network-list {
  padding: 0.5rem;
}

.network-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.network-option:hover {
  background: #f7fafc;
}

.network-option.active {
  background: #dbeafe;
  color: #1e40af;
}

.network-option-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.network-option-name {
  font-weight: 500;
  color: #2d3748;
}

.network-option-details {
  font-size: 0.75rem;
  color: #6b7280;
}

.network-option-status {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .network-button {
    min-width: 150px;
  }
  
  .network-dropdown {
    right: -1rem;
    left: -1rem;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = networkStyles;
  document.head.appendChild(styleSheet);
}
