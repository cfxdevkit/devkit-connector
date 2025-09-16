import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface DelegationData {
  delegator: string;
  delegate: string;
  expiresAt: number;
  dailyLimit: string;
  perTxLimit: string;
  dailySpent: string;
  lastResetDay: number;
  isActive: boolean;
}

export interface TransactionData {
  to: string;
  value: string;
  data: string;
  nonce: number;
  deadline: number;
}

export interface ContractConfig {
  network: string;
  rpcUrl?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Query keys
const queryKeys = {
  delegation: (id: number) => ["delegation", id],
  userDelegations: (address: string) => ["userDelegations", address],
  canExecute: (delegationId: number, value: string) => ["canExecute", delegationId, value],
  contractInfo: (network: string) => ["contractInfo", network],
  delegationEvents: (fromBlock?: number, toBlock?: number) => ["delegationEvents", fromBlock, toBlock],
  transactionEvents: (fromBlock?: number, toBlock?: number) => ["transactionEvents", fromBlock, toBlock],
};

// API functions
const contractAPI = {
  async getDelegation(id: number, config: ContractConfig) {
    const params = new URLSearchParams({ network: config.network });
    if (config.rpcUrl) params.append("rpcUrl", config.rpcUrl);
    
    const response = await fetch(`${API_BASE_URL}/contracts/delegation/${id}?${params}`);
    if (!response.ok) throw new Error("Failed to fetch delegation");
    return response.json();
  },

  async getUserDelegations(address: string, config: ContractConfig) {
    const params = new URLSearchParams({ network: config.network });
    if (config.rpcUrl) params.append("rpcUrl", config.rpcUrl);
    
    const response = await fetch(`${API_BASE_URL}/contracts/user/${address}/delegations?${params}`);
    if (!response.ok) throw new Error("Failed to fetch user delegations");
    return response.json();
  },

  async createDelegation(data: {
    delegate: string;
    duration: number;
    dailyLimit: string;
    perTxLimit: string;
  }, config: ContractConfig) {
    const network = config.network === 'localEspace' || config.network === 'confluxEspaceTestnet' ? 'espace' : 'core';
    
    const response = await fetch(`${API_BASE_URL}/api/contracts/${network}/create-delegation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        delegate: data.delegate,
        limit: data.dailyLimit
      }),
    });
    if (!response.ok) throw new Error("Failed to create delegation");
    return response.json();
  },

  async revokeDelegation(id: number, config: ContractConfig) {
    const network = config.network === 'localEspace' || config.network === 'confluxEspaceTestnet' ? 'espace' : 'core';
    
    const response = await fetch(`${API_BASE_URL}/api/contracts/${network}/revoke-delegation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to revoke delegation");
    return response.json();
  },

  async updateLimits(id: number, data: {
    newDailyLimit: string;
    newPerTxLimit: string;
  }, config: ContractConfig) {
    const params = new URLSearchParams({ network: config.network });
    if (config.rpcUrl) params.append("rpcUrl", config.rpcUrl);
    
    const response = await fetch(`${API_BASE_URL}/contracts/delegation/${id}/limits?${params}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update limits");
    return response.json();
  },

  async executeTransaction(data: {
    delegationId: number;
    transaction: TransactionData;
    signature: string;
  }, config: ContractConfig) {
    const params = new URLSearchParams({ network: config.network });
    if (config.rpcUrl) params.append("rpcUrl", config.rpcUrl);
    
    const response = await fetch(`${API_BASE_URL}/contracts/transaction/execute?${params}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to execute transaction");
    return response.json();
  },

  async canExecuteTransaction(delegationId: number, value: string, config: ContractConfig) {
    const params = new URLSearchParams({ 
      network: config.network,
      delegationId: delegationId.toString(),
      value: value,
    });
    if (config.rpcUrl) params.append("rpcUrl", config.rpcUrl);
    
    const response = await fetch(`${API_BASE_URL}/contracts/transaction/can-execute?${params}`);
    if (!response.ok) throw new Error("Failed to check transaction execution");
    return response.json();
  },

  async getContractInfo(config: ContractConfig) {
    const response = await fetch(`${API_BASE_URL}/api/contracts/status`);
    if (!response.ok) throw new Error("Failed to fetch contract info");
    return response.json();
  },

  async getDelegationEvents(config: ContractConfig, fromBlock?: number, toBlock?: number) {
    const params = new URLSearchParams({ network: config.network });
    if (config.rpcUrl) params.append("rpcUrl", config.rpcUrl);
    if (fromBlock) params.append("fromBlock", fromBlock.toString());
    if (toBlock) params.append("toBlock", toBlock.toString());
    
    const response = await fetch(`${API_BASE_URL}/contracts/events/delegations?${params}`);
    if (!response.ok) throw new Error("Failed to fetch delegation events");
    return response.json();
  },

  async getTransactionEvents(config: ContractConfig, fromBlock?: number, toBlock?: number) {
    const params = new URLSearchParams({ network: config.network });
    if (config.rpcUrl) params.append("rpcUrl", config.rpcUrl);
    if (fromBlock) params.append("fromBlock", fromBlock.toString());
    if (toBlock) params.append("toBlock", toBlock.toString());
    
    const response = await fetch(`${API_BASE_URL}/contracts/events/transactions?${params}`);
    if (!response.ok) throw new Error("Failed to fetch transaction events");
    return response.json();
  },
};

// Custom hooks
export function useDelegation(id: number, config: ContractConfig) {
  return useQuery({
    queryKey: queryKeys.delegation(id),
    queryFn: () => contractAPI.getDelegation(id, config),
    enabled: !!id,
  });
}

export function useUserDelegations(address: string, config: ContractConfig) {
  return useQuery({
    queryKey: queryKeys.userDelegations(address),
    queryFn: () => contractAPI.getUserDelegations(address, config),
    enabled: !!address,
  });
}

export function useCanExecuteTransaction(delegationId: number, value: string, config: ContractConfig) {
  return useQuery({
    queryKey: queryKeys.canExecute(delegationId, value),
    queryFn: () => contractAPI.canExecuteTransaction(delegationId, value, config),
    enabled: !!delegationId && !!value,
  });
}

export function useContractInfo(config: ContractConfig) {
  return useQuery({
    queryKey: queryKeys.contractInfo(config.network),
    queryFn: () => contractAPI.getContractInfo(config),
  });
}

export function useDelegationEvents(config: ContractConfig, fromBlock?: number, toBlock?: number) {
  return useQuery({
    queryKey: queryKeys.delegationEvents(fromBlock, toBlock),
    queryFn: () => contractAPI.getDelegationEvents(config, fromBlock, toBlock),
  });
}

export function useTransactionEvents(config: ContractConfig, fromBlock?: number, toBlock?: number) {
  return useQuery({
    queryKey: queryKeys.transactionEvents(fromBlock, toBlock),
    queryFn: () => contractAPI.getTransactionEvents(config, fromBlock, toBlock),
  });
}

// Mutation hooks
export function useCreateDelegation(config: ContractConfig) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      delegate: string;
      duration: number;
      dailyLimit: string;
      perTxLimit: string;
    }) => contractAPI.createDelegation(data, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userDelegations"] });
      queryClient.invalidateQueries({ queryKey: ["delegationEvents"] });
    },
  });
}

