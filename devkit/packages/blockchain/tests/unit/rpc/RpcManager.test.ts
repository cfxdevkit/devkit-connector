// RpcManager tests

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RpcManager } from '../../../src/rpc/RpcManager';
import { createMockNetworkConfig } from '../../helpers/test-utils';
import { MOCK_PRIVATE_KEYS } from '../../helpers/mock-data';

// Mock the client classes
vi.doMock('../../../src/rpc/EvmClient');
vi.doMock('../../../src/rpc/CoreClient');

describe('RpcManager', () => {
  let rpcManager: RpcManager;
  let mockEvmClient: any;
  let mockCoreClient: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock clients
    mockEvmClient = {
      getBalance: vi.fn(),
      getBlockNumber: vi.fn(),
    };

    mockCoreClient = {
      getBalance: vi.fn(),
      getBlockNumber: vi.fn(),
    };

    // Mock the client constructors
    vi.doMock('../../../src/rpc/EvmClient', () => ({
      EvmClient: vi.fn().mockImplementation(() => mockEvmClient),
    }));

    vi.doMock('../../../src/rpc/CoreClient', () => ({
      CoreClient: vi.fn().mockImplementation(() => mockCoreClient),
    }));

    // Create new RpcManager instance
    rpcManager = new RpcManager();
  });

  describe('Constructor', () => {
    it('should create RpcManager instance', () => {
      expect(rpcManager).toBeDefined();
    });

    it('should start with uninitialized clients', () => {
      expect(rpcManager.isInitialized()).toBe(false);
    });
  });

  describe('initializeClients', () => {
    it('should initialize both EVM and Core clients', async () => {
      const network = createMockNetworkConfig();
      const privateKey = MOCK_PRIVATE_KEYS.valid;

      await rpcManager.initializeClients(network, privateKey);

      expect(rpcManager.isInitialized()).toBe(true);
    });

    it('should initialize clients without private key', async () => {
      const network = createMockNetworkConfig();

      await rpcManager.initializeClients(network);

      expect(rpcManager.isInitialized()).toBe(true);
    });

    it('should throw error if client initialization fails', async () => {
      const network = createMockNetworkConfig();
      const privateKey = MOCK_PRIVATE_KEYS.valid;
      const error = new Error('Client initialization failed');

      // Mock EvmClient constructor to throw error
      const { EvmClient } = await import('../../../src/rpc/EvmClient');
      vi.mocked(EvmClient).mockImplementation(() => {
        throw error;
      });

      await expect(
        rpcManager.initializeClients(network, privateKey)
      ).rejects.toThrow(
        'Failed to initialize RPC clients: Client initialization failed'
      );
    });

    it('should throw error with unknown error type', async () => {
      const network = createMockNetworkConfig();
      const privateKey = MOCK_PRIVATE_KEYS.valid;

      // Mock EvmClient constructor to throw non-Error object
      const { EvmClient } = await import('../../../src/rpc/EvmClient');
      vi.mocked(EvmClient).mockImplementation(() => {
        throw 'String error';
      });

      await expect(
        rpcManager.initializeClients(network, privateKey)
      ).rejects.toThrow('Failed to initialize RPC clients: Unknown error');
    });
  });

  describe('getEvmClient', () => {
    it('should return EVM client when initialized', async () => {
      const network = createMockNetworkConfig();
      await rpcManager.initializeClients(network);

      const client = rpcManager.getEvmClient();

      expect(client).toBe(mockEvmClient);
    });

    it('should throw error when EVM client not initialized', () => {
      expect(() => rpcManager.getEvmClient()).toThrow(
        'EVM client not initialized'
      );
    });
  });

  describe('getCoreClient', () => {
    it('should return Core client when initialized', async () => {
      const network = createMockNetworkConfig();
      await rpcManager.initializeClients(network);

      const client = rpcManager.getCoreClient();

      expect(client).toBe(mockCoreClient);
    });

    it('should throw error when Core client not initialized', () => {
      expect(() => rpcManager.getCoreClient()).toThrow(
        'Core client not initialized'
      );
    });
  });

  describe('isInitialized', () => {
    it('should return false when clients are not initialized', () => {
      expect(rpcManager.isInitialized()).toBe(false);
    });

    it('should return true when both clients are initialized', async () => {
      const network = createMockNetworkConfig();
      await rpcManager.initializeClients(network);

      expect(rpcManager.isInitialized()).toBe(true);
    });

    it('should return false when only EVM client is initialized', async () => {
      const network = createMockNetworkConfig();

      // Mock CoreClient constructor to throw error
      const { CoreClient } = await import('../../../src/rpc/CoreClient');
      vi.mocked(CoreClient).mockImplementation(() => {
        throw new Error('Core client error');
      });

      try {
        await rpcManager.initializeClients(network);
      } catch (error) {
        // Expected to fail
      }

      expect(rpcManager.isInitialized()).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('should disconnect clients', async () => {
      const network = createMockNetworkConfig();
      await rpcManager.initializeClients(network);

      expect(rpcManager.isInitialized()).toBe(true);

      rpcManager.disconnect();

      expect(rpcManager.isInitialized()).toBe(false);
    });

    it('should handle disconnect when clients are not initialized', () => {
      expect(() => rpcManager.disconnect()).not.toThrow();
      expect(rpcManager.isInitialized()).toBe(false);
    });
  });

  describe('Client Integration', () => {
    it('should allow access to client methods after initialization', async () => {
      const network = createMockNetworkConfig();
      const privateKey = MOCK_PRIVATE_KEYS.valid;

      await rpcManager.initializeClients(network, privateKey);

      const evmClient = rpcManager.getEvmClient();
      const coreClient = rpcManager.getCoreClient();

      expect(evmClient).toBeDefined();
      expect(coreClient).toBeDefined();
      expect(typeof evmClient.getBalance).toBe('function');
      expect(typeof coreClient.getBalance).toBe('function');
    });

    it('should maintain client state after multiple operations', async () => {
      const network = createMockNetworkConfig();
      await rpcManager.initializeClients(network);

      const client1 = rpcManager.getEvmClient();
      const client2 = rpcManager.getEvmClient();

      expect(client1).toBe(client2);
      expect(rpcManager.isInitialized()).toBe(true);
    });
  });
});
