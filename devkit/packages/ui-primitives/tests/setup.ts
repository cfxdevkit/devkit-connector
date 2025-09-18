// Test setup for ui-primitives package

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock React hooks
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useState: vi.fn(),
    useEffect: vi.fn(),
    useContext: vi.fn(),
    useCallback: vi.fn(),
    useMemo: vi.fn(),
    useRef: vi.fn(),
  };
});

// Mock React DOM
vi.mock('react-dom', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
    unmount: vi.fn(),
  })),
}));

// Mock the state package
vi.mock('@conflux-devkit/state', () => ({
  useAppStore: vi.fn(() => ({
    wallets: {
      wallets: [],
      activeWallet: null,
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
    node: {
      status: null,
      isRunning: false,
      isStarting: false,
      isStopping: false,
      error: null,
      lastHealthCheck: null,
      uptime: 0,
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
  })),
  getStateEventEmitter: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
}));

// Mock the core package
vi.mock('@conflux-devkit/core', () => ({
  getAllNetworks: vi.fn(() => []),
  getCoreNetworks: vi.fn(() => []),
  getEvmNetworks: vi.fn(() => []),
}));
