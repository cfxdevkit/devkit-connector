"use client";

import axios from "axios";
import { hardhatApi } from "./hardhatApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// API client with error handling
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Wallet API functions
export const walletApi = {
  // Load server wallet
  loadWallet: async () => {
    const response = await apiClient.post("/api/wallet", {
      action: "load_wallet",
    });
    return response.data;
  },

  // Clear server wallet
  clearWallet: async () => {
    const response = await apiClient.post("/api/wallet", {
      action: "clear_wallet",
    });
    return response.data;
  },

  // Sign message
  signMessage: async (message: string) => {
    const response = await apiClient.post("/api/wallet", {
      action: "sign_message",
      message,
    });
    return response.data;
  },

  // Sign transaction
  signTransaction: async (transaction: any) => {
    const response = await apiClient.post("/api/wallet", {
      action: "sign_transaction",
      transaction,
    });
    return response.data;
  },

  // Create delegation
  createDelegation: async (delegate: string, limit: string) => {
    const response = await apiClient.post("/api/wallet", {
      action: "create_delegation",
      delegate,
      limit,
    });
    return response.data;
  },
};

// Contract API functions
export const contractApi = {
  // Get contract status
  getStatus: async () => {
    const response = await apiClient.get("/api/contracts/status");
    return response.data;
  },

  // Get network info
  getNetworkInfo: async () => {
    const response = await apiClient.get("/api/contracts/network");
    return response.data;
  },

  // Get counter status
  getCounterStatus: async () => {
    const response = await apiClient.get("/api/contracts/counter/status");
    return response.data;
  },

  // Perform counter operation
  performCounterOperation: async (
    operation: string,
    value?: number,
    values?: number[]
  ) => {
    const response = await apiClient.post("/api/contracts/counter/operation", {
      operation,
      value,
      values,
    });
    return response.data;
  },

  // Create delegation
  createDelegation: async (delegate: string, limit: string) => {
    const response = await apiClient.post("/api/contracts/createDelegation", {
      delegate,
      limit,
    });
    return response.data;
  },

  // Revoke delegation
  revokeDelegation: async () => {
    const response = await apiClient.post("/api/contracts/revokeDelegation");
    return response.data;
  },

  // Get delegation status
  getDelegationStatus: async () => {
    const response = await apiClient.get("/api/contracts/delegation/status");
    return response.data;
  },
};

// System API functions
export const systemApi = {
  // Health check
  healthCheck: async () => {
    const response = await apiClient.get("/health");
    return response.data;
  },

  // Contract health check
  contractHealthCheck: async () => {
    const response = await apiClient.get("/api/contracts/health");
    return response.data;
  },
};

// Node management functions
export const nodeApi = {
  // Start node
  startNode: async () => {
    const response = await apiClient.post("/api/node/start");
    return response.data;
  },

  // Stop node
  stopNode: async () => {
    const response = await apiClient.post("/api/node/stop");
    return response.data;
  },

  // Restart node
  restartNode: async () => {
    const response = await apiClient.post("/api/node/restart");
    return response.data;
  },

  // Get node status
  getNodeStatus: async () => {
    const response = await apiClient.get("/api/node/status");
    return response.data;
  },

  // Get node logs
  getNodeLogs: async (limit = 50) => {
    const response = await apiClient.get(`/api/node/logs?limit=${limit}`);
    return response.data;
  },
};

// Hardhat API functions
export { hardhatApi };

export default apiClient;
