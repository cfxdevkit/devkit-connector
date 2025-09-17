// Simplified API services for checklist functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// System API
export const systemApi = {
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      if (!response.ok) throw new Error('Health check failed');
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      return { status: 'unhealthy', error: error.message };
    }
  },
};

// Node API
export const nodeApi = {
  async getNodeStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/node/status`);
      if (!response.ok) throw new Error('Node status check failed');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Node status error:', error);
      return {
        success: false,
        data: { running: false, healthy: false, chainId: null, uptime: 0 },
      };
    }
  },

  async startNode() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/node/start`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to start node');
      return await response.json();
    } catch (error) {
      console.error('Start node error:', error);
      return { success: false, error: error.message };
    }
  },
};

// Wallet API
export const walletApi = {
  async loadWallet() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wallet/load`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to load wallet');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Load wallet error:', error);
      return { success: false, error: error.message };
    }
  },

  async getWalletInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/wallet/info`);
      if (!response.ok) throw new Error('Failed to get wallet info');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Get wallet info error:', error);
      return { success: false, error: error.message };
    }
  },
};

// Contract API
export const contractApi = {
  async getStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contracts/status`);
      if (!response.ok) throw new Error('Failed to get contract status');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Get contract status error:', error);
      return {
        success: false,
        data: { espace: { deployed: false }, core: { deployed: false } },
      };
    }
  },

  async deployContracts() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contracts/deploy`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to deploy contracts');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Deploy contracts error:', error);
      return { success: false, error: error.message };
    }
  },
};

// Hardhat API
export const hardhatApi = {
  async getModules() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hardhat/modules`);
      if (!response.ok) throw new Error('Failed to get modules');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Get modules error:', error);
      return { success: false, data: [] };
    }
  },

  async getDeployments() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hardhat/deployments`);
      if (!response.ok) throw new Error('Failed to get deployments');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Get deployments error:', error);
      return { success: false, data: [] };
    }
  },
};
