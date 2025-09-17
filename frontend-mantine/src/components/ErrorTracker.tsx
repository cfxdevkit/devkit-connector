import React, { useState, useEffect } from 'react';
import { errorTracker, ApplicationError } from '../utils/errorRegistry';

interface ErrorTrackerProps {
  maxErrors?: number;
  showDetails?: boolean;
}

const ErrorTracker: React.FC<ErrorTrackerProps> = ({
  maxErrors = 5,
  showDetails = false
}) => {
  const [errors, setErrors] = useState<ApplicationError[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Update errors every few seconds
    const interval = setInterval(() => {
      const recentErrors = errorTracker.getRecentErrors(maxErrors);
      setErrors(recentErrors);
    }, 2000);

    return () => clearInterval(interval);
  }, [maxErrors]);

  if (errors.length === 0) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-100';
      case 'high': return 'text-red-700 bg-red-50';
      case 'medium': return 'text-yellow-700 bg-yellow-50';
      case 'low': return 'text-blue-700 bg-blue-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Network': return '🌐';
      case 'API': return '📡';
      case 'RateLimit': return '⏱️';
      case 'Wallet': return '💰';
      case 'Contract': return '📋';
      case 'Auth': return '🔐';
      case 'Validation': return '✅';
      case 'Application': return '⚙️';
      default: return '❓';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const clearErrors = () => {
    errorTracker.clear();
    setErrors([]);
  };

  return (
    <div className="error-tracker border border-gray-200 rounded-lg bg-white shadow-sm">
      <div
        className="flex items-center justify-between p-3 cursor-pointer bg-gray-50 rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-red-500">🚨</span>
          <h3 className="font-medium text-gray-800">
            Error Tracker ({errors.length})
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearErrors();
            }}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
          >
            Clear
          </button>
          <span className="text-gray-500 text-sm">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
          {errors.map((error, index) => (
            <div
              key={`${error.details.code}-${error.details.timestamp}-${index}`}
              className="border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCategoryIcon(error.details.category)}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm text-gray-600">
                        #{error.details.code}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(error.details.severity)}`}>
                        {error.details.severity}
                      </span>
                      <span className="text-xs text-gray-500">
                        {error.details.category}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mt-1">
                      {error.details.userMessage}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {formatTimestamp(error.details.timestamp)}
                </span>
              </div>

              {showDetails && (
                <div className="mt-2 space-y-2">
                  <div className="text-xs text-gray-600">
                    <strong>Technical:</strong> {error.details.message}
                  </div>

                  {error.details.suggestions.length > 0 && (
                    <div className="text-xs">
                      <strong className="text-gray-700">Suggestions:</strong>
                      <ul className="list-disc list-inside mt-1 text-gray-600">
                        {error.details.suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {error.details.context && Object.keys(error.details.context).length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-700 font-medium">
                        Context
                      </summary>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-gray-600 overflow-x-auto">
                        {JSON.stringify(error.details.context, null, 2)}
                      </pre>
                    </details>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Retryable: {error.details.retryable ? '✅ Yes' : '❌ No'}</span>
                    <span>Timestamp: {new Date(error.details.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={() => {
                const stats = errorTracker.getErrorStats();
                console.log('Error Statistics:', stats);
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              📊 Log Error Statistics to Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorTracker;