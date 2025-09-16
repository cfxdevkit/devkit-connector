import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="error-boundary p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 mb-4">Something went wrong</h2>

          <div className="mb-4">
            <p className="text-red-700 mb-2">
              An error occurred while loading the wallet components. This might be due to:
            </p>
            <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
              <li>Multiple wallet extensions installed (MetaMask, Fluent Wallet, etc.)</li>
              <li>Wallet extension conflicts</li>
              <li>Browser compatibility issues</li>
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-red-800 mb-2">Suggested fixes:</h3>
            <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
              <li>Disable conflicting wallet extensions</li>
              <li>Refresh the page</li>
              <li>Try using only one wallet extension at a time</li>
              <li>Clear browser cache and cookies</li>
            </ul>
          </div>

          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined, errorInfo: undefined });
              window.location.reload();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reload Page
          </button>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 p-4 bg-red-100 border border-red-300 rounded">
              <summary className="font-semibold text-red-800 cursor-pointer">
                Error Details (Development Only)
              </summary>
              <div className="mt-2">
                <p className="text-red-700 font-mono text-sm">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;