import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { UIStore, UIState, UIActions } from './types';

// ============================================================================
// Initial State
// ============================================================================

const initialState: UIState = {
  // Theme & Appearance
  theme: 'system',

  // Layout & Navigation
  sidebarOpen: true,
  activeTab: 'dashboard',

  // Notifications & Modals
  notifications: [],
  modals: [],

  // Loading States
  loading: {},

  // Error State
  error: null,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useUIStore = create<UIStore>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        ...initialState,

        // ====================================================================
        // Theme & Appearance Actions
        // ====================================================================

        setTheme: theme => {
          set(state => {
            state.theme = theme;
          });
        },

        // ====================================================================
        // Layout & Navigation Actions
        // ====================================================================

        toggleSidebar: () => {
          set(state => {
            state.sidebarOpen = !state.sidebarOpen;
          });
        },

        setActiveTab: tab => {
          set(state => {
            state.activeTab = tab;
          });
        },

        // ====================================================================
        // Notifications & Modals Actions
        // ====================================================================

        addNotification: notification => {
          const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newNotification = {
            ...notification,
            id,
            timestamp: new Date(),
            dismissible: notification.dismissible ?? true,
          };

          set(state => {
            state.notifications.push(newNotification);
          });

          // Auto-dismiss after duration
          if (notification.duration && notification.duration > 0) {
            setTimeout(() => {
              get().removeNotification(id);
            }, notification.duration);
          }
        },

        removeNotification: id => {
          set(state => {
            state.notifications = state.notifications.filter(n => n.id !== id);
          });
        },

        openModal: (type, props) => {
          const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newModal = {
            id,
            type,
            props,
            isOpen: true,
          };

          set(state => {
            state.modals.push(newModal);
          });

          return id;
        },

        closeModal: id => {
          set(state => {
            state.modals = state.modals.filter(m => m.id !== id);
          });
        },

        // ====================================================================
        // Loading States Actions
        // ====================================================================

        setLoading: (key, loading) => {
          set(state => {
            if (loading) {
              state.loading[key] = true;
            } else {
              delete state.loading[key];
            }
          });
        },

        // ====================================================================
        // Error Handling Actions
        // ====================================================================

        setError: error => {
          set(state => {
            state.error = error;
          });
        },

        clearError: () => {
          set(state => {
            state.error = null;
          });
        },

        // ====================================================================
        // Utility Actions
        // ====================================================================

        reset: () => {
          set(state => {
            Object.assign(state, initialState);
          });
        },
      })),
      {
        name: 'conflux-devkit-ui-state',
        partialize: state => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          activeTab: state.activeTab,
        }),
      }
    )
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectors = {
  // Theme & Appearance
  theme: (state: UIStore) => state.theme,

  // Layout & Navigation
  sidebarOpen: (state: UIStore) => state.sidebarOpen,
  activeTab: (state: UIStore) => state.activeTab,

  // Notifications & Modals
  notifications: (state: UIStore) => state.notifications,
  modals: (state: UIStore) => state.modals,

  // Loading States
  isLoading: (state: UIStore) => (key: string) => state.loading[key] ?? false,

  // Error State
  error: (state: UIStore) => state.error,

  // Computed
  hasNotifications: (state: UIStore) => state.notifications.length > 0,
  hasModals: (state: UIStore) => state.modals.length > 0,
  isAnyLoading: (state: UIStore) => Object.keys(state.loading).length > 0,
};
