// Contract Data Hook - Provides contract data and actions

import { useAppStore } from '@conflux-devkit/state';
import { useCallback, useMemo } from 'react';
import type { ContractContextData, UseContractsReturn } from '../types/ui';

export function useContracts(): UseContractsReturn {
  const store = useAppStore();

  // Get contract data from store
  const contractData: ContractContextData = useMemo(
    () => ({
      contracts: store.contracts.deployed || [],
      activeContract: store.contracts.activeContract,
      isLoading: store.contracts.isDeploying || false,
      error: store.contracts.error,
      lastUpdated:
        store.contracts.deployed.length > 0 ? new Date().toISOString() : null,
    }),
    [
      store.contracts.deployed,
      store.contracts.activeContract,
      store.contracts.isDeploying,
      store.contracts.error,
    ]
  );

  // Actions
  const selectContract = useCallback(
    (address: string) => {
      store.selectContract(address);
    },
    [store]
  );

  const deployContract = useCallback(
    async (name: string, args: unknown[] = []) => {
      try {
        store.setLoading('deployContract', true);
        await store.deployContract(name, args);
      } catch (error) {
        console.error('Failed to deploy contract:', error);
        throw error;
      } finally {
        store.setLoading('deployContract', false);
      }
    },
    [store]
  );

  const callMethod = useCallback(
    async (address: string, method: string, args: unknown[] = []) => {
      try {
        store.setLoading(`callMethod-${address}`, true);
        await store.callContractMethod({
          contractAddress: address,
          method,
          args,
        });
      } catch (error) {
        console.error('Failed to call contract method:', error);
        throw error;
      } finally {
        store.setLoading(`callMethod-${address}`, false);
      }
    },
    [store]
  );

  const refreshContracts = useCallback(async () => {
    try {
      store.setLoading('refreshContracts', true);
      // Refresh contracts from API
      // This would call the API server to get updated contract data
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay
    } catch (error) {
      console.error('Failed to refresh contracts:', error);
      throw error;
    } finally {
      store.setLoading('refreshContracts', false);
    }
  }, [store]);

  // Computed values
  const contractCount = contractData.contracts.length;
  const hasActiveContract = !!contractData.activeContract;

  const contractsByNetwork = useMemo(() => {
    const grouped: Record<string, typeof contractData.contracts> = {};
    contractData.contracts.forEach((contract) => {
      const network = contract.network?.name || 'unknown';
      if (!grouped[network]) {
        grouped[network] = [];
      }
      grouped[network].push(contract);
    });
    return grouped;
  }, [contractData.contracts]);

  return {
    ...contractData,
    selectContract,
    deployContract,
    callMethod,
    refreshContracts,
    contractCount,
    hasActiveContract,
    contractsByNetwork,
  };
}

// Specific contract hooks
export function useContract(address: string) {
  const { contracts, selectContract, callMethod } = useContracts();

  const contract = contracts.find((c) => c.address === address);

  const callContractMethod = useCallback(
    (method: string, args: unknown[] = []) => {
      if (!contract) {
        throw new Error('Contract not found');
      }
      return callMethod(address, method, args);
    },
    [contract, callMethod, address]
  );

  return {
    contract,
    isActive:
      contract?.address ===
      contracts.find((c) => c.address === address)?.address,
    select: () => selectContract(address),
    call: callContractMethod,
    isLoading: false, // Would be based on specific contract loading state
  };
}

export function useContractDeployment() {
  const { deployContract, isLoading } = useContracts();

  const deploy = useCallback(
    async (name: string, args: unknown[] = []) => {
      try {
        await deployContract(name, args);
        return true;
      } catch (error) {
        console.error('Contract deployment failed:', error);
        return false;
      }
    },
    [deployContract]
  );

  return {
    deploy,
    isDeploying: isLoading,
  };
}
