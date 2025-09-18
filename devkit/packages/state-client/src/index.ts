// ============================================================================
// @conflux-devkit/state-client
// Client-side API client and hooks for Conflux DevKit applications
// ============================================================================

// Types
export type {
  APIConfig,
  ClientState,
  ClientActions,
  ClientStore,
  WebSocketEvent,
  ConnectionEvent,
  NodeEvent,
  WalletEvent,
  ContractEvent,
  NetworkEvent,
  ErrorEvent,
  APIResponse,
  ConnectionResponse,
  NodeResponse,
  WalletResponse,
  WalletsResponse,
  ContractResponse,
  ContractsResponse,
  NetworkResponse,
  NetworksResponse,
} from './types';

// API
export { APIClient } from './api/APIClient';
export { WebSocketClient } from './api/WebSocketClient';

// Hooks
export { useClientState, useClientStore } from './hooks/useClientState';

// Default export
export { useClientState as default } from './hooks/useClientState';
