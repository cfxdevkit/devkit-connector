import React, { useState } from "react";
import { useServerWallet } from "../hooks/useServerWallet";
import { useBrowserWallet } from "../hooks/useBrowserWallet";

const WalletTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Server wallet hook
  const serverWallet = useServerWallet();
  const {
    mode: serverMode,
    eSpaceAddress: serverESpaceAddress,
    coreAddress: serverCoreAddress,
    isLoading: serverLoading,
    error: serverError,
    isConnected: serverConnected,
    loadWallet: loadServerWallet,
    createDelegationSession,
  } = serverWallet;

  // Browser wallet hook
  const {
    wallet: browserWallet,
    isLoading: browserLoading,
    error: browserError,
    connect: connectBrowserWallet,
    delegateToServer,
  } = useBrowserWallet();

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testServerWallet = async () => {
    setIsLoading(true);
    addResult("🔄 Testing server wallet connection...");

    try {
      await loadServerWallet();
      addResult("✅ Server wallet connected successfully!");
      addResult(`📍 eSpace Address: ${serverESpaceAddress}`);
      addResult(`📍 Core Address: ${serverCoreAddress}`);
      addResult(`🆔 Wallet ID: ${serverWallet.walletId || "N/A"}`);
    } catch (error) {
      addResult(
        `❌ Server wallet failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    setIsLoading(false);
  };

  const testBrowserWallet = async () => {
    setIsLoading(true);
    addResult("🔄 Testing browser wallet connection...");

    try {
      await connectBrowserWallet();
      addResult("✅ Browser wallet connected successfully!");
      if (browserWallet) {
        addResult(`📍 Address: ${browserWallet.address}`);
        addResult(`🔗 Chain ID: ${browserWallet.chainId}`);
        addResult(`🔌 Connector: ${browserWallet.connector || "Unknown"}`);
      }
    } catch (error) {
      addResult(
        `❌ Browser wallet failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    setIsLoading(false);
  };

  const testBrowserDelegation = async () => {
    if (!browserWallet?.address) {
      addResult("❌ Connect browser wallet first");
      return;
    }

    if (!serverESpaceAddress) {
      addResult("❌ Server wallet not available. Load server wallet first.");
      return;
    }

    setIsLoading(true);
    addResult("🔄 Testing browser wallet delegation...");
    addResult(`🎯 Delegating to server address: ${serverESpaceAddress}`);

    try {
      const sessionId = await delegateToServer(serverESpaceAddress, {
        limit: "1000000000000000000", // 1 ETH
        sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
        allowedOperations: ["sign_transaction", "sign_message"],
      });
      addResult(`✅ Browser wallet delegated! Session: ${sessionId}`);
      addResult(`🔗 Delegation active for 24 hours`);
    } catch (error) {
      addResult(
        `❌ Browser delegation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Wallet Connection Test
      </h1>

      {/* Server Wallet Section */}
      <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">
          🖥️ Server-Managed Wallet
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="text-sm">
                {serverLoading
                  ? "⏳ Loading..."
                  : serverConnected
                    ? "✅ Connected"
                    : serverError
                      ? "❌ Error"
                      : "⏸️ Not Connected"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mode
              </label>
              <div className="text-sm">{serverMode || "None"}</div>
            </div>
          </div>

          {serverESpaceAddress && (
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  eSpace Address
                </label>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded">
                  {serverESpaceAddress}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Core Address
                </label>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded">
                  {serverCoreAddress}
                </div>
              </div>
            </div>
          )}

          {serverError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {serverError}
            </div>
          )}

          <button
            onClick={testServerWallet}
            disabled={isLoading || serverLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {serverLoading ? "Testing..." : "Test Server Wallet"}
          </button>
        </div>
      </div>

      {/* Browser Wallet Section */}
      <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
        <h2 className="text-xl font-semibold mb-4 text-green-800">
          🌐 Browser Wallet
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="text-sm">
                {browserLoading
                  ? "⏳ Loading..."
                  : browserWallet
                    ? "✅ Connected"
                    : browserError
                      ? "❌ Error"
                      : "⏸️ Not Connected"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Connector
              </label>
              <div className="text-sm">
                {browserWallet?.connector || "None"}
              </div>
            </div>
          </div>

          {browserWallet && (
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded">
                  {browserWallet.address}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Chain ID
                </label>
                <div className="text-sm">{browserWallet.chainId}</div>
              </div>
            </div>
          )}

          {browserError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {browserError}
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={testBrowserWallet}
              disabled={isLoading || browserLoading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {browserLoading ? "Testing..." : "Test Browser Wallet"}
            </button>

            {browserWallet && (
              <button
                onClick={testBrowserDelegation}
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                Test Delegation to Server
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            📊 Test Results
          </h2>
          <button
            onClick={clearResults}
            className="bg-gray-600 text-white py-1 px-3 rounded text-sm hover:bg-gray-700"
          >
            Clear
          </button>
        </div>

        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <div className="text-gray-500">No tests run yet...</div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      {/* API Test */}
      <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
        <h2 className="text-xl font-semibold mb-4 text-yellow-800">
          🔧 API Test
        </h2>
        <button
          onClick={() => {
            addResult("🔄 Testing API connection...");
            fetch("http://localhost:3001/health")
              .then((response) => response.json())
              .then((data) =>
                addResult(`✅ API Health: ${JSON.stringify(data)}`)
              )
              .catch((error) => addResult(`❌ API Error: ${error.message}`));
          }}
          className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700"
        >
          Test API Connection
        </button>
      </div>
    </div>
  );
};

export default WalletTest;
