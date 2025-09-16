"use client";

import React, { useState } from "react";
import { useContract, useContractConfig, ContractConfig } from "@conflux-wallet/client";

export default function ContractTest() {
  const { config, updateConfig } = useContractConfig();
  const [delegationId, setDelegationId] = useState<number>(1);
  const [userAddress, setUserAddress] = useState<string>("");
  const [testValue, setTestValue] = useState<string>("0.1");

  // Contract queries
  const { data: delegation, isLoading: delegationLoading, error: delegationError } = useDelegation(
    delegationId,
    config
  );

  const { data: userDelegations, isLoading: userDelegationsLoading } = useUserDelegations(
    userAddress,
    config
  );

  const { data: canExecute, isLoading: canExecuteLoading } = useCanExecuteTransaction(
    delegationId,
    testValue,
    config
  );

  const { data: contractInfo, isLoading: contractInfoLoading } = useContractInfo(config);

  // Contract mutations
  const createDelegationMutation = useCreateDelegation(config);
  const revokeDelegationMutation = useRevokeDelegation(config);
  const updateLimitsMutation = useUpdateLimits(config);

  const handleCreateDelegation = async () => {
    try {
      const result = await createDelegationMutation.mutateAsync({
        delegate: userAddress,
        duration: 7 * 24 * 60 * 60, // 7 days
        dailyLimit: "1.0",
        perTxLimit: "0.1",
      });
      console.log("Delegation created:", result);
    } catch (error) {
      console.error("Error creating delegation:", error);
    }
  };

  const handleRevokeDelegation = async () => {
    try {
      await revokeDelegationMutation.mutateAsync(delegationId);
      console.log("Delegation revoked");
    } catch (error) {
      console.error("Error revoking delegation:", error);
    }
  };

  const handleUpdateLimits = async () => {
    try {
      await updateLimitsMutation.mutateAsync({
        id: delegationId,
        newDailyLimit: "2.0",
        newPerTxLimit: "0.2",
      });
      console.log("Limits updated");
    } catch (error) {
      console.error("Error updating limits:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Contract SSR Test</h1>
      
      {/* Network Configuration */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Network Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Network
            </label>
            <select
              value={config.network}
              onChange={(e) => updateConfig({ network: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md text-black"
            >
              <option value="confluxEspaceTestnet">Conflux eSpace Testnet</option>
              <option value="confluxEspace">Conflux eSpace Mainnet</option>
              <option value="confluxCoreTestnet">Conflux Core Testnet</option>
              <option value="confluxCore">Conflux Core Mainnet</option>
              <option value="hardhat">Hardhat Local</option>
              <option value="localhost">Localhost</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RPC URL (Optional)
            </label>
            <input
              type="text"
              value={config.rpcUrl || ""}
              onChange={(e) => updateConfig({ rpcUrl: e.target.value })}
              placeholder="Custom RPC URL"
              className="w-full p-2 border border-gray-300 rounded-md text-black"
            />
          </div>
        </div>
      </div>

      {/* Contract Information */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
        {contractInfoLoading ? (
          <p>Loading contract info...</p>
        ) : contractInfo?.data ? (
          <div className="space-y-2">
            <p><strong>Contract Address:</strong> {contractInfo.data.contractAddress}</p>
            <p><strong>Network:</strong> {contractInfo.data.network.name}</p>
            <p><strong>Chain ID:</strong> {contractInfo.data.network.chainId}</p>
            <p><strong>RPC URL:</strong> {contractInfo.data.network.rpcUrl}</p>
          </div>
        ) : (
          <p className="text-red-600">Failed to load contract info</p>
        )}
      </div>

      {/* Delegation Testing */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Delegation Testing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delegation ID
            </label>
            <input
              type="number"
              value={delegationId}
              onChange={(e) => setDelegationId(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Address
            </label>
            <input
              type="text"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              placeholder="0x..."
              className="w-full p-2 border border-gray-300 rounded-md text-black"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleCreateDelegation}
            disabled={createDelegationMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {createDelegationMutation.isPending ? "Creating..." : "Create Delegation"}
          </button>
          <button
            onClick={handleRevokeDelegation}
            disabled={revokeDelegationMutation.isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {revokeDelegationMutation.isPending ? "Revoking..." : "Revoke Delegation"}
          </button>
          <button
            onClick={handleUpdateLimits}
            disabled={updateLimitsMutation.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {updateLimitsMutation.isPending ? "Updating..." : "Update Limits"}
          </button>
        </div>

        {/* Delegation Details */}
        {delegationLoading ? (
          <p>Loading delegation...</p>
        ) : delegationError ? (
          <p className="text-red-600">Error loading delegation: {delegationError.message}</p>
        ) : delegation?.data ? (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Delegation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <p><strong>Delegator:</strong> {delegation.data.delegator}</p>
              <p><strong>Delegate:</strong> {delegation.data.delegate}</p>
              <p><strong>Expires:</strong> {new Date(delegation.data.expiresAt * 1000).toLocaleString()}</p>
              <p><strong>Active:</strong> {delegation.data.isActive ? "Yes" : "No"}</p>
              <p><strong>Daily Limit:</strong> {ethers.utils.formatEther(delegation.data.dailyLimit)} CFX</p>
              <p><strong>Per-Tx Limit:</strong> {ethers.utils.formatEther(delegation.data.perTxLimit)} CFX</p>
              <p><strong>Daily Spent:</strong> {ethers.utils.formatEther(delegation.data.dailySpent)} CFX</p>
            </div>
          </div>
        ) : null}

        {/* User Delegations */}
        {userDelegationsLoading ? (
          <p>Loading user delegations...</p>
        ) : userDelegations?.data ? (
          <div className="bg-gray-50 p-4 rounded-md mt-4">
            <h3 className="font-semibold mb-2">User Delegations</h3>
            <div className="space-y-1">
              {userDelegations.data.map((id: number) => (
                <p key={id} className="text-sm">Delegation ID: {id}</p>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Transaction Testing */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Transaction Testing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Value (CFX)
            </label>
            <input
              type="text"
              value={testValue}
              onChange={(e) => setTestValue(e.target.value)}
              placeholder="0.1"
              className="w-full p-2 border border-gray-300 rounded-md text-black"
            />
          </div>
        </div>

        {/* Can Execute Check */}
        {canExecuteLoading ? (
          <p>Checking transaction execution...</p>
        ) : canExecute?.data ? (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Transaction Execution Check</h3>
            <p className={`text-sm ${canExecute.data.canExecute ? "text-green-600" : "text-red-600"}`}>
              <strong>Can Execute:</strong> {canExecute.data.canExecute ? "Yes" : "No"}
            </p>
            {!canExecute.data.canExecute && (
              <p className="text-sm text-red-600">
                <strong>Reason:</strong> {canExecute.data.reason}
              </p>
            )}
          </div>
        ) : null}
      </div>

      {/* Error Display */}
      {(createDelegationMutation.error || revokeDelegationMutation.error || updateLimitsMutation.error) && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <h3 className="font-semibold text-red-800 mb-2">Errors</h3>
          <div className="space-y-1 text-sm text-red-700">
            {createDelegationMutation.error && (
              <p>Create Delegation: {createDelegationMutation.error.message}</p>
            )}
            {revokeDelegationMutation.error && (
              <p>Revoke Delegation: {revokeDelegationMutation.error.message}</p>
            )}
            {updateLimitsMutation.error && (
              <p>Update Limits: {updateLimitsMutation.error.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
