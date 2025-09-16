"use client";

import React, { useEffect, useState } from 'react';

export default function WebComponentDemo() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load web components dynamically
    const loadWebComponents = async () => {
      try {
        // In a real app, you would load from CDN or bundled assets
        // For demo purposes, we'll simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load web components:', error);
      }
    };

    loadWebComponents();
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading web components...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Web Components Demo
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Interactive Conflux wallet components that work in any framework
        </p>
      </div>

      {/* Web Component Usage Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Delegation Manager Component */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Delegation Manager</h2>
          <p className="text-gray-600 mb-4">
            Manage wallet delegations with a fully functional web component.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Usage:</h3>
            <pre className="text-sm text-gray-700 overflow-x-auto">
{`<delegation-manager
  network="confluxEspaceTestnet"
  user-address="0x..."
  theme="light"
  auto-refresh="true"
  refresh-interval="30000"
  debug="true">
</delegation-manager>`}
            </pre>
          </div>

          {/* Live Component */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <delegation-manager
              network="confluxEspaceTestnet"
              user-address="0x742d35Cc6634C0532925a3b8D0C0C4C4C4C4C4C4"
              theme="light"
              auto-refresh="true"
              refresh-interval="30000"
              debug="true">
            </delegation-manager>
          </div>
        </div>

        {/* Transaction Executor Component */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Transaction Executor</h2>
          <p className="text-gray-600 mb-4">
            Execute transactions through delegation with advanced options.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Usage:</h3>
            <pre className="text-sm text-gray-700 overflow-x-auto">
{`<transaction-executor
  network="confluxEspaceTestnet"
  delegation-id="1"
  theme="light"
  auto-sign="false"
  show-advanced="true"
  debug="true">
</transaction-executor>`}
            </pre>
          </div>

          {/* Live Component */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <transaction-executor
              network="confluxEspaceTestnet"
              delegation-id="1"
              theme="light"
              auto-sign="false"
              show-advanced="true"
              debug="true">
            </transaction-executor>
          </div>
        </div>
      </div>

      {/* Framework Integration Examples */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Framework Integration</h2>
        <p className="text-gray-600 mb-6">
          These components work seamlessly with any framework or vanilla JavaScript.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* React Integration */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">React</h3>
            <pre className="text-sm text-gray-700 overflow-x-auto">
{`import { useEffect, useRef } from 'react';

function MyComponent() {
  const delegationRef = useRef(null);
  
  useEffect(() => {
    if (delegationRef.current) {
      delegationRef.current.addEventListener(
        'delegation-created',
        (e) => console.log('Delegation created:', e.detail)
      );
    }
  }, []);
  
  return (
    <delegation-manager
      ref={delegationRef}
      network="confluxEspaceTestnet"
      user-address="0x..."
    />
  );
}`}
            </pre>
          </div>

          {/* Vue Integration */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Vue</h3>
            <pre className="text-sm text-gray-700 overflow-x-auto">
{`<template>
  <delegation-manager
    ref="delegationManager"
    network="confluxEspaceTestnet"
    user-address="userAddress"
    @delegation-created="onDelegationCreated"
  />
</template>

<script>
export default {
  methods: {
    onDelegationCreated(event) {
      console.log('Delegation created:', event.detail);
    }
  }
}
</script>`}
            </pre>
          </div>

          {/* Vanilla JS Integration */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Vanilla JS</h3>
            <pre className="text-sm text-gray-700 overflow-x-auto">
{`// Create component programmatically
const delegationManager = document.createElement('delegation-manager');
delegationManager.setAttribute('network', 'confluxEspaceTestnet');
delegationManager.setAttribute('user-address', '0x...');

// Listen for events
delegationManager.addEventListener('delegation-created', (e) => {
  console.log('Delegation created:', e.detail);
});

// Add to DOM
document.body.appendChild(delegationManager);`}
            </pre>
          </div>
        </div>
      </div>

      {/* Event System Documentation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Event System</h2>
        <p className="text-gray-600 mb-4">
          Components emit custom events for integration with your application.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Delegation Manager Events</h3>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-gray-100 px-2 py-1 rounded">delegation-created</code> - When a new delegation is created</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">delegation-revoked</code> - When a delegation is revoked</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">limits-updated</code> - When delegation limits are updated</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">contract-error</code> - When a contract operation fails</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Transaction Executor Events</h3>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-gray-100 px-2 py-1 rounded">transaction-executed</code> - When a transaction is executed</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">execution-checked</code> - When execution feasibility is checked</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">form-validated</code> - When form validation occurs</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">contract-error</code> - When a contract operation fails</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Styling and Theming */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Styling and Theming</h2>
        <p className="text-gray-600 mb-4">
          Components support theming and can be styled with CSS custom properties.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Available Themes</h3>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-gray-100 px-2 py-1 rounded">light</code> - Light theme (default)</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">dark</code> - Dark theme</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">CSS Custom Properties</h3>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-gray-100 px-2 py-1 rounded">--primary-color</code> - Primary brand color</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">--background-color</code> - Background color</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">--text-color</code> - Text color</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">--border-color</code> - Border color</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
