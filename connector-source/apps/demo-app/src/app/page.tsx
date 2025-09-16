export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Conflux Dual Wallet System
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Production-ready wallet delegation solution supporting both Conflux eSpace and Core chains
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Web Contract Interface</h2>
          <p className="text-gray-600 mb-4">
            This is a working web interface for interacting with the deployed contracts.
          </p>
          
          <div className="space-y-4">
            <div className="flex space-x-4">
              <a 
                href="/contracts" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Contract Dashboard
              </a>
              <a 
                href="/demo/pattern-a" 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Pattern A Demo
              </a>
              <a 
                href="/demo/pattern-b" 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Pattern B Demo
              </a>
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Server Status</h3>
              <p className="text-sm text-gray-600">
                Server: <span className="font-mono">http://localhost:3001</span>
              </p>
              <p className="text-sm text-gray-600">
                API: <span className="font-mono">http://localhost:3001/api/contracts</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
