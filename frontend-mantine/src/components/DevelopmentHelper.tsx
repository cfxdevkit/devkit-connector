import React, { useState, useEffect } from 'react';
import { requestDeduplicator } from '../utils/requestDeduplication';
import { errorTracker } from '../utils/errorRegistry';

const DevelopmentHelper: React.FC = () => {
  const [requestStats, setRequestStats] = useState<any>({});
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const interval = setInterval(() => {
      const stats = requestDeduplicator.getStats();
      setRequestStats(stats);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  const clearAllCaches = () => {
    requestDeduplicator.clearCache();
    errorTracker.clear();
    console.log('🧹 All caches cleared');
  };

  return (
    <div className="development-helper fixed bottom-4 right-4 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-sm z-50">
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center space-x-2">
          <span>🛠️</span>
          <span className="font-medium">Dev Tools</span>
        </div>
        <span>{showDetails ? '▼' : '▶'}</span>
      </div>

      {showDetails && (
        <div className="border-t border-gray-700 p-3 space-y-3">
          <div>
            <h4 className="font-semibold mb-2 text-blue-300">Request Cache</h4>
            <div className="space-y-1 text-gray-300">
              <div>Pending: {requestStats.pendingRequests || 0}</div>
              <div>Cached: {requestStats.cachedResponses || 0}</div>
              {requestStats.oldestCache && (
                <div>Oldest: {Math.round(requestStats.oldestCache / 1000)}s</div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-red-300">Recent Errors</h4>
            <div className="text-gray-300">
              Count: {errorTracker.getRecentErrors(5).length}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Rate limit errors: {
                errorTracker.getRecentErrors().filter(
                  e => e.details.category === 'RateLimit'
                ).length
              }
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={clearAllCaches}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs"
            >
              Clear All Caches
            </button>

            <button
              onClick={() => {
                console.log('Request Stats:', requestDeduplicator.getStats());
                console.log('Error Stats:', errorTracker.getErrorStats());
                console.log('Recent Errors:', errorTracker.getRecentErrors(10));
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs"
            >
              Log Stats to Console
            </button>

            <button
              onClick={() => {
                const testUrls = [
                  '/api/contracts/status',
                  '/api/contracts/counter/status'
                ];
                console.log('Testing API endpoints...');
                testUrls.forEach(async (url) => {
                  try {
                    const response = await fetch(url);
                    console.log(`${url}: ${response.status} ${response.statusText}`);
                  } catch (error) {
                    console.error(`${url}: Error`, error);
                  }
                });
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1 px-2 rounded text-xs"
            >
              Test API Endpoints
            </button>
          </div>

          <div className="pt-2 border-t border-gray-700">
            <div className="text-gray-400 text-xs">
              <div>React: {React.version}</div>
              <div>Env: {process.env.NODE_ENV}</div>
              <div>Strict Mode: Likely enabled</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevelopmentHelper;