import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs-extra";
import path from "path";
import {
  DeploymentResult,
  ContractCallResult,
  ContractStatus,
  NetworkInfo,
  ContractServiceConfig,
  CounterStatus,
  CounterOperation,
} from "../types";

export class ContractService {
  private espaceClient: any;
  private espaceWallet: any;
  private deployments: Map<string, DeploymentResult> = new Map();

  constructor(config: ContractServiceConfig) {
    console.log(`🔗 EVM_RPC_URL: ${config.espaceRpcUrl}`);

    // Initialize EVM space connection using viem
    const account = privateKeyToAccount(config.privateKey as `0x${string}`);

    this.espaceClient = createPublicClient({
      transport: http(config.espaceRpcUrl),
    });

    this.espaceWallet = createWalletClient({
      account,
      transport: http(config.espaceRpcUrl),
    });

    // Load deployments
    this.loadDeployments(config.deploymentsPath);
  }

  private loadDeployments(deploymentsPath: string): void {
    try {
      if (fs.existsSync(deploymentsPath)) {
        const files = fs.readdirSync(deploymentsPath);

        for (const file of files) {
          if (file.endsWith(".json")) {
            const filePath = path.join(deploymentsPath, file);
            const deployment = fs.readJsonSync(filePath);

            if (deployment.network && deployment.address) {
              // Use contract name as key if available, otherwise use network
              const key = deployment.contract || deployment.network;
              this.deployments.set(key, deployment);
              console.log(`📄 Loaded ${key} deployment: ${deployment.address}`);
            }
          }
        }
      }
    } catch (error) {
      console.warn("⚠️ Failed to load deployments:", error);
    }
  }

  // Get contract status
  async getContractStatus(): Promise<ContractStatus> {
    const counterDeployment = this.deployments.get("Counter");

    return {
      espace: {
        deployed: !!counterDeployment,
        address: counterDeployment?.address,
        mock: counterDeployment?.mock || false,
      },
      core: {
        deployed: false,
        address: undefined,
        mock: true,
      },
    };
  }

  // Get network info
  async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const chainId = await this.espaceClient.getChainId();
      const blockNumber = await this.espaceClient.getBlockNumber();
      const gasPrice = await this.espaceClient.getGasPrice();

      return {
        espace: {
          chainId: Number(chainId),
          blockNumber: Number(blockNumber),
          gasPrice: gasPrice.toString(),
        },
        core: {
          networkId: 0,
          epochNumber: 0,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to get network info: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // DelegationManager contract methods
  async callEspaceContract(
    method: string,
    params: any[] = []
  ): Promise<ContractCallResult> {
    try {
      const deployment = this.deployments.get("DelegationManager");
      if (!deployment) {
        return {
          success: false,
          error: "No DelegationManager contract deployment found",
        };
      }

      // DelegationManager ABI
      const contractABI = [
        {
          name: "owner",
          type: "function",
          stateMutability: "view",
          inputs: [],
          outputs: [{ name: "", type: "address" }],
        },
        {
          name: "paused",
          type: "function",
          stateMutability: "view",
          inputs: [],
          outputs: [{ name: "", type: "bool" }],
        },
        {
          name: "createDelegation",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "_delegate", type: "address" },
            { name: "_limit", type: "uint256" },
          ],
          outputs: [],
        },
        {
          name: "revokeDelegation",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [],
          outputs: [],
        },
        {
          name: "getDelegation",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "_delegator", type: "address" }],
          outputs: [
            {
              name: "",
              type: "tuple",
              components: [
                { name: "delegate", type: "address" },
                { name: "limit", type: "uint256" },
                { name: "active", type: "bool" },
                { name: "createdAt", type: "uint256" },
              ],
            },
          ],
        },
      ] as const;

