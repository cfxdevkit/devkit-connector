import { useState } from 'react';
import { ApiIntegration } from './ApiIntegration';
import { ContractManagement } from './ContractManagement';
import { NetworkControl } from './NetworkControl';
import { NodeControl } from './NodeControl';
import { WalletManagement } from './WalletManagement';

type TabType =
  | 'overview'
  | 'node'
  | 'wallets'
  | 'contracts'
  | 'network'
  | 'api';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: '📊' },
    { id: 'node' as TabType, label: 'Node Control', icon: '🖥️' },
    { id: 'wallets' as TabType, label: 'Wallets', icon: '👛' },
    { id: 'contracts' as TabType, label: 'Contracts', icon: '📦' },
    { id: 'network' as TabType, label: 'Network', icon: '🌐' },
    { id: 'api' as TabType, label: 'API Integration', icon: '🔗' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-placeholder">
            Overview content will be here
          </div>
        );
      case 'node':
        return <NodeControl />;
      case 'wallets':
        return <WalletManagement />;
      case 'contracts':
        return <ContractManagement />;
      case 'network':
        return <NetworkControl />;
      case 'api':
        return <ApiIntegration />;
      default:
        return (
          <div className="overview-placeholder">
            Overview content will be here
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">🚀 Conflux DevKit Showcase</h1>
        <p className="dashboard-subtitle">
          Complete UI Ecosystem Demonstration with Full State Management
        </p>
      </div>

      <div className="tab-navigation">
        <div className="tab-list">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
}

// Tab Navigation Styles
const tabStyles = `
.tab-navigation {
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.tab-list {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 500;
}

.tab-button:hover {
  background: #f7fafc;
  color: #4a5568;
}

.tab-button.active {
  background: #3b82f6;
  color: white;
}

.tab-icon {
  font-size: 1rem;
}

.tab-label {
  font-weight: 500;
}

.tab-content {
  min-height: 400px;
}

@media (max-width: 768px) {
  .tab-list {
    flex-wrap: wrap;
  }
  
  .tab-button {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = tabStyles;
  document.head.appendChild(styleSheet);
}
