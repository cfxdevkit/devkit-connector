// ============================================================================
// API Client - HTTP client for server communication
// ============================================================================

import { APIConfig, APIResponse } from '../types';

// ============================================================================
// API Client Class
// ============================================================================

export class APIClient {
  private config: APIConfig;
  private defaultHeaders: Record<string, string>;

  constructor(config: APIConfig) {
    this.config = {
      timeout: 10000,
      retries: 3,
      ...config,
    };
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // ====================================================================
  // HTTP Methods
  // ====================================================================

  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  private async get<T = unknown>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  private async post<T = unknown>(
    endpoint: string,
    body?: unknown
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private async put<T = unknown>(
    endpoint: string,
    body?: unknown
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private async delete<T = unknown>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ====================================================================
  // Connection API
  // ====================================================================

  async connect(config?: {
    chainId?: string;
    rpcUrl?: string;
  }): Promise<APIResponse> {
    return this.post('/api/connect', { config });
  }

  async disconnect(): Promise<APIResponse> {
    return this.post('/api/disconnect');
  }

  // ====================================================================
  // Node API
  // ====================================================================

  async getNodeStatus(): Promise<APIResponse> {
    return this.get('/api/node/status');
  }

  async startNode(config?: {
    chainId?: string;
    rpcUrl?: string;
  }): Promise<APIResponse> {
    return this.post('/api/node/start', { config });
  }

  async stopNode(): Promise<APIResponse> {
    return this.post('/api/node/stop');
  }

  async restartNode(config?: {
    chainId?: string;
    rpcUrl?: string;
  }): Promise<APIResponse> {
    return this.post('/api/node/restart', { config });
  }

  // ====================================================================
  // Wallet API
  // ====================================================================

  async getWallets(): Promise<APIResponse> {
    return this.get('/api/wallets');
  }

  async createWallet(mnemonic?: string): Promise<APIResponse> {
    return this.post('/api/wallets', { mnemonic });
  }

  async importWallet(privateKey: string): Promise<APIResponse> {
    return this.post('/api/wallets/import', { privateKey });
  }

  async selectWallet(address: string): Promise<APIResponse> {
    return this.put(`/api/wallets/${address}/select`);
  }

  async getWalletBalance(address: string): Promise<APIResponse> {
    return this.get(`/api/wallets/${address}/balance`);
  }

  async removeWallet(address: string): Promise<APIResponse> {
    return this.delete(`/api/wallets/${address}`);
  }

  // ====================================================================
  // Contract API
  // ====================================================================

  async getContracts(): Promise<APIResponse> {
    return this.get('/api/contracts');
  }

  async deployContract(
    contractName: string,
    args?: unknown[]
  ): Promise<APIResponse> {
    return this.post('/api/contracts', { contractName, args });
  }

  async selectContract(address: string): Promise<APIResponse> {
    return this.put(`/api/contracts/${address}/select`);
  }

  async callContractMethod(
    address: string,
    method: string,
    args: unknown[]
  ): Promise<APIResponse> {
    return this.post(`/api/contracts/${address}/call`, { method, args });
  }

  async removeContract(address: string): Promise<APIResponse> {
    return this.delete(`/api/contracts/${address}`);
  }

  // ====================================================================
  // Network API
  // ====================================================================

  async getNetworks(): Promise<APIResponse> {
    return this.get('/api/networks');
  }

  async switchNetwork(networkId: string): Promise<APIResponse> {
    return this.post('/api/networks/switch', { networkId });
  }

  // ====================================================================
  // Health Check
  // ====================================================================

  async healthCheck(): Promise<APIResponse> {
    return this.get('/health');
  }
}
