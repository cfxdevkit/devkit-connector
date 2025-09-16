import axios, { AxiosInstance } from 'axios';

export interface ContractClientConfig {
  baseURL: string;
  timeout?: number;
}

export interface DelegationData {
  delegate: string;
  limit: string;
  active: boolean;
  createdAt: string;
}

export interface ContractResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  transactionHash?: string;
  gasUsed?: string;
  mock?: boolean;
}

export class ContractClient {
  private client: AxiosInstance;

  constructor(config: ContractClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Contract status
  async getStatus(): Promise<ContractResponse> {
    try {
      const response = await this.client.get('/api/contracts/status');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // eSpace contract methods
  async createEspaceDelegation(delegate: string, limit: string): Promise<ContractResponse> {
    try {
      const response = await this.client.post('/api/contracts/espace/create-delegation', {
        delegate,
        limit
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async revokeEspaceDelegation(): Promise<ContractResponse> {
    try {
      const response = await this.client.post('/api/contracts/espace/revoke-delegation');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getEspaceDelegation(delegator: string): Promise<ContractResponse<DelegationData>> {
    try {
      const response = await this.client.get(`/api/contracts/espace/get-delegation/${delegator}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getEspaceOwner(): Promise<ContractResponse<{ owner: string }>> {
    try {
      const response = await this.client.get('/api/contracts/espace/owner');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Core contract methods (with mock fallback)
  async createCoreDelegation(delegate: string, limit: string): Promise<ContractResponse> {
    try {
      const response = await this.client.post('/api/contracts/core/create-delegation', {
        delegate,
        limit
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async revokeCoreDelegation(): Promise<ContractResponse> {
    try {
      const response = await this.client.post('/api/contracts/core/revoke-delegation');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getCoreDelegation(delegator: string): Promise<ContractResponse<DelegationData>> {
    try {
      const response = await this.client.get(`/api/contracts/core/get-delegation/${delegator}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getCoreOwner(): Promise<ContractResponse<{ owner: string }>> {
    try {
      const response = await this.client.get('/api/contracts/core/owner');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ContractResponse> {
    try {
      const response = await this.client.get('/api/contracts/health');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Utility methods
  async isHealthy(): Promise<boolean> {
    const health = await this.healthCheck();
    return health.success && health.data?.status === 'healthy';
  }

  async getContractAddresses(): Promise<{ espace?: string; core?: string }> {
    const status = await this.getStatus();
    if (!status.success || !status.data?.contracts) {
      return {};
    }

    return {
      espace: status.data.contracts.espace.address,
      core: status.data.contracts.core.address
    };
  }
}
