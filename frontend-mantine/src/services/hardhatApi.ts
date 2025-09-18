import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface IgnitionModule {
  name: string;
  path: string;
  description: string;
  contracts: string[];
}

export interface DeploymentResult {
  success: boolean;
  module: string;
  contracts: Array<{
    name: string;
    address: string;
    transactionHash: string;
  }>;
  error?: string;
}

export interface DeploymentHistory {
  chainId: string;
  module: string;
  contract: string;
  address: string;
  transactionHash: string;
  timestamp: string;
}

class HardhatApi {
  private baseURL = `${API_BASE_URL}/api/hardhat`;

  async getModules(): Promise<{
    success: boolean;
    data?: IgnitionModule[];
    error?: string;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/modules`);
      return response.data;
    } catch (error: any) {
      console.error("Error getting Ignition modules:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to get Ignition modules",
      };
    }
  }

  async deployModule(
    module: string,
    network: string = "confluxESpaceLocal"
  ): Promise<{
    success: boolean;
    data?: DeploymentResult;
    error?: string;
    details?: string;
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/deploy`, {
        module,
        network,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error deploying module:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to deploy module",
        details: error.response?.data?.details,
      };
    }
  }

  async getDeployments(): Promise<{
    success: boolean;
    data?: DeploymentHistory[];
    error?: string;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/deployments`);
      return response.data;
    } catch (error: any) {
      console.error("Error getting deployments:", error);
      return {
        success: false,
        error:
          error.response?.data?.error || "Failed to get deployment history",
      };
    }
  }

  async compileContracts(): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    output?: string;
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/compile`);
      return response.data;
    } catch (error: any) {
      console.error("Error compiling contracts:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to compile contracts",
        output: error.response?.data?.details,
      };
    }
  }
}

export const hardhatApi = new HardhatApi();



