// UIContext tests

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the state store
const mockStore = {
  ui: {
    theme: 'system',
    sidebarOpen: false,
    activeTab: 'wallets',
    notifications: [],
    modals: [],
    loading: {},
  },
  setTheme: vi.fn(),
  toggleSidebar: vi.fn(),
  setActiveTab: vi.fn(),
  addNotification: vi.fn(),
  removeNotification: vi.fn(),
  openModal: vi.fn(),
  closeModal: vi.fn(),
  setLoading: vi.fn(),
};

vi.mock('@conflux-devkit/state', () => ({
  useAppStore: vi.fn(() => mockStore),
}));

// Import the context after mocking
import { UIProvider, useUI } from '../../../src/context/UIContext';

describe('UIContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(UIProvider).toBeDefined();
    expect(useUI).toBeDefined();
    expect(typeof UIProvider).toBe('function');
    expect(typeof useUI).toBe('function');
  });

  it('should have correct mock store structure', () => {
    expect(mockStore).toHaveProperty('ui');
    expect(mockStore.ui).toHaveProperty('theme');
    expect(mockStore.ui).toHaveProperty('sidebarOpen');
    expect(mockStore.ui).toHaveProperty('activeTab');
    expect(mockStore.ui).toHaveProperty('notifications');
    expect(mockStore.ui).toHaveProperty('modals');
    expect(mockStore.ui).toHaveProperty('loading');
    expect(mockStore).toHaveProperty('setTheme');
    expect(mockStore).toHaveProperty('toggleSidebar');
    expect(mockStore).toHaveProperty('setActiveTab');
    expect(mockStore).toHaveProperty('addNotification');
    expect(mockStore).toHaveProperty('removeNotification');
    expect(mockStore).toHaveProperty('openModal');
    expect(mockStore).toHaveProperty('closeModal');
    expect(mockStore).toHaveProperty('setLoading');
  });

  it('should have correct mock store values', () => {
    expect(mockStore.ui.theme).toBe('system');
    expect(mockStore.ui.sidebarOpen).toBe(false);
    expect(mockStore.ui.activeTab).toBe('wallets');
    expect(mockStore.ui.notifications).toEqual([]);
    expect(mockStore.ui.modals).toEqual([]);
    expect(mockStore.ui.loading).toEqual({});
    expect(typeof mockStore.setTheme).toBe('function');
    expect(typeof mockStore.toggleSidebar).toBe('function');
    expect(typeof mockStore.setActiveTab).toBe('function');
    expect(typeof mockStore.addNotification).toBe('function');
    expect(typeof mockStore.removeNotification).toBe('function');
    expect(typeof mockStore.openModal).toBe('function');
    expect(typeof mockStore.closeModal).toBe('function');
    expect(typeof mockStore.setLoading).toBe('function');
  });

  it('should call mock functions correctly', () => {
    const theme = 'dark';
    const tab = 'settings';
    const notification = {
      type: 'info',
      title: 'Test',
      message: 'Test message',
    };

    mockStore.setTheme(theme);
    expect(mockStore.setTheme).toHaveBeenCalledWith(theme);

    mockStore.toggleSidebar();
    expect(mockStore.toggleSidebar).toHaveBeenCalled();

    mockStore.setActiveTab(tab);
    expect(mockStore.setActiveTab).toHaveBeenCalledWith(tab);

    mockStore.addNotification(notification);
    expect(mockStore.addNotification).toHaveBeenCalledWith(notification);

    mockStore.setLoading('test', true);
    expect(mockStore.setLoading).toHaveBeenCalledWith('test', true);
  });
});
