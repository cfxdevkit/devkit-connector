import { useEffect, useState } from 'react';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export function ApiIntegration() {
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>(
    'checking'
  );
  const [apiData, setApiData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        setApiStatus('online');
        return true;
      } else {
        setApiStatus('offline');
        return false;
      }
    } catch (_error) {
      setApiStatus('offline');
      return false;
    }
  };

  const fetchApiData = async (endpoint: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api${endpoint}`);
      const data: ApiResponse = await response.json();

      if (data.success) {
        setApiData((prev) => ({ ...prev, [endpoint]: data.data }));
      } else {
        setError(data.error || data.message || 'API request failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllData = async () => {
    const endpoints = [
      '/health',
      '/contracts',
      '/wallets',
      '/node/status',
      '/network/current',
      '/system/status',
    ];

    for (const endpoint of endpoints) {
      await fetchApiData(endpoint);
    }
  };

  useEffect(() => {
    checkApiStatus();
    fetchAllData();

    // Check API status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, [checkApiStatus, fetchAllData]);

  const apiEndpoints = [
    {
      path: '/health',
      name: 'Health Check',
      description: 'API server health status',
    },
    {
      path: '/contracts',
      name: 'Contracts',
      description: 'Deployed contracts list',
    },
    { path: '/wallets', name: 'Wallets', description: 'Available wallets' },
    {
      path: '/node/status',
      name: 'Node Status',
      description: 'Conflux node status',
    },
    {
      path: '/network/current',
      name: 'Current Network',
      description: 'Active network configuration',
    },
    {
      path: '/system/status',
      name: 'System Status',
      description: 'Overall system health',
    },
  ];

  return (
    <div className="dashboard-grid">
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">🔗</span>
            API Integration
          </h3>
          <span className={`status-badge status-${apiStatus}`}>
            {apiStatus === 'checking'
              ? 'Checking...'
              : apiStatus === 'online'
                ? 'Online'
                : 'Offline'}
          </span>
        </div>
        <div className="card-content">
          <div className="api-controls">
            <button
              className="btn btn-primary"
              onClick={fetchAllData}
              disabled={isLoading || apiStatus === 'offline'}
            >
              {isLoading ? <span className="spinner" /> : '🔄'}
              Refresh All Data
            </button>
            <button
              className="btn btn-secondary"
              onClick={checkApiStatus}
              disabled={isLoading}
            >
              Check Status
            </button>
          </div>

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">📊</span>
            API Endpoints
          </h3>
        </div>
        <div className="card-content">
          <div className="endpoint-list">
            {apiEndpoints.map((endpoint, index) => (
              <div key={index} className="endpoint-item">
                <div className="endpoint-info">
                  <div className="endpoint-name">{endpoint.name}</div>
                  <div className="endpoint-path">{endpoint.path}</div>
                  <div className="endpoint-description">
                    {endpoint.description}
                  </div>
                </div>
                <div className="endpoint-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => fetchApiData(endpoint.path)}
                    disabled={isLoading || apiStatus === 'offline'}
                  >
                    Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-card full-width">
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">📋</span>
            API Response Data
          </h3>
        </div>
        <div className="card-content">
          {Object.keys(apiData).length > 0 ? (
            <div className="api-data">
              {Object.entries(apiData).map(([endpoint, data]) => (
                <div key={endpoint} className="api-data-item">
                  <h4 className="data-endpoint">{endpoint}</h4>
                  <pre className="data-content">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>No API data available</p>
              <p className="text-muted">
                Click "Refresh All Data" to fetch API responses
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-card full-width">
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">💻</span>
            Code Examples
          </h3>
        </div>
        <div className="card-content">
          <div className="code-examples">
            <div className="code-example">
              <h4>Fetch API Data</h4>
              <pre className="code-block">
                {`// Health check
const health = await fetch('/api/health').then(r => r.json());

// Get contracts
const contracts = await fetch('/api/contracts').then(r => r.json());

// Get wallets
const wallets = await fetch('/api/wallets').then(r => r.json());

// Get node status
const nodeStatus = await fetch('/api/node/status').then(r => r.json());`}
              </pre>
            </div>

            <div className="code-example">
              <h4>Error Handling</h4>
              <pre className="code-block">
                {`try {
  const response = await fetch('/api/contracts');
  const data = await response.json();
  
  if (data.success) {
    console.log('Contracts:', data.data);
  } else {
    console.error('API Error:', data.error);
  }
} catch (error) {
  console.error('Network Error:', error);
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Additional styles for API integration
const apiStyles = `
.api-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.endpoint-list {
  display: grid;
  gap: 0.75rem;
}

.endpoint-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.endpoint-info {
  flex: 1;
}

.endpoint-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.endpoint-path {
  font-family: monospace;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.endpoint-description {
  color: #9ca3af;
  font-size: 0.75rem;
}

.endpoint-actions {
  display: flex;
  align-items: center;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.api-data {
  display: grid;
  gap: 1rem;
}

.api-data-item {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.data-endpoint {
  background: #2d3748;
  color: white;
  padding: 0.75rem 1rem;
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.data-content {
  padding: 1rem;
  margin: 0;
  background: white;
  color: #2d3748;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
}

.no-data {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

.text-muted {
  color: #9ca3af;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.code-examples {
  display: grid;
  gap: 1.5rem;
}

.code-example h4 {
  margin-bottom: 0.75rem;
  color: #2d3748;
  font-size: 1rem;
}

.code-block {
  background: #2d3748;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  overflow-x: auto;
  margin: 0;
}

.full-width {
  grid-column: 1 / -1;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = apiStyles;
  document.head.appendChild(styleSheet);
}



