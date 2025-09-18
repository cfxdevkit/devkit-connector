// Node Data Hook - Provides node data and actions

import type { NodeConfig } from '@conflux-devkit/core';
import { useAppStore } from '@conflux-devkit/state';
import { useCallback, useMemo } from 'react';
import type { NodeContextData, UseNodeReturn } from '../types/ui';

export function useNode(): UseNodeReturn {
  const store = useAppStore();

  // Get node data from store
  const nodeData: NodeContextData = useMemo(
    () => ({
      status: store.node.status,
      isConnected: store.isConnected,
      isLoading: store.node.isStarting || store.node.isStopping || false,
      error: store.node.error,
      lastUpdated: store.node.lastHealthCheck?.toISOString() || null,
    }),
    [
      store.node.status,
      store.isConnected,
      store.node.isStarting,
      store.node.isStopping,
      store.node.error,
      store.node.lastHealthCheck,
    ]
  );

  // Actions
  const startNode = useCallback(
    async (config?: NodeConfig) => {
      try {
        store.setLoading('startNode', true);
        await store.startNode(config);
      } catch (error) {
        console.error('Failed to start node:', error);
        throw error;
      } finally {
        store.setLoading('startNode', false);
      }
    },
    [store]
  );

  const stopNode = useCallback(async () => {
    try {
      store.setLoading('stopNode', true);
      await store.stopNode();
    } catch (error) {
      console.error('Failed to stop node:', error);
      throw error;
    } finally {
      store.setLoading('stopNode', false);
    }
  }, [store]);

  const restartNode = useCallback(
    async (config?: NodeConfig) => {
      try {
        store.setLoading('restartNode', true);
        // This would need to be implemented in the store
        // await store.restartNode(config);
        console.log('Restart node with config:', config);
      } catch (error) {
        console.error('Failed to restart node:', error);
        throw error;
      } finally {
        store.setLoading('restartNode', false);
      }
    },
    [store]
  );

  const refreshStatus = useCallback(async () => {
    try {
      store.setLoading('refreshNodeStatus', true);
      // Refresh node status from API
      // This would call the API server to get updated node status
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay
    } catch (error) {
      console.error('Failed to refresh node status:', error);
      throw error;
    } finally {
      store.setLoading('refreshNodeStatus', false);
    }
  }, [store]);

  // Computed values
  const isRunning = nodeData.status?.running || false;
  const isStarting = store.node.isStarting || false;
  const isStopping = store.node.isStopping || false;

  const healthStatus = useMemo(() => {
    if (!nodeData.status) return 'unknown';
    if (nodeData.status.health === 'healthy') return 'healthy';
    if (nodeData.status.health === 'unhealthy') return 'unhealthy';
    return 'unknown';
  }, [nodeData.status]);

  return {
    ...nodeData,
    startNode,
    stopNode,
    restartNode,
    refreshStatus,
    isRunning,
    isStarting,
    isStopping,
    healthStatus,
  };
}

// Specific node hooks
export function useNodeStatus() {
  const { status, isRunning, isStarting, isStopping, healthStatus } = useNode();

  const getStatusText = useCallback(() => {
    if (isStarting) return 'Starting...';
    if (isStopping) return 'Stopping...';
    if (isRunning) return 'Running';
    return 'Stopped';
  }, [isStarting, isStopping, isRunning]);

  const getStatusColor = useCallback(() => {
    if (isStarting || isStopping) return 'yellow';
    if (isRunning && healthStatus === 'healthy') return 'green';
    if (isRunning && healthStatus === 'unhealthy') return 'red';
    return 'gray';
  }, [isStarting, isStopping, isRunning, healthStatus]);

  return {
    status,
    isRunning,
    isStarting,
    isStopping,
    healthStatus,
    statusText: getStatusText(),
    statusColor: getStatusColor(),
  };
}

export function useNodeControls() {
  const {
    startNode,
    stopNode,
    restartNode,
    isRunning,
    isStarting,
    isStopping,
  } = useNode();

  const canStart = !isRunning && !isStarting && !isStopping;
  const canStop = isRunning && !isStarting && !isStopping;
  const canRestart = isRunning && !isStarting && !isStopping;

  const start = useCallback(
    async (config?: NodeConfig) => {
      if (!canStart) return false;
      try {
        await startNode(config);
        return true;
      } catch (error) {
        console.error('Failed to start node:', error);
        return false;
      }
    },
    [canStart, startNode]
  );

  const stop = useCallback(async () => {
    if (!canStop) return false;
    try {
      await stopNode();
      return true;
    } catch (error) {
      console.error('Failed to stop node:', error);
      return false;
    }
  }, [canStop, stopNode]);

  const restart = useCallback(
    async (config?: NodeConfig) => {
      if (!canRestart) return false;
      try {
        await restartNode(config);
        return true;
      } catch (error) {
        console.error('Failed to restart node:', error);
        return false;
      }
    },
    [canRestart, restartNode]
  );

  return {
    start,
    stop,
    restart,
    canStart,
    canStop,
    canRestart,
    isRunning,
    isStarting,
    isStopping,
  };
}

export function useNodeMetrics() {
  const { status } = useNode();

  const metrics = useMemo(() => {
    if (!status) return null;

    return {
      blockNumber: status.blockNumber || '0',
      peerCount: status.peerCount || '0',
      corePort: status.corePort || '12537',
      evmPort: status.evmPort || '8545',
      chainId: status.chainId || '2029',
      evmChainId: status.evmChainId || '2030',
      health: status.health || 'unknown',
      lastHealthCheck: status.lastHealthCheck,
    };
  }, [status]);

  return {
    metrics,
    hasMetrics: !!metrics,
  };
}
