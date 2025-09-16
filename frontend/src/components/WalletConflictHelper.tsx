import React, { useState } from 'react';

const WalletConflictHelper: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-blue-600 mr-2">ℹ️</span>
        <h3 className="text-blue-800 font-medium">Having wallet extension issues?</h3>
        <span className="ml-auto text-blue-600 text-sm">
          {isExpanded ? '▼ Hide' : '▶ Show Help'}
        </span>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Common Issues & Solutions:</h4>

            <div className="space-y-3">
              <div className="bg-white p-3 rounded border">
                <p className="font-medium text-red-700">❌ Error: "Cannot redefine property: conflux"</p>
                <p className="text-sm text-gray-600 mt-1">
                  This happens when multiple Conflux-related wallet extensions are installed.
                </p>
                <div className="mt-2">
                  <p className="font-medium text-green-700">✅ Solutions:</p>
                  <ul className="text-sm text-gray-600 mt-1 ml-4 list-disc space-y-1">
                    <li>Disable Fluent Wallet extension temporarily</li>
                    <li>Or disable other Conflux wallet extensions</li>
                    <li>Keep only one Conflux wallet extension enabled</li>
                    <li>Refresh the page after disabling extensions</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-3 rounded border">
                <p className="font-medium text-blue-700">🔧 How to disable extensions:</p>
                <ol className="text-sm text-gray-600 mt-1 ml-4 list-decimal space-y-1">
                  <li>Go to Chrome → More Tools → Extensions</li>
                  <li>Find conflicting wallet extensions</li>
                  <li>Toggle OFF the extensions you don't need</li>
                  <li>Refresh this page</li>
                </ol>
              </div>

              <div className="bg-white p-3 rounded border">
                <p className="font-medium text-purple-700">💡 Recommended Setup:</p>
                <ul className="text-sm text-gray-600 mt-1 ml-4 list-disc space-y-1">
                  <li><strong>For Conflux:</strong> Use Fluent Wallet only</li>
                  <li><strong>For Ethereum:</strong> Use MetaMask only</li>
                  <li><strong>For both:</strong> Enable one at a time as needed</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This app includes conflict prevention scripts, but some conflicts
              occur at the browser extension level before our code loads.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConflictHelper;