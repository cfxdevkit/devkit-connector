// Network Data Hook - Provides network data and actions

import { useCallback, useMemo } from 'react';
import { useAppStore } from '@conflux-devkit/state';
import type { UseNetworkReturn, NetworkContextData } from '../types/ui';

export function useNetwork(): UseNetworkReturn {
  const store = useAppStore();

  // Get network data from store
  const networkData: NetworkContextData = useMemo(
    () => ({
      current: store.network.current,
      available: [], // This would be populated from API
      isSwitching: store.network.isSwitching || false,
      error: store.network.switchError,
    }),
    [
      store.network.current,
      store.network.isSwitching,
      store.network.switchError,
    ]
  );

  // Actions
  const switchNetwork = useCallback(
    async (networkId: string) => {
      try {
        store.setLoading('switchNetwork', true);
        await store.switchNetwork(networkId);
      } catch (error) {
        console.error('Failed to switch network:', error);
        throw error;
      } finally {
        store.setLoading('switchNetwork', false);
      }
    },
    [store]
  );

  const refreshNetworks = useCallback(async () => {
    try {
      store.setLoading('refreshNetworks', true);
      // Refresh networks from API
      // This would call the API server to get available networks
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
    } catch (error) {
      console.error('Failed to refresh networks:', error);
      throw error;
    } finally {
      store.setLoading('refreshNetworks', false);
    }
  }, [store]);

  // Computed values
  const isLocal = useMemo(() => {
    return networkData.current?.name?.toLowerCase().includes('local') || false;
  }, [networkData.current]);

  const isTestnet = useMemo(() => {
    return networkData.current?.isTestnet || false;
  }, [networkData.current]);

  const isMainnet = useMemo(() => {
    return !isLocal && !isTestnet;
  }, [isLocal, isTestnet]);

  const networkName = useMemo(() => {
    return networkData.current?.name || 'Unknown Network';
  }, [networkData.current]);

  return {
    ...networkData,
    switchNetwork,
    refreshNetworks,
    isLocal,
    isTestnet,
    isMainnet,
    networkName,
  };
}

// Specific network hooks
export function useCurrentNetwork() {
  const { current, isLocal, isTestnet, isMainnet, networkName } = useNetwork();

  const getNetworkInfo = useCallback(() => {
    if (!current) return null;

    return {
      name: current.name,
      chainId: current.chainId,
      evmChainId: current.evmChainId,
      rpcUrl: current.rpcUrl,
      currency: current.currency,
      isTestnet: current.isTestnet,
      networkType: (current as any).networkType || 'unknown',
    };
  }, [current]);

  const getNetworkColor = useCallback(() => {
    if (isLocal) return 'blue';
    if (isTestnet) return 'yellow';
    if (isMainnet) return 'green';
    return 'gray';
  }, [isLocal, isTestnet, isMainnet]);

  const getNetworkIcon = useCallback(() => {
    if (isLocal) return '🏠';
    if (isTestnet) return '🧪';
    if (isMainnet) return '🌐';
    return '❓';
  }, [isLocal, isTestnet, isMainnet]);

  return {
    network: current,
    networkInfo: getNetworkInfo(),
    networkName,
    isLocal,
    isTestnet,
    isMainnet,
    color: getNetworkColor(),
    icon: getNetworkIcon(),
  };
}

export function useNetworkSwitcher() {
  const { switchNetwork, isSwitching, error } = useNetwork();

  const switchTo = useCallback(
    async (networkId: string) => {
      try {
        await switchNetwork(networkId);
        return true;
      } catch (error) {
        console.error('Failed to switch network:', error);
        return false;
      }
    },
    [switchNetwork]
  );

  return {
    switchTo,
    isSwitching,
    error,
  };
}

export function useNetworkStatus() {
  const { current, isSwitching, error } = useNetwork();

  const getStatus = useCallback(() => {
    if (error) return 'error';
    if (isSwitching) return 'switching';
    if (current) return 'connected';
    return 'disconnected';
  }, [current, isSwitching, error]);

  const getStatusText = useCallback(() => {
    const status = getStatus();
    switch (status) {
      case 'error':
        return 'Connection Error';
      case 'switching':
        return 'Switching Network...';
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  }, [getStatus]);

  const getStatusColor = useCallback(() => {
    const status = getStatus();
    switch (status) {
      case 'error':
        return 'red';
      case 'switching':
        return 'yellow';
      case 'connected':
        return 'green';
      case 'disconnected':
        return 'gray';
      default:
        return 'gray';
    }
  }, [getStatus]);

  return {
    status: getStatus(),
    statusText: getStatusText(),
    statusColor: getStatusColor(),
    isConnected: !!current,
    isSwitching,
    error,
  };
}
