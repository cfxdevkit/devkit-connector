// StateService tests

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateService } from '../../../src/services/StateService';
import { useAppStore } from '../../../src/stores/appStore';

// Mock the app store
vi.mock('../../../src/stores/appStore', () => ({
  useAppStore: {
    getState: vi.fn(),
  },
  getStateEventEmitter: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
}));

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

describe('StateService', () => {
  let stateService: StateService;
  let mockStore: any;
  let mockEventEmitter: any;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock store
    mockStore = {
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
      createWallet: vi.fn(),
      removeWallet: vi.fn(),
      addContract: vi.fn(),
      removeContract: vi.fn(),
      setCurrentNetwork: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      addNotification: vi.fn(),
      removeNotification: vi.fn(),
      openModal: vi.fn(),
      closeModal: vi.fn(),
    };

    // Mock event emitter
    mockEventEmitter = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      removeAllListeners: vi.fn(),
    };

    // Setup mocks
    vi.mocked(useAppStore.getState).mockReturnValue(mockStore);
    const { getStateEventEmitter } = await import(
      '../../../src/stores/appStore'
    );
    vi.mocked(getStateEventEmitter).mockReturnValue(mockEventEmitter);

    stateService = new StateService();
  });

  describe('Constructor', () => {
    it('should create StateService instance', () => {
      expect(stateService).toBeDefined();
    });

    it('should initialize with default config', () => {
      const service = new StateService();
      expect(service).toBeDefined();
    });

    it('should initialize with custom config', () => {
      const customConfig = {
        autoRefreshInterval: 5000,
        maxNotifications: 10,
      };
      const service = new StateService(customConfig);
      expect(service).toBeDefined();
    });
  });

  describe('Store Management', () => {
    it('should get store', () => {
      const store = stateService.getStore();
      expect(store).toBeDefined();
      expect(typeof store.getState).toBe('function');
    });

    it('should get state', () => {
      const state = stateService.getState();
      expect(state).toEqual(mockStore);
    });
  });

  describe('Wallet Operations', () => {
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

      const { realWalletService } = await import(
        '../../../src/services/RealWalletService'
      );
      vi.mocked(realWalletService.createWallet).mockResolvedValue(mockWallet);

      await stateService.createWallet();

      expect(realWalletService.createWallet).toHaveBeenCalled();
      expect(mockStore.createWallet).toHaveBeenCalled();
    });

    it('should get wallets', async () => {
      const mockWallets = [
        {
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
        },
      ];

      const { realWalletService } = await import(
        '../../../src/services/RealWalletService'
      );
      vi.mocked(realWalletService.getWallets).mockResolvedValue(mockWallets);

      const wallets = await stateService.getWallets();

      expect(realWalletService.getWallets).toHaveBeenCalled();
      expect(wallets).toEqual(mockWallets);
    });

    it('should remove wallet', async () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';

      const { realWalletService } = await import(
        '../../../src/services/RealWalletService'
      );
      vi.mocked(realWalletService.removeWallet).mockResolvedValue(true);

      await stateService.removeWallet(address);

      expect(realWalletService.removeWallet).toHaveBeenCalledWith(address);
      expect(mockStore.removeWallet).toHaveBeenCalledWith(address);
    });
  });

  describe('Contract Operations', () => {
    it('should deploy contract', async () => {
      const contractName = 'TestContract';
      const bytecode = '0x1234';
      const abi = [];
      const constructorArgs = [];

      const mockContract = {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        name: contractName,
        abi,
        bytecode,
        deployedAt: new Date(),
        network: 'testnet',
      };

      const { realContractService } = await import(
        '../../../src/services/RealContractService'
      );
      vi.mocked(realContractService.deployContract).mockResolvedValue(
        mockContract
      );

      const result = await stateService.deployContract(
        contractName,
        bytecode,
        abi,
        constructorArgs
      );

      expect(realContractService.deployContract).toHaveBeenCalledWith(
        contractName,
        bytecode,
        abi,
        constructorArgs,
        ''
      );
      expect(result).toEqual(mockContract);
    });

    it('should call contract', async () => {
      const contractAddress = '0x1234567890abcdef1234567890abcdef12345678';
      const methodName = 'testMethod';
      const args = ['arg1', 'arg2'];

      const mockResult = { result: 'test result' };

      const { realContractService } = await import(
        '../../../src/services/RealContractService'
      );
      vi.mocked(realContractService.callContract).mockResolvedValue(mockResult);

      const result = await stateService.callContract(
        contractAddress,
        methodName,
        args
      );

      expect(realContractService.callContract).toHaveBeenCalledWith(
        contractAddress,
        methodName,
        args
      );
      expect(result).toEqual(mockResult.result);
    });

    it('should get contracts', async () => {
      const mockContracts = [
        {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          name: 'TestContract',
          abi: [],
          bytecode: '0x1234',
          deployedAt: new Date(),
          network: 'testnet',
        },
      ];

      const { realContractService } = await import(
        '../../../src/services/RealContractService'
      );
      vi.mocked(realContractService.getContracts).mockResolvedValue(
        mockContracts
      );

      const contracts = await stateService.getContracts();

      expect(realContractService.getContracts).toHaveBeenCalled();
      expect(contracts).toEqual([
        {
          name: 'TestContract',
          address: '0x1234567890abcdef1234567890abcdef12345678',
          abi: '[]',
          bytecode: '0x1234',
          deployedBytecode: '',
          chainType: 'evm',
          networkId: '1',
          chainId: '1',
          evmChainId: '1',
          network: {
            name: 'Ethereum',
            rpcUrl: 'https://mainnet.infura.io/v3/your-key',
            chainId: '1',
            evmChainId: '1',
            currency: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: '18',
            },
            isTestnet: false,
            networkType: 'evm',
          },
          methods: {
            read: [],
            write: [],
            events: [],
          },
          capabilities: {
            read: true,
            write: true,
            events: true,
          },
        },
      ]);
    });
  });

  describe('Event Management', () => {
    it('should subscribe to events', () => {
      const callback = vi.fn();
      stateService.on('walletCreated', callback);

      expect(mockEventEmitter.on).toHaveBeenCalledWith(
        'walletCreated',
        callback
      );
    });

    it('should unsubscribe from events', () => {
      const callback = vi.fn();
      stateService.off('walletCreated', callback);

      expect(mockEventEmitter.off).toHaveBeenCalledWith(
        'walletCreated',
        callback
      );
    });
  });

  describe('Initialization', () => {
    it('should initialize service', async () => {
      await stateService.initialize();

      expect(stateService.isInitialized()).toBe(true);
    });

    it('should check if initialized', () => {
      expect(stateService.isInitialized()).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup service', () => {
      stateService.cleanup();

      expect(mockEventEmitter.removeAllListeners).toHaveBeenCalled();
    });
  });
});
