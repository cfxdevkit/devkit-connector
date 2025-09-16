import { useState, useEffect, useCallback } from 'react';
import { ContractApiService, ContractResponse, DelegationData, ContractStatus, NetworkInfo } from '../services/contract-api';

export interface UseContractApiConfig {
  baseURL: string;
  timeout?: number;
}

export interface UseContractApiReturn {
  // Status
  isLoading: boolean;
  error: string | null;
  isHealthy: boolean;
  
  // Contract status
  contractStatus: ContractStatus | null;
  networkInfo: NetworkInfo | null;
  
  // Actions
  createEspaceDelegation: (delegate: string, limit: string) => Promise<ContractResponse>;
  revokeEspaceDelegation: () => Promise<ContractResponse>;
  getEspaceDelegation: (delegator: string) => Promise<ContractResponse<DelegationData>>;
  getEspaceOwner: () => Promise<ContractResponse<{ owner: string }>>;
  
  createCoreDelegation: (delegate: string, limit: string) => Promise<ContractResponse>;
  revokeCoreDelegation: () => Promise<ContractResponse>;
  getCoreDelegation: (delegator: string) => Promise<ContractResponse<DelegationData>>;
  getCoreOwner: () => Promise<ContractResponse<{ owner: string }>>;
  
  // Utilities
  refreshStatus: () => Promise<void>;
  clearError: () => void;
}

export function useContractApi(config: UseContractApiConfig): UseContractApiReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHealthy, setIsHealthy] = useState(false);
  const [contractStatus, setContractStatus] = useState<ContractStatus | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  
  const [apiService] = useState(() => new ContractApiService(config));

  // Load initial status
  useEffect(() => {
    refreshStatus();
  }, []);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const statusResponse = await apiService.getStatus();
      if (statusResponse.success && statusResponse.data) {
        setContractStatus(statusResponse.data.contracts);
        setNetworkInfo(statusResponse.data.networks);
      } else {
        setError(statusResponse.error || 'Failed to load contract status');
      }
      
      const healthResponse = await apiService.healthCheck();
      setIsHealthy(healthResponse.success && healthResponse.data?.status === 'healthy');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createEspaceDelegation = useCallback(async (delegate: string, limit: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiService.createEspaceDelegation(delegate, limit);
      if (!result.success) {
        setError(result.error || 'Failed to create eSpace delegation');
      }
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const revokeEspaceDelegation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiService.revokeEspaceDelegation();
      if (!result.success) {
        setError(result.error || 'Failed to revoke eSpace delegation');
      }
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const getEspaceDelegation = useCallback(async (delegator: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiService.getEspaceDelegation(delegator);
      if (!result.success) {
        setError(result.error || 'Failed to get eSpace delegation');
      }
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const getEspaceOwner = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiService.getEspaceOwner();
      if (!result.success) {
        setError(result.error || 'Failed to get eSpace owner');
      }
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const createCoreDelegation = useCallback(async (delegate: string, limit: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiService.createCoreDelegation(delegate, limit);
      if (!result.success) {
        setError(result.error || 'Failed to create Core delegation');
      }
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const revokeCoreDelegation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiService.revokeCoreDelegation();
      if (!result.success) {
        setError(result.error || 'Failed to revoke Core delegation');
      }
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const getCoreDelegation = useCallback(async (delegator: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiService.getCoreDelegation(delegator);
      if (!result.success) {
        setError(result.error || 'Failed to get Core delegation');
      }
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const getCoreOwner = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiService.getCoreOwner();
      if (!result.success) {
        setError(result.error || 'Failed to get Core owner');
      }
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  return {
    isLoading,
    error,
    isHealthy,
    contractStatus,
    networkInfo,
    createEspaceDelegation,
    revokeEspaceDelegation,
    getEspaceDelegation,
    getEspaceOwner,
    createCoreDelegation,
    revokeCoreDelegation,
    getCoreDelegation,
    getCoreOwner,
    refreshStatus,
    clearError
  };
}
