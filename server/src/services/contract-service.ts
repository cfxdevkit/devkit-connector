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

// Import the generated contract configuration at runtime
let contractConfig: any;

export class ContractService {
  private espaceClient: any;
  private espaceWallet: any;
  private deployments: Map<string, DeploymentResult> = new Map();
  private contractConfig: any;

  constructor(config: ContractServiceConfig) {
    console.log(`🔗 EVM_RPC_URL: ${config.espaceRpcUrl}`);

    // Load contract configuration at runtime
    try {
      const configPath = path.resolve(__dirname, '../../../shared/contract-config.json');
      console.log(`🔍 Looking for config at: ${configPath}`);

      if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf8');
        this.contractConfig = JSON.parse(configData);
        console.log(`📋 Loaded contract config with ${Object.keys(this.contractConfig.contracts).length} contracts`);
      } else {
        console.warn(`⚠️ Contract config not found at ${configPath}`);
        this.contractConfig = { contracts: {} };
      }
    } catch (error) {
      console.warn(`⚠️ Failed to load contract config: ${error}`);
      this.contractConfig = { contracts: {} };
    }

    // Initialize EVM space connection using viem
    const account = privateKeyToAccount(config.privateKey as `0x${string}`);

    this.espaceClient = createPublicClient({
      transport: http(config.espaceRpcUrl),
    });

    this.espaceWallet = createWalletClient({
      account,
      transport: http(config.espaceRpcUrl),
    });

    // Load deployments (legacy support)
    this.loadDeployments(config.deploymentsPath);

    // Load contracts from the generated configuration
    this.loadContractConfig();
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
              console.log(`📄 Loaded legacy ${key} deployment: ${deployment.address}`);
            }
          }
        }
      }
    } catch (error) {
      console.warn("⚠️ Failed to load legacy deployments:", error);
    }
  }

  private loadContractConfig(): void {
    try {
      for (const [contractName, contract] of Object.entries(this.contractConfig.contracts)) {
        const deploymentResult: DeploymentResult = {
          network: (contract as any).network,
          contract: contractName,
          address: (contract as any).address,
          txHash: (contract as any).metadata?.txHash || '0x0',
          gasUsed: (contract as any).metadata?.gasUsed || '0',
          timestamp: (contract as any).metadata?.timestamp || new Date().toISOString(),
          mock: (contract as any).metadata?.mock || false
        };

        // Override legacy deployments with config data (config is the source of truth)
        this.deployments.set(contractName, deploymentResult);
        console.log(`🔧 Loaded config ${contractName}: ${(contract as any).address} (${(contract as any).source})`);
      }
    } catch (error) {
      console.warn("⚠️ Failed to load contract config:", error);
    }
  }

  // Get contract status
  async getContractStatus(): Promise<ContractStatus> {
    // Try to get Counter from multiple possible names
    const counterDeployment = this.deployments.get("Counter") ||
                              this.deployments.get("counter") ||
                              this.deployments.get("CounterModule#Counter");

    const delegationDeployment = this.deployments.get("DelegationManager") ||
                                 this.deployments.get("delegation") ||
                                 this.deployments.get("DelegationManagerModule#DelegationManager");

    console.log(`📊 Contract status - Counter: ${counterDeployment?.address}, Delegation: ${delegationDeployment?.address}`);

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

  // Get wallet address
  getWalletAddress(): string {
    return this.espaceWallet.account.address;
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