export function useRevokeDelegation(config: ContractConfig) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => contractAPI.revokeDelegation(id, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delegation"] });
      queryClient.invalidateQueries({ queryKey: ["userDelegations"] });
      queryClient.invalidateQueries({ queryKey: ["delegationEvents"] });
    },
  });
}

export function useUpdateLimits(config: ContractConfig) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      id: number;
      newDailyLimit: string;
      newPerTxLimit: string;
    }) => contractAPI.updateLimits(data.id, {
      newDailyLimit: data.newDailyLimit,
      newPerTxLimit: data.newPerTxLimit,
    }, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delegation"] });
      queryClient.invalidateQueries({ queryKey: ["userDelegations"] });
    },
  });
}

export function useExecuteTransaction(config: ContractConfig) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      delegationId: number;
      transaction: TransactionData;
      signature: string;
    }) => contractAPI.executeTransaction(data, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delegation"] });
      queryClient.invalidateQueries({ queryKey: ["canExecute"] });
      queryClient.invalidateQueries({ queryKey: ["transactionEvents"] });
    },
  });
}

// Utility hook for contract configuration
export function useContractConfig() {
  const [config, setConfig] = useState<ContractConfig>({
    network: "localEspace",
  });

  const updateConfig = useCallback((newConfig: Partial<ContractConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  return { config, updateConfig };
}
