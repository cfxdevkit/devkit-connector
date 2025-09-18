// AppStore tests

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  useAppStore,
  getStateEventEmitter,
} from '../../../src/stores/appStore';
import type { AppState } from '../../../src/types/state';

// Mock the services
vi.mock('../../../src/services/RealWalletService', () => ({
  realWalletService: {
    createWallet: vi.fn(),
    getWallets: vi.fn(),
    removeWallet: vi.fn(),
  },
}));

vi.mock('../../../src/services/RealContractService', () => ({
  realContractService: {
    deployContract: vi.fn(),
    callContract: vi.fn(),
    getContracts: vi.fn(),
  },
}));

vi.mock('@conflux-devkit/blockchain', () => ({
  networkManager: {
    getNetwork: vi.fn(),
    getAllNetworks: vi.fn(),
  },
}));

describe('AppStore', () => {
  beforeEach(() => {
    // Reset the store state to initial values
    useAppStore.setState({
      isConnected: false,
      isConnecting: false,
      connectionError: null,
      node: {
        status: null,
        isRunning: false,
        isStarting: false,
        isStopping: false,
        error: null,
        lastHealthCheck: null,
        uptime: 0,
      },
      wallets: {
        activeWallet: null,
        wallets: [],
        isCreating: false,
        isImporting: false,
        error: null,
        balance: null,
        isRefreshing: false,
      },
      contracts: {
        deployed: [],
        isDeploying: false,
        deploymentError: null,
        activeContract: null,
        contractCalls: [],
        events: [],
      },
      network: {
        current: null,
        available: [],
        isSwitching: false,
        switchError: null,
      },
      ui: {
        notifications: [],
        modals: {
          wallet: { isOpen: false },
          contract: { isOpen: false },
          node: { isOpen: false },
        },
        isLoading: false,
        error: null,
      },
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAppStore.getState();

      expect(state.isConnected).toBe(false);
      expect(state.isConnecting).toBe(false);
      expect(state.connectionError).toBeNull();
      expect(state.node.status).toBeNull();
      expect(state.node.isRunning).toBe(false);
      expect(state.wallets.wallets).toEqual([]);
      expect(state.wallets.activeWallet).toBeNull();
      expect(state.contracts.deployed).toEqual([]);
      expect(state.network.current).toBeNull();
      expect(state.ui.notifications).toEqual([]);
      expect(state.ui.isLoading).toBe(false);
      expect(state.ui.error).toBeNull();
    });
  });

  describe('Wallet Management', () => {
    it('should create wallet', async () => {
      const mockWallet = {
        index: 0,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        privateKey:
          '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        mnemonic: 'test mnemonic phrase',
        balance: 0n,
        balanceFormatted: '0.0 CFX',
        isMining: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { createWallet } = useAppStore.getState();

      // Mock the service
      const { realWalletService } = await import(
        '../../../src/services/RealWalletService'
      );
      vi.mocked(realWalletService.createWallet).mockResolvedValue(mockWallet);

      await createWallet();

      const state = useAppStore.getState();
      expect(state.wallets.wallets).toHaveLength(1);
      expect(state.wallets.wallets[0]).toEqual(mockWallet);
    });

    it('should remove wallet', () => {
      const mockWallet = {
        index: 0,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        privateKey:
          '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        mnemonic: 'test mnemonic phrase',
        balance: 0n,
        balanceFormatted: '0.0 CFX',
        isMining: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add wallet first
      useAppStore.setState({
        wallets: {
          ...useAppStore.getState().wallets,
          wallets: [mockWallet],
        },
      });

      const { removeWallet } = useAppStore.getState();
      removeWallet(mockWallet.address);

      const state = useAppStore.getState();
      expect(state.wallets.wallets).toHaveLength(0);
    });
  });

  describe('Contract Management', () => {
    it('should add contract', () => {
      const mockContract = {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        name: 'TestContract',
        abi: [],
        bytecode: '0x1234',
        deployedAt: new Date(),
        network: 'testnet',
      };

      const { addContract } = useAppStore.getState();
      addContract(mockContract);

      const state = useAppStore.getState();
      expect(state.contracts.deployed).toHaveLength(1);
      expect(state.contracts.deployed[0]).toEqual(mockContract);
    });

    it('should remove contract', () => {
      const mockContract = {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        name: 'TestContract',
        abi: [],
        bytecode: '0x1234',
        deployedAt: new Date(),
        network: 'testnet',
      };

      // Add contract first
      useAppStore.setState({
        contracts: {
          ...useAppStore.getState().contracts,
          deployed: [mockContract],
        },
      });

      const { removeContract } = useAppStore.getState();
      removeContract(mockContract.address);

      const state = useAppStore.getState();
      expect(state.contracts.deployed).toHaveLength(0);
    });
  });

  describe('Network Management', () => {
    it('should set current network', () => {
      const mockNetwork = {
        name: 'Test Network',
        chainId: 2029,
        rpcUrl: 'https://test.confluxrpc.com',
        currency: {
          name: 'Conflux',
          symbol: 'CFX',
          decimals: 18,
        },
        isTestnet: true,
        networkType: 'evm' as const,
      };

      const { setCurrentNetwork } = useAppStore.getState();
      setCurrentNetwork(mockNetwork);

      const state = useAppStore.getState();
      expect(state.network.current).toEqual(mockNetwork);
    });
  });

  describe('Loading State', () => {
    it('should set loading state', () => {
      const { setLoading } = useAppStore.getState();
      setLoading('test', true);

      const state = useAppStore.getState();
      expect(state.ui.loading.test).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should set error', () => {
      const error = new Error('Test error');
      const { setError } = useAppStore.getState();
      setError(error);

      const state = useAppStore.getState();
      expect(state.ui.error).toEqual(error);
    });

    it('should clear error', () => {
      const { setError, clearError } = useAppStore.getState();
      setError(new Error('Test error'));
      clearError();

      const state = useAppStore.getState();
      expect(state.ui.error).toBeNull();
    });
  });

  describe('Notifications', () => {
    it('should add notification', () => {
      const notification = {
        id: 'test-notification',
        type: 'success' as const,
        title: 'Test Notification',
        message: 'Test message',
        timestamp: new Date(),
      };

      const { addNotification } = useAppStore.getState();
      addNotification(notification);

      const state = useAppStore.getState();
      expect(state.ui.notifications).toHaveLength(1);
      expect(state.ui.notifications[0]).toMatchObject({
        type: notification.type,
        title: notification.title,
        message: notification.message,
      });
      expect(state.ui.notifications[0].id).toBeDefined();
      expect(state.ui.notifications[0].timestamp).toBeDefined();
    });

    it('should remove notification', () => {
      const notification = {
        id: 'test-notification',
        type: 'success' as const,
        title: 'Test Notification',
        message: 'Test message',
        timestamp: new Date(),
      };

      // Add notification first
      useAppStore.setState({
        ui: {
          ...useAppStore.getState().ui,
          notifications: [notification],
        },
      });

      const { removeNotification } = useAppStore.getState();
      removeNotification(notification.id);

      const state = useAppStore.getState();
      expect(state.ui.notifications).toHaveLength(0);
    });
  });

  describe('Modal Management', () => {
    it('should open modal', () => {
      const { openModal } = useAppStore.getState();
      const modalId = openModal('wallet');

      const state = useAppStore.getState();
      expect(state.ui.modals).toHaveLength(1);
      expect(state.ui.modals[0].id).toBe(modalId);
      expect(state.ui.modals[0].type).toBe('wallet');
      expect(state.ui.modals[0].isOpen).toBe(true);
    });

    it('should close modal', () => {
      const { openModal, closeModal } = useAppStore.getState();
      const modalId = openModal('wallet');
      closeModal(modalId);

      const state = useAppStore.getState();
      expect(state.ui.modals).toHaveLength(0);
    });
  });

  describe('Event Emitter', () => {
    it('should emit events', () => {
      const eventEmitter = getStateEventEmitter();
      const mockCallback = vi.fn();

      eventEmitter.on('state:wallet:created', mockCallback);
      eventEmitter.emit('state:wallet:created', { address: '0x123' });

      expect(mockCallback).toHaveBeenCalledWith({ address: '0x123' });
    });
  });
});
