import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  systemApi,
  nodeApi,
  walletApi,
  contractApi,
  hardhatApi,
} from '../../src/services/api';

// Mock fetch
global.fetch = vi.fn();

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('systemApi', () => {
    it('should perform health check successfully', async () => {
      const mockResponse = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
      };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await systemApi.healthCheck();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/health'
      );
    });

    it('should handle health check failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await systemApi.healthCheck();

      expect(result).toEqual({
        status: 'unhealthy',
        error: 'Health check failed',
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await systemApi.healthCheck();

      expect(result).toEqual({ status: 'unhealthy', error: 'Network error' });
    });
  });

  describe('nodeApi', () => {
    it('should get node status successfully', async () => {
      const mockData = {
        running: true,
        healthy: true,
        chainId: '1337',
        uptime: 3600,
      };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await nodeApi.getNodeStatus();

      expect(result).toEqual({ success: true, data: mockData });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/node/status'
      );
    });

    it('should handle node status failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await nodeApi.getNodeStatus();

      expect(result.success).toBe(false);
      expect(result.data).toEqual({
        running: false,
        healthy: false,
        chainId: null,
        uptime: 0,
      });
    });

    it('should start node successfully', async () => {
      const mockResponse = { success: true, message: 'Node started' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await nodeApi.startNode();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/node/start',
        {
          method: 'POST',
        }
      );
    });

    it('should handle start node failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Start failed'));

      const result = await nodeApi.startNode();

      expect(result).toEqual({ success: false, error: 'Start failed' });
    });
  });

  describe('walletApi', () => {
    it('should load wallet successfully', async () => {
      const mockData = { address: '0x123...', balance: '1.0' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await walletApi.loadWallet();

      expect(result).toEqual({ success: true, data: mockData });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/wallet/load',
        {
          method: 'POST',
        }
      );
    });

    it('should get wallet info successfully', async () => {
      const mockData = { address: '0x123...', balance: '1.0' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await walletApi.getWalletInfo();

      expect(result).toEqual({ success: true, data: mockData });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/wallet/info'
      );
    });

    it('should handle wallet operations failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Wallet error'));

      const result = await walletApi.loadWallet();

      expect(result).toEqual({ success: false, error: 'Wallet error' });
    });
  });

  describe('contractApi', () => {
    it('should get contract status successfully', async () => {
      const mockData = {
        espace: { deployed: true },
        core: { deployed: false },
      };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await contractApi.getStatus();

      expect(result).toEqual({ success: true, data: mockData });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/contracts/status'
      );
    });

    it('should deploy contracts successfully', async () => {
      const mockData = { message: 'Contracts deployed' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await contractApi.deployContracts();

      expect(result).toEqual({ success: true, data: mockData });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/contracts/deploy',
        {
          method: 'POST',
        }
      );
    });

    it('should handle contract operations failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Contract error'));

      const result = await contractApi.getStatus();

      expect(result.success).toBe(false);
      expect(result.data).toEqual({
        espace: { deployed: false },
        core: { deployed: false },
      });
    });
  });

  describe('hardhatApi', () => {
    it('should get modules successfully', async () => {
      const mockData = [{ name: 'Module1', status: 'active' }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await hardhatApi.getModules();

      expect(result).toEqual({ success: true, data: mockData });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hardhat/modules'
      );
    });

    it('should get deployments successfully', async () => {
      const mockData = [{ contract: 'Contract1', address: '0x123...' }];
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await hardhatApi.getDeployments();

      expect(result).toEqual({ success: true, data: mockData });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hardhat/deployments'
      );
    });

    it('should handle hardhat operations failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Hardhat error'));

      const result = await hardhatApi.getModules();

      expect(result).toEqual({ success: false, data: [] });
    });
  });
});
