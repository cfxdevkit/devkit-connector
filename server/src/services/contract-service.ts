import { ethers } from "ethers";
import { Conflux } from "js-conflux-sdk";
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
  private espaceProvider: ethers.JsonRpcProvider;
  private coreConflux: Conflux;
  private espaceWallet: ethers.Wallet;
  private coreAccount: any;
  private deployments: Map<string, DeploymentResult> = new Map();

  constructor(config: ContractServiceConfig) {
    // Initialize eSpace (EVM) connection
    this.espaceProvider = new ethers.JsonRpcProvider(config.espaceRpcUrl);
    this.espaceWallet = new ethers.Wallet(
      config.privateKey,
      this.espaceProvider
    );

    // Initialize Core connection (simplified - not used)
    this.coreConflux = new Conflux({
      url: config.coreRpcUrl,
      networkId: 1111,
    });
    this.coreAccount = this.coreConflux.wallet.addPrivateKey(config.privateKey);

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
    const espaceDeployment = this.deployments.get("DelegationManager");
    const counterDeployment = this.deployments.get("Counter");

    return {
      espace: {
        deployed: !!espaceDeployment,
        address: espaceDeployment?.address,
        mock: espaceDeployment?.mock || false,
      },
      core: {
        deployed: !!counterDeployment,
        address: counterDeployment?.address,
        mock: counterDeployment?.mock || false,
      },
    };
  }

  // Get network info
  async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const espaceNetwork = await this.espaceProvider.getNetwork();
      const espaceBlockNumber = await this.espaceProvider.getBlockNumber();
      const espaceGasPrice = await this.espaceProvider.getFeeData();

      return {
        espace: {
          chainId: Number(espaceNetwork.chainId),
          blockNumber: espaceBlockNumber,
          gasPrice: espaceGasPrice.gasPrice?.toString() || "0",
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
        "function owner() view returns (address)",
        "function paused() view returns (bool)",
        "function createDelegation(address _delegate, uint256 _limit) external",
        "function revokeDelegation() external",
        "function getDelegation(address _delegator) view returns (tuple(address delegate, uint256 limit, bool active, uint256 createdAt))",
      ];

      const contract = new ethers.Contract(
        deployment.address,
        contractABI,
        this.espaceWallet
      );

      let result;
      if (method === "createDelegation") {
        const tx = await contract.createDelegation(params[0], params[1]);
        const receipt = await tx.wait();

        result = {
          success: true,
          data: {
            delegator: this.espaceWallet.address,
            delegate: params[0],
            limit: params[1].toString(),
          },
          transactionHash: receipt.hash,
          gasUsed: receipt.gasUsed.toString(),
        };
      } else if (method === "revokeDelegation") {
        const tx = await contract.revokeDelegation();
        const receipt = await tx.wait();

        result = {
          success: true,
          data: {
            delegator: this.espaceWallet.address,
          },
          transactionHash: receipt.hash,
          gasUsed: receipt.gasUsed.toString(),
        };
      } else if (method === "getDelegation") {
        const delegation = await contract.getDelegation(params[0]);

        result = {
          success: true,
          data: {
            delegate: delegation.delegate,
            limit: delegation.limit.toString(),
            active: delegation.active,
            createdAt: delegation.createdAt.toString(),
          },
        };
      } else if (method === "owner") {
        const owner = await contract.owner();

        result = {
          success: true,
          data: {
            owner: owner,
          },
        };
      } else if (method === "paused") {
        const paused = await contract.paused();

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
        "function getCount() view returns (uint256)",
        "function getMaxCount() view returns (uint256)",
      ];

      const counterContract = new ethers.Contract(
        counterDeployment.address,
        counterABI,
        this.espaceProvider
      );

      const count = await counterContract.getCount();
      const maxCount = await counterContract.getMaxCount();

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
        "function add(uint256 value) external",
        "function subtract(uint256 value) external",
        "function multiply(uint256 value) external",
        "function divide(uint256 value) external",
        "function reset() external",
        "function batchAdd(uint256[] calldata values) external",
        "function batchSubtract(uint256[] calldata values) external",
      ];

      const counterContract = new ethers.Contract(
        counterDeployment.address,
        counterABI,
        this.espaceWallet
      );

      let tx;
      if (operation === "add" && value !== undefined) {
        tx = await counterContract.add(value);
      } else if (operation === "subtract" && value !== undefined) {
        tx = await counterContract.subtract(value);
      } else if (operation === "multiply" && value !== undefined) {
        tx = await counterContract.multiply(value);
      } else if (operation === "divide" && value !== undefined) {
        tx = await counterContract.divide(value);
      } else if (operation === "reset") {
        tx = await counterContract.reset();
      } else if (operation === "batchAdd" && values) {
        tx = await counterContract.batchAdd(values);
      } else if (operation === "batchSubtract" && values) {
        tx = await counterContract.batchSubtract(values);
      } else {
        throw new Error(`Invalid operation: ${operation}`);
      }

      const receipt = await tx.wait();
      const newStatus = await this.getCounterStatus();

      return {
        success: true,
        transactionHash: tx.hash,
        gasUsed: receipt?.gasUsed?.toString() || "0",
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