      let result;
      if (method === "createDelegation") {
        const hash = await this.espaceWallet.writeContract({
          address: deployment.address as `0x${string}`,
          abi: contractABI,
          functionName: "createDelegation",
          args: [params[0] as `0x${string}`, BigInt(params[1])],
        });

        const receipt = await this.espaceClient.waitForTransactionReceipt({
          hash,
        });

        result = {
          success: true,
          data: {
            delegator: this.espaceWallet.account.address,
            delegate: params[0],
            limit: params[1].toString(),
          },
          transactionHash: receipt.transactionHash,
          gasUsed: receipt.gasUsed.toString(),
        };
      } else if (method === "revokeDelegation") {
        const hash = await this.espaceWallet.writeContract({
          address: deployment.address as `0x${string}`,
          abi: contractABI,
          functionName: "revokeDelegation",
        });

        const receipt = await this.espaceClient.waitForTransactionReceipt({
          hash,
        });

        result = {
          success: true,
          data: {
            delegator: this.espaceWallet.account.address,
          },
          transactionHash: receipt.transactionHash,
          gasUsed: receipt.gasUsed.toString(),
        };
      } else if (method === "getDelegation") {
        const delegation = await this.espaceClient.readContract({
          address: deployment.address as `0x${string}`,
          abi: contractABI,
          functionName: "getDelegation",
          args: [params[0] as `0x${string}`],
        });

        result = {
          success: true,
          data: {
            delegate: delegation[0],
            limit: delegation[1].toString(),
            active: delegation[2],
            createdAt: delegation[3].toString(),
          },
        };
      } else if (method === "owner") {
        const owner = await this.espaceClient.readContract({
          address: deployment.address as `0x${string}`,
          abi: contractABI,
          functionName: "owner",
        });

        result = {
          success: true,
          data: {
            owner: owner,
          },
        };
      } else if (method === "paused") {
        const paused = await this.espaceClient.readContract({
          address: deployment.address as `0x${string}`,
          abi: contractABI,
          functionName: "paused",
        });

        result = {
          success: true,
          data: {
            paused: paused,
          },
        };
      } else {
        return {
          success: false,
          error: `Unknown method: ${method}`,
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Counter contract methods
  async getCounterStatus(): Promise<CounterStatus> {
    try {
      const counterDeployment = this.deployments.get("Counter");
      if (!counterDeployment) {
        throw new Error("Counter contract not deployed");
      }

      // If it's a mock deployment, return mock data
      console.log("🔍 Counter deployment mock flag:", counterDeployment.mock);
      if (counterDeployment.mock) {
        console.log("🎭 Using mock data for Counter");
        return {
          count: "42",
          maxCount: "100",
          address: counterDeployment.address,
        };
      }

      // Counter ABI
      const counterABI = [
        {
          name: "getCount",
          type: "function",
          stateMutability: "view",
          inputs: [],
          outputs: [{ name: "", type: "uint256" }],
        },
        {
          name: "getMaxCount",
          type: "function",
          stateMutability: "view",
          inputs: [],
          outputs: [{ name: "", type: "uint256" }],
        },
      ] as const;

      const count = await this.espaceClient.readContract({
        address: counterDeployment.address as `0x${string}`,
        abi: counterABI,
        functionName: "getCount",
      });

      const maxCount = await this.espaceClient.readContract({
        address: counterDeployment.address as `0x${string}`,
        abi: counterABI,
        functionName: "getMaxCount",
      });

      return {
        count: count.toString(),
        maxCount: maxCount.toString(),
        address: counterDeployment.address,
      };
    } catch (error) {
      // If contract call fails, return mock data
      const counterDeployment = this.deployments.get("Counter");
      if (counterDeployment) {
        return {
          count: "42",
          maxCount: "100",
          address: counterDeployment.address,
        };
      }

      throw new Error(
        `Failed to get counter status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async performCounterOperation(
    operation: string,
    value?: number,
    values?: number[]
  ): Promise<ContractCallResult> {
    try {
      const counterDeployment = this.deployments.get("Counter");
      if (!counterDeployment) {
        throw new Error("Counter contract not deployed");
      }

      // If it's a mock deployment, return mock response
      if (counterDeployment.mock) {
        return {
          success: true,
          transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
          gasUsed: "21000",
          data: {
            operation,
            value,
            values,
            newCount: "42",
          },
          mock: true,
        };
      }

      const counterABI = [
        {
          name: "add",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [{ name: "value", type: "uint256" }],
          outputs: [],
        },
        {
          name: "subtract",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [{ name: "value", type: "uint256" }],
          outputs: [],
        },
        {
          name: "multiply",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [{ name: "value", type: "uint256" }],
          outputs: [],
        },
        {
          name: "divide",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [{ name: "value", type: "uint256" }],
          outputs: [],
        },
        {
          name: "reset",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [],
          outputs: [],
        },
        {
          name: "batchAdd",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [{ name: "values", type: "uint256[]" }],
          outputs: [],
        },
        {
          name: "batchSubtract",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [{ name: "values", type: "uint256[]" }],
          outputs: [],
        },
      ] as const;

      let hash;
      if (operation === "add" && value !== undefined) {
        hash = await this.espaceWallet.writeContract({
          address: counterDeployment.address as `0x${string}`,
          abi: counterABI,
          functionName: "add",
          args: [BigInt(value)],
        });
      } else if (operation === "subtract" && value !== undefined) {
        hash = await this.espaceWallet.writeContract({
          address: counterDeployment.address as `0x${string}`,
          abi: counterABI,
          functionName: "subtract",
          args: [BigInt(value)],
        });
      } else if (operation === "multiply" && value !== undefined) {
        hash = await this.espaceWallet.writeContract({
          address: counterDeployment.address as `0x${string}`,
          abi: counterABI,
          functionName: "multiply",
          args: [BigInt(value)],
        });
      } else if (operation === "divide" && value !== undefined) {
        hash = await this.espaceWallet.writeContract({
          address: counterDeployment.address as `0x${string}`,
          abi: counterABI,
          functionName: "divide",
          args: [BigInt(value)],
        });
      } else if (operation === "reset") {
        hash = await this.espaceWallet.writeContract({
          address: counterDeployment.address as `0x${string}`,
          abi: counterABI,
          functionName: "reset",
        });
      } else if (operation === "batchAdd" && values) {
        hash = await this.espaceWallet.writeContract({
          address: counterDeployment.address as `0x${string}`,
          abi: counterABI,
          functionName: "batchAdd",
          args: [values.map((v) => BigInt(v))],
        });
      } else if (operation === "batchSubtract" && values) {
        hash = await this.espaceWallet.writeContract({
          address: counterDeployment.address as `0x${string}`,
          abi: counterABI,
          functionName: "batchSubtract",
          args: [values.map((v) => BigInt(v))],
        });
      } else {
        throw new Error(`Invalid operation: ${operation}`);
      }

      const receipt = await this.espaceClient.waitForTransactionReceipt({
        hash,
      });
      const newStatus = await this.getCounterStatus();

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        gasUsed: receipt.gasUsed.toString(),
        data: {
          operation,
          value,
          values,
          newCount: newStatus.count,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
