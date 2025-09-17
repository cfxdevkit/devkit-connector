// API Configuration
export const API_CONFIG = {
  // Server API base URL
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',

  // API endpoints
  ENDPOINTS: {
    WALLET: '/api/wallet',
    CONTRACTS: '/api/contracts',
    HEALTH: '/health'
  }
};

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}