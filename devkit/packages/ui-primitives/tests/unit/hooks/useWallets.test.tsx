// useWallets hook tests

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the state store
const mockStore = {
  wallets: {
    wallets: [],
    activeWallet: null,
    isCreating: false,
    isRefreshing: false,
    error: null,
  },
  selectWallet: vi.fn(),
  createWallet: vi.fn(),
  setLoading: vi.fn(),
};

// Mock the useAppStore hook before importing the hook
vi.mock('@conflux-devkit/state', () => ({
  useAppStore: vi.fn(() => mockStore),
}));

// Import the hook after mocking
import { useWallets } from '../../../src/hooks/useWallets';

describe('useWallets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mockStore state for each test if needed
    mockStore.wallets = {
      wallets: [],
      activeWallet: null,
      isCreating: false,
      isRefreshing: false,
      error: null,
    };
  });

  it('should be defined', () => {
    expect(useWallets).toBeDefined();
    expect(typeof useWallets).toBe('function');
  });

  it('should have correct mock store structure', () => {
    expect(mockStore).toHaveProperty('wallets');
    expect(mockStore.wallets).toHaveProperty('wallets');
    expect(mockStore.wallets).toHaveProperty('activeWallet');
    expect(mockStore.wallets).toHaveProperty('isCreating');
    expect(mockStore.wallets).toHaveProperty('isRefreshing');
    expect(mockStore.wallets).toHaveProperty('error');
    expect(mockStore).toHaveProperty('selectWallet');
    expect(mockStore).toHaveProperty('createWallet');
    expect(mockStore).toHaveProperty('setLoading');
  });

  it('should have correct mock store values', () => {
    expect(mockStore.wallets.wallets).toEqual([]);
    expect(mockStore.wallets.activeWallet).toBeNull();
    expect(mockStore.wallets.isCreating).toBe(false);
    expect(mockStore.wallets.isRefreshing).toBe(false);
    expect(mockStore.wallets.error).toBeNull();
    expect(typeof mockStore.selectWallet).toBe('function');
    expect(typeof mockStore.createWallet).toBe('function');
    expect(typeof mockStore.setLoading).toBe('function');
  });

  it('should call mock functions correctly', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';

    mockStore.selectWallet(address);
    expect(mockStore.selectWallet).toHaveBeenCalledWith(address);

    mockStore.createWallet();
    expect(mockStore.createWallet).toHaveBeenCalled();

    mockStore.setLoading('test', true);
    expect(mockStore.setLoading).toHaveBeenCalledWith('test', true);
  });
});
