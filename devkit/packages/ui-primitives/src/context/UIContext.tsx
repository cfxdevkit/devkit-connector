// UI Context Provider - Provides UI state and actions to all components

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAppStore } from '@conflux-devkit/state';
import type {
  UIState,
  UIPreferences,
  NotificationState,
  ModalState,
  UIEvents,
  UIPrimitivesConfig,
} from '../types/ui';

// ============================================================================
// UI Context
// ============================================================================

interface UIContextValue {
  // State
  uiState: UIState;

  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;

  // Notifications
  addNotification: (
    notification: Omit<NotificationState, 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Modals
  openModal: (
    type: string,
    props?: Record<string, unknown>,
    options?: {
      title?: string;
      closable?: boolean;
      size?: 'small' | 'medium' | 'large' | 'fullscreen';
    }
  ) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Loading
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;

  // Preferences
  updatePreferences: (preferences: Partial<UIPreferences>) => void;

  // Events
  on: <K extends keyof UIEvents>(
    event: K,
    callback: (...args: UIEvents[K]) => void
  ) => void;
  off: <K extends keyof UIEvents>(
    event: K,
    callback: (...args: UIEvents[K]) => void
  ) => void;
  emit: <K extends keyof UIEvents>(event: K, ...args: UIEvents[K]) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

// ============================================================================
// UI Context Provider
// ============================================================================

interface UIProviderProps {
  children: React.ReactNode;
  config?: Partial<UIPrimitivesConfig>;
}

export function UIProvider({ children, config }: UIProviderProps) {
  const store = useAppStore();

  // Get UI state from store
  const uiState: UIState = useMemo(
    () => ({
      theme: store.ui.theme || 'system',
      sidebarOpen: store.ui.sidebarOpen,
      sidebarWidth: 280,
      activeTab: store.ui.activeTab,
      notifications: store.ui.notifications,
      maxNotifications: 5,
      modals: store.ui.modals,
      loading: store.ui.loading,
      preferences: {
        showAdvancedOptions: false,
        showDebugInfo: false,
        compactMode: false,
        enableNotifications: true,
        notificationDuration: 5000,
        enableSounds: true,
        autoRefresh: true,
        refreshInterval: 5000,
        highContrast: false,
        reducedMotion: false,
        fontSize: 'medium',
      },
    }),
    [store.ui]
  );

  // Theme actions
  const setTheme = useCallback(
    (theme: 'light' | 'dark' | 'system') => {
      store.setTheme?.(theme);
    },
    [store]
  );

  // Sidebar actions
  const toggleSidebar = useCallback(() => {
    store.toggleSidebar();
  }, [store]);

  const setSidebarOpen = useCallback(
    (open: boolean) => {
      if (open !== store.ui.sidebarOpen) {
        store.toggleSidebar();
      }
    },
    [store, store.ui.sidebarOpen]
  );

  // Tab actions
  const setActiveTab = useCallback(
    (tab: string) => {
      store.setActiveTab(tab);
    },
    [store]
  );

  // Notification actions
  const addNotification = useCallback(
    (notification: Omit<NotificationState, 'id' | 'timestamp'>) => {
      store.addNotification({
        ...notification,
        id: Math.random().toString(36).substring(2, 15),
        timestamp: new Date().toISOString(),
      });
    },
    [store]
  );

  const removeNotification = useCallback(
    (id: string) => {
      store.removeNotification(id);
    },
    [store]
  );

  const clearNotifications = useCallback(() => {
    // Clear all notifications
    store.ui.notifications.forEach(notification => {
      store.removeNotification(notification.id);
    });
  }, [store]);

  // Modal actions
  const openModal = useCallback(
    (
      type: string,
      props?: Record<string, unknown>,
      options?: {
        title?: string;
        closable?: boolean;
        size?: 'small' | 'medium' | 'large' | 'fullscreen';
      }
    ) => {
      const id = store.openModal(type, props);
      return id;
    },
    [store]
  );

  const closeModal = useCallback(
    (id: string) => {
      store.closeModal(id);
    },
    [store]
  );

  const closeAllModals = useCallback(() => {
    store.ui.modals.forEach(modal => {
      store.closeModal(modal.id);
    });
  }, [store, store.ui.modals]);

  // Loading actions
  const setLoading = useCallback(
    (key: string, loading: boolean) => {
      store.setLoading(key, loading);
    },
    [store]
  );

  const isLoading = useCallback(
    (key: string) => {
      return store.ui.loading[key] || false;
    },
    [store, store.ui.loading]
  );

  // Preferences actions
  const updatePreferences = useCallback(
    (preferences: Partial<UIPreferences>) => {
      // Update preferences in store
      // This would need to be implemented in the store
      console.log('Update preferences:', preferences);
    },
    []
  );

  // Event system
  const on = useCallback(
    <K extends keyof UIEvents>(
      event: K,
      callback: (...args: UIEvents[K]) => void
    ) => {
      // Event system would be implemented here
      console.log('Register event listener:', event);
    },
    []
  );

  const off = useCallback(
    <K extends keyof UIEvents>(
      event: K,
      callback: (...args: UIEvents[K]) => void
    ) => {
      // Event system would be implemented here
      console.log('Remove event listener:', event);
    },
    []
  );

  const emit = useCallback(
    <K extends keyof UIEvents>(event: K, ...args: UIEvents[K]) => {
      // Event system would be implemented here
      console.log('Emit event:', event, args);
    },
    []
  );

  const contextValue: UIContextValue = useMemo(
    () => ({
      uiState,
      setTheme,
      toggleSidebar,
      setSidebarOpen,
      setActiveTab,
      addNotification,
      removeNotification,
      clearNotifications,
      openModal,
      closeModal,
      closeAllModals,
      setLoading,
      isLoading,
      updatePreferences,
      on,
      off,
      emit,
    }),
    [
      uiState,
      setTheme,
      toggleSidebar,
      setSidebarOpen,
      setActiveTab,
      addNotification,
      removeNotification,
      clearNotifications,
      openModal,
      closeModal,
      closeAllModals,
      setLoading,
      isLoading,
      updatePreferences,
      on,
      off,
      emit,
    ]
  );

  return (
    <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>
  );
}

// ============================================================================
// UI Context Hook
// ============================================================================

export function useUI(): UIContextValue {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

// ============================================================================
// Specific UI Hooks
// ============================================================================

export function useTheme() {
  const { uiState, setTheme } = useUI();
  return {
    theme: uiState.theme,
    setTheme,
    isDark: uiState.theme === 'dark',
    isLight: uiState.theme === 'light',
    isSystem: uiState.theme === 'system',
  };
}

export function useSidebar() {
  const { uiState, toggleSidebar, setSidebarOpen } = useUI();
  return {
    isOpen: uiState.sidebarOpen,
    width: uiState.sidebarWidth,
    toggle: toggleSidebar,
    setOpen: setSidebarOpen,
  };
}

export function useNotifications() {
  const { uiState, addNotification, removeNotification, clearNotifications } =
    useUI();
  return {
    notifications: uiState.notifications,
    add: addNotification,
    remove: removeNotification,
    clear: clearNotifications,
    count: uiState.notifications.length,
  };
}

export function useModals() {
  const { uiState, openModal, closeModal, closeAllModals } = useUI();
  return {
    modals: uiState.modals,
    open: openModal,
    close: closeModal,
    closeAll: closeAllModals,
    count: uiState.modals.length,
  };
}

export function useLoading() {
  const { setLoading, isLoading } = useUI();
  return {
    set: setLoading,
    get: isLoading,
  };
}
