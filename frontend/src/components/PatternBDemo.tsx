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

interface Delegation {
  id: number;
  delegator: string;
  delegate: string;
  limit: string;
  active: boolean;
  createdAt: string;
}

interface DelegationWizardData {
  delegate: string;
  limit: string;
  description: string;
}

const PatternBDemo: React.FC = () => {
  // State management
  const [contractStatus, setContractStatus] = useState<ContractStatus | null>(
    null
  );
  const [counterStatus, setCounterStatus] = useState<CounterStatus | null>(
    null
  );
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delegation wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState<DelegationWizardData>({
    delegate: "",
    limit: "",
    description: "",
  });

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

  // Load sample delegations
  const loadDelegations = () => {
    const sampleDelegations: Delegation[] = [
      {
        id: 1,
        delegator: "0x1234...5678",
        delegate: "0x8765...4321",
        limit: "1000000000000000000",
        active: true,
        createdAt: "2025-09-16T08:00:00Z",
      },
      {
        id: 2,
        delegator: "0xabcd...efgh",
        delegate: "0xhgfe...dcba",
        limit: "500000000000000000",
        active: false,
        createdAt: "2025-09-16T07:30:00Z",
      },
    ];
    setDelegations(sampleDelegations);
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

  // Delegation wizard functions
  const openWizard = () => {
    setWizardData({ delegate: "", limit: "", description: "" });
    setWizardStep(1);
    setShowWizard(true);
  };

  const closeWizard = () => {
    setShowWizard(false);
    setWizardStep(1);
    setWizardData({ delegate: "", limit: "", description: "" });
  };

  const nextWizardStep = () => {
    if (wizardStep < 3) {
      setWizardStep(wizardStep + 1);
    }
  };

  const prevWizardStep = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    }
  };

  const submitWizard = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate delegation creation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newDelegation: Delegation = {
        id: delegations.length + 1,
        delegator: "0x" + Math.random().toString(16).substr(2, 40),
        delegate: wizardData.delegate,
        limit: wizardData.limit,
        active: true,
        createdAt: new Date().toISOString(),
      };

      setDelegations([...delegations, newDelegation]);
      closeWizard();
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
    loadDelegations();
  }, []);

  return (
    <div className="minimal-pattern-b">
      <div className="container">
        <h1>Delegation Manager</h1>
        <p className="description">
          Manage delegations and interact with smart contracts through a guided
          interface on Conflux eSpace.
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
                  Deployed: {contractStatus.core.deployed ? "✅ Yes" : "❌ No"}
                </p>
                {contractStatus.core.address && (
                  <p>
                    Address: <code>{contractStatus.core.address}</code>
                  </p>
                )}
                <p>Type: {contractStatus.core.mock ? "Mock" : "Real"}</p>
              </div>
            </div>
          ) : (
            <p>Loading contract status...</p>
          )}
        </div>

        {/* Delegation Management */}
        <div className="section">
          <h2>Delegation Management</h2>
          <div className="delegation-controls">
            <button onClick={openWizard} className="primary-button">
              Create Delegation
            </button>
          </div>

          <div className="delegations-list">
            <h3>Active Delegations</h3>
            {delegations.length > 0 ? (
              <div className="delegations-grid">
                {delegations.map((delegation) => (
                  <div key={delegation.id} className="delegation-card">
                    <h4>Delegation #{delegation.id}</h4>
                    <p>
                      <strong>Delegator:</strong> {delegation.delegator}
                    </p>
                    <p>
                      <strong>Delegate:</strong> {delegation.delegate}
                    </p>
                    <p>
                      <strong>Limit:</strong> {delegation.limit} wei
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {delegation.active ? "✅ Active" : "❌ Inactive"}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(delegation.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No delegations found.</p>
            )}
          </div>
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

        {/* Delegation Wizard Modal */}
        {showWizard && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Create Delegation</h2>
                <button onClick={closeWizard} className="close-button">
                  &times;
                </button>
              </div>

              <div className="modal-body">
                {wizardStep === 1 && (
                  <div className="wizard-step">
                    <h3>Step 1: Delegate Address</h3>
                    <p>
                      Enter the address that will receive delegation
                      permissions.
                    </p>
                    <input
                      type="text"
                      value={wizardData.delegate}
                      onChange={(e) =>
                        setWizardData({
                          ...wizardData,
                          delegate: e.target.value,
                        })
                      }
                      placeholder="0x..."
                      className="text-black"
                    />
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="wizard-step">
                    <h3>Step 2: Spending Limit</h3>
                    <p>
                      Set the maximum amount the delegate can spend (in wei).
                    </p>
                    <input
                      type="text"
                      value={wizardData.limit}
                      onChange={(e) =>
                        setWizardData({ ...wizardData, limit: e.target.value })
                      }
                      placeholder="1000000000000000000"
                      className="text-black"
                    />
                    <p className="help-text">1 ETH = 1000000000000000000 wei</p>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="wizard-step">
                    <h3>Step 3: Confirmation</h3>
                    <p>Review your delegation details:</p>
                    <div className="confirmation-details">
                      <p>
                        <strong>Delegate:</strong> {wizardData.delegate}
                      </p>
                      <p>
                        <strong>Limit:</strong> {wizardData.limit} wei
                      </p>
                    </div>
                    <textarea
                      value={wizardData.description}
                      onChange={(e) =>
                        setWizardData({
                          ...wizardData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Optional description..."
                      className="text-black"
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <div className="wizard-navigation">
                  {wizardStep > 1 && (
                    <button
                      onClick={prevWizardStep}
                      className="secondary-button"
                    >
                      Previous
                    </button>
                  )}
                  {wizardStep < 3 ? (
                    <button onClick={nextWizardStep} className="primary-button">
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={submitWizard}
                      className="primary-button"
                      disabled={loading}
                    >
                      {loading ? "Creating..." : "Create Delegation"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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

export default PatternBDemo;
