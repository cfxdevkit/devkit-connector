import { useEffect, useState } from 'react';

export function Header() {
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>(
    'checking'
  );

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch (_error) {
        setApiStatus('offline');
      }
    };

    // Check immediately and then every 30 seconds
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <div className="header-content">
        <div>
          <h1>Conflux DevKit Showcase</h1>
          <p className="header-subtitle">Complete UI Ecosystem Demonstration</p>
        </div>
        <div className="status-indicator">
          <div
            className={`status-dot ${apiStatus === 'online' ? '' : 'offline'}`}
          />
          <span>
            API Server:{' '}
            {apiStatus === 'checking'
              ? 'Checking...'
              : apiStatus === 'online'
                ? 'Online'
                : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
}



