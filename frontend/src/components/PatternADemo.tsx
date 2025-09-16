import React, { useState, useEffect } from "react";

interface ContractStatus {
  espace: {
    deployed: boolean;
    address?: string;
    mock: boolean;
  };
  core: {
    deployed: boolean;
    address?: string;
    mock: boolean;
  };
}

interface CounterStatus {
  count: string;
  maxCount: string;
  address: string;
}

interface CounterOperation {
  operation: string;
  value?: number;
  values?: number[];
  newCount: string;
}

const PatternADemo: React.FC = () => {
  // State management
  const [contractStatus, setContractStatus] = useState<ContractStatus | null>(
    null
  );
  const [counterStatus, setCounterStatus] = useState<CounterStatus | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Counter operation state
  const [operationValue, setOperationValue] = useState<string>("");
  const [batchValues, setBatchValues] = useState<string>("");

  // Load contract status
  const loadContractStatus = async () => {
    try {
      const response = await fetch("/api/contracts/status");
      const data = await response.json();

      if (data.success) {
        setContractStatus(data.data);
      } else {
        setError(data.error || "Failed to load contract status");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  // Load counter status
  const loadCounterStatus = async () => {
    try {
      const response = await fetch("/api/contracts/counter/status");
      const data = await response.json();

      if (data.success) {
        setCounterStatus(data.data);
      } else {
        setError(data.error || "Failed to load counter status");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  // Perform counter operation
  const performCounterOperation = async (
    operation: string,
    value?: number,
    values?: number[]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/contracts/counter/operation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ operation, value, values }),
      });

      const data = await response.json();

      if (data.success) {
        // Reload counter status
        await loadCounterStatus();
      } else {
        setError(data.error || "Operation failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Handle single operations
  const handleSingleOperation = (operation: string) => {
    const value = parseInt(operationValue);
    if (isNaN(value) || value <= 0) {
      setError("Please enter a valid positive number");
      return;
    }
    performCounterOperation(operation, value);
  };

  // Handle batch operations
  const handleBatchOperation = (operation: string) => {
    const values = batchValues
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v) && v > 0);

    if (values.length === 0) {
      setError("Please enter valid numbers separated by commas");
      return;
    }
    performCounterOperation(operation, undefined, values);
  };

  // Load data on component mount
  useEffect(() => {
    loadContractStatus();
    loadCounterStatus();
  }, []);

  return (
    <div className="minimal-pattern-a">
      <div className="container">
        <h1>Contract Demo: Direct Interaction</h1>
        <p className="description">
          Direct interaction with smart contracts through the server API on
          Conflux eSpace.
        </p>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Contract Status */}
        <div className="section">
          <h2>Contract Status</h2>
          {contractStatus ? (
            <div className="status-grid">
              <div className="status-item">
                <h3>DelegationManager Contract</h3>
                <p>
                  Deployed:{" "}
                  {contractStatus.espace.deployed ? "✅ Yes" : "❌ No"}
                </p>
                {contractStatus.espace.address && (
                  <p>
                    Address: <code>{contractStatus.espace.address}</code>
                  </p>
                )}
                <p>Type: {contractStatus.espace.mock ? "Mock" : "Real"}</p>
              </div>
              <div className="status-item">
                <h3>Counter Contract</h3>
                <p>
                  Deployed:{" "}
                  {contractStatus.espace.deployed ? "✅ Yes" : "❌ No"}
                </p>
                {contractStatus.espace.address && (
                  <p>
                    Address: <code>{contractStatus.espace.address}</code>
                  </p>
                )}
                <p>Type: {contractStatus.espace.mock ? "Mock" : "Real"}</p>
              </div>
            </div>
          ) : (
            <p>Loading contract status...</p>
          )}
        </div>

        {/* Counter Contract Demo */}
        <div className="section">
          <h2>Counter Contract Demo</h2>
          {counterStatus ? (
            <div className="counter-demo">
              <div className="counter-status">
                <h3>Current Status</h3>
                <p>
                  Count: <strong>{counterStatus.count}</strong>
                </p>
                <p>
                  Max Count: <strong>{counterStatus.maxCount}</strong>
                </p>
                <p>
                  Address: <code>{counterStatus.address}</code>
                </p>
              </div>

              <div className="counter-operations">
                <h3>Single Operations</h3>
                <div className="operation-group">
                  <input
                    type="number"
                    value={operationValue}
                    onChange={(e) => setOperationValue(e.target.value)}
                    placeholder="Enter value"
                    className="text-black"
                  />
                  <div className="button-group">
                    <button
                      onClick={() => handleSingleOperation("add")}
                      disabled={loading}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => handleSingleOperation("subtract")}
                      disabled={loading}
                    >
                      Subtract
                    </button>
                    <button
                      onClick={() => handleSingleOperation("multiply")}
                      disabled={loading}
                    >
                      Multiply
                    </button>
                    <button
                      onClick={() => handleSingleOperation("divide")}
                      disabled={loading}
                    >
                      Divide
                    </button>
                  </div>
                </div>

                <h3>Quick Actions</h3>
                <div className="button-group">
                  <button
                    onClick={() => performCounterOperation("add", 1)}
                    disabled={loading}
                  >
                    +1
                  </button>
                  <button
                    onClick={() => performCounterOperation("add", 10)}
                    disabled={loading}
                  >
                    +10
                  </button>
                  <button
                    onClick={() => performCounterOperation("add", 100)}
                    disabled={loading}
                  >
                    +100
                  </button>
                  <button
                    onClick={() => performCounterOperation("multiply", 2)}
                    disabled={loading}
                  >
                    ×2
                  </button>
                  <button
                    onClick={() => performCounterOperation("divide", 2)}
                    disabled={loading}
                  >
                    ÷2
                  </button>
                  <button
                    onClick={() => performCounterOperation("reset")}
                    disabled={loading}
                  >
                    Reset
                  </button>
                </div>

                <h3>Batch Operations</h3>
                <div className="operation-group">
                  <input
                    type="text"
                    value={batchValues}
                    onChange={(e) => setBatchValues(e.target.value)}
                    placeholder="Enter values separated by commas (e.g., 1,2,3)"
                    className="text-black"
                  />
                  <div className="button-group">
                    <button
                      onClick={() => handleBatchOperation("batchAdd")}
                      disabled={loading}
                    >
                      Batch Add
                    </button>
                    <button
                      onClick={() => handleBatchOperation("batchSubtract")}
                      disabled={loading}
                    >
                      Batch Subtract
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>Loading counter status...</p>
          )}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="loading">
            <p>Processing operation...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternADemo;
