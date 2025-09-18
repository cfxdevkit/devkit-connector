// ============================================================================
// UI State Types
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number;
  dismissible?: boolean;
}

export interface ModalState {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  isOpen: boolean;
}

export interface UIState {
  // Theme & Appearance
  theme: Theme;

  // Layout & Navigation
  sidebarOpen: boolean;
  activeTab: string;

  // Notifications & Modals
  notifications: NotificationState[];
  modals: ModalState[];

  // Loading States
  loading: Record<string, boolean>;

  // Error State
  error: string | null;
}

export interface UIActions {
  // Theme & Appearance
  setTheme: (theme: Theme) => void;

  // Layout & Navigation
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;

  // Notifications & Modals
  addNotification: (
    notification: Omit<NotificationState, 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;
  openModal: (type: string, props?: Record<string, unknown>) => string;
  closeModal: (id: string) => void;

  // Loading States
  setLoading: (key: string, loading: boolean) => void;

  // Error Handling
  setError: (error: string) => void;
  clearError: () => void;

  // Utility
  reset: () => void;
}

export type UIStore = UIState & UIActions;
