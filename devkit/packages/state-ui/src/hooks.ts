import { useCallback } from 'react';
import { useUIStore, selectors } from './store';
import { Theme, NotificationState, ModalState } from './types';

// ============================================================================
// UI State Hooks
// ============================================================================

/**
 * Hook for accessing and managing UI state
 */
export const useUIState = () => {
  // State selectors
  const theme = useUIStore(selectors.theme);
  const sidebarOpen = useUIStore(selectors.sidebarOpen);
  const activeTab = useUIStore(selectors.activeTab);
  const notifications = useUIStore(selectors.notifications);
  const modals = useUIStore(selectors.modals);
  const error = useUIStore(selectors.error);
  const hasNotifications = useUIStore(selectors.hasNotifications);
  const hasModals = useUIStore(selectors.hasModals);
  const isAnyLoading = useUIStore(selectors.isAnyLoading);

  // Actions
  const setTheme = useUIStore(state => state.setTheme);
  const toggleSidebar = useUIStore(state => state.toggleSidebar);
  const setActiveTab = useUIStore(state => state.setActiveTab);
  const addNotification = useUIStore(state => state.addNotification);
  const removeNotification = useUIStore(state => state.removeNotification);
  const openModal = useUIStore(state => state.openModal);
  const closeModal = useUIStore(state => state.closeModal);
  const setLoading = useUIStore(state => state.setLoading);
  const setError = useUIStore(state => state.setError);
  const clearError = useUIStore(state => state.clearError);
  const reset = useUIStore(state => state.reset);

  return {
    // State
    theme,
    sidebarOpen,
    activeTab,
    notifications,
    modals,
    error,
    hasNotifications,
    hasModals,
    isAnyLoading,
    // Actions
    setTheme,
    toggleSidebar,
    setActiveTab,
    addNotification,
    removeNotification,
    openModal,
    closeModal,
    setLoading,
    setError,
    clearError,
    reset,
  };
};

/**
 * Hook for theme management
 */
export const useTheme = () => {
  const theme = useUIStore(selectors.theme);
  const setTheme = useUIStore(state => state.setTheme);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
  };
};

/**
 * Hook for sidebar management
 */
export const useSidebar = () => {
  const sidebarOpen = useUIStore(selectors.sidebarOpen);
  const toggleSidebar = useUIStore(state => state.toggleSidebar);

  return {
    sidebarOpen,
    toggleSidebar,
  };
};

/**
 * Hook for tab management
 */
export const useTabs = () => {
  const activeTab = useUIStore(selectors.activeTab);
  const setActiveTab = useUIStore(state => state.setActiveTab);

  return {
    activeTab,
    setActiveTab,
  };
};

/**
 * Hook for notification management
 */
export const useNotifications = () => {
  const notifications = useUIStore(selectors.notifications);
  const hasNotifications = useUIStore(selectors.hasNotifications);
  const addNotification = useUIStore(state => state.addNotification);
  const removeNotification = useUIStore(state => state.removeNotification);

  const addSuccessNotification = useCallback(
    (title: string, message: string, duration?: number) => {
      addNotification({
        type: 'success',
        title,
        message,
        duration,
      });
    },
    [addNotification]
  );

  const addErrorNotification = useCallback(
    (title: string, message: string, duration?: number) => {
      addNotification({
        type: 'error',
        title,
        message,
        duration,
      });
    },
    [addNotification]
  );

  const addWarningNotification = useCallback(
    (title: string, message: string, duration?: number) => {
      addNotification({
        type: 'warning',
        title,
        message,
        duration,
      });
    },
    [addNotification]
  );

  const addInfoNotification = useCallback(
    (title: string, message: string, duration?: number) => {
      addNotification({
        type: 'info',
        title,
        message,
        duration,
      });
    },
    [addNotification]
  );

  const clearAllNotifications = useCallback(() => {
    notifications.forEach(notification => {
      removeNotification(notification.id);
    });
  }, [notifications, removeNotification]);

  return {
    notifications,
    hasNotifications,
    addNotification,
    addSuccessNotification,
    addErrorNotification,
    addWarningNotification,
    addInfoNotification,
    removeNotification,
    clearAllNotifications,
  };
};

/**
 * Hook for modal management
 */
export const useModals = () => {
  const modals = useUIStore(selectors.modals);
  const hasModals = useUIStore(selectors.hasModals);
  const openModal = useUIStore(state => state.openModal);
  const closeModal = useUIStore(state => state.closeModal);

  return {
    modals,
    hasModals,
    openModal,
    closeModal,
  };
};

/**
 * Hook for loading state management
 */
export const useLoading = () => {
  const isLoading = useUIStore(selectors.isLoading);
  const isAnyLoading = useUIStore(selectors.isAnyLoading);
  const setLoading = useUIStore(state => state.setLoading);

  return {
    isLoading,
    isAnyLoading,
    setLoading,
  };
};

/**
 * Hook for error management
 */
export const useError = () => {
  const error = useUIStore(selectors.error);
  const setError = useUIStore(state => state.setError);
  const clearError = useUIStore(state => state.clearError);

  return {
    error,
    setError,
    clearError,
  };
};
