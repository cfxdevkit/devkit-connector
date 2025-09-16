import {
  createWalletClient,
  http,
  createPublicClient,
  formatEther,
  parseEther,
} from "viem";
import { ConfluxNode } from "./ConfluxNode";
import { NodeConfig, ExecutionResult } from "./types";

export class ConfluxOperations {
  static async deployContract(
    contractCode: string,
    abi: any[],
    constructorArgs: any[] = [],
    config: NodeConfig = {}
  ): Promise<ExecutionResult<{ address: string; txHash: string }>> {
    const node = new ConfluxNode();

    return node.executeScript(async (node) => {
      const evmClient = node.getEvmClient();
      const miningWallet = node.getMiningWallet();

      if (!miningWallet) {
        throw new Error("No mining wallet available");
      }

      // Create wallet client
      const walletClient = createWalletClient({
        account: miningWallet.privateKey as `0x${string}`,
        transport: http(`http://127.0.0.1:${config.evmPort || 8545}`),
      });

      // Deploy contract
      const hash = await walletClient.deployContract({
        abi,
        bytecode: contractCode as `0x${string}`,
        args: constructorArgs,
        chain: null,
      });

      // Wait for deployment
      const receipt = await evmClient.waitForTransactionReceipt({ hash });

      if (!receipt.contractAddress) {
        throw new Error("Contract deployment failed");
      }

      return {
        address: receipt.contractAddress,
        txHash: hash,
      };
    }, config);
  }

  static async callContractMethod(
    contractAddress: string,
    abi: any[],
    methodName: string,
    args: any[] = [],
    config: NodeConfig = {}
  ): Promise<ExecutionResult<any>> {
    const node = new ConfluxNode();

    return node.executeScript(async (node) => {
      const evmClient = node.getEvmClient();

      // Read contract method
      const result = await evmClient.readContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: methodName,
        args,
      });

      return result;
    }, config);
  }

  static async sendTransaction(
    to: string,
    value: string = "0",
    data: string = "0x",
    config: NodeConfig = {}
  ): Promise<ExecutionResult<{ txHash: string; receipt: any }>> {
    const node = new ConfluxNode();

    return node.executeScript(async (node) => {
      const evmClient = node.getEvmClient();
      const miningWallet = node.getMiningWallet();

      if (!miningWallet) {
        throw new Error("No mining wallet available");
      }

      // Create wallet client
      const walletClient = createWalletClient({
        account: miningWallet.privateKey as `0x${string}`,
        transport: http(`http://127.0.0.1:${config.evmPort || 8545}`),
      });

      // Send transaction
      const hash = await walletClient.sendTransaction({
        to: to as `0x${string}`,
        value: parseEther(value),
        data: data as `0x${string}`,
        chain: null,
      });

      // Wait for receipt
      const receipt = await evmClient.waitForTransactionReceipt({ hash });

      return { txHash: hash, receipt };
    }, config);
  }

  static async getBlockInfo(
    blockNumber?: number,
    config: NodeConfig = {}
  ): Promise<ExecutionResult<any>> {
    const node = new ConfluxNode();

    return node.executeScript(async (node) => {
      const evmClient = node.getEvmClient();

      if (blockNumber) {
        return await evmClient.getBlock({ blockNumber: BigInt(blockNumber) });
      } else {
        return await evmClient.getBlock({ blockTag: "latest" });
      }
    }, config);
  }

  static async runCompleteDeploymentFlow(
    contracts: Array<{ name: string; code: string; abi: any[]; args?: any[] }>,
    config: NodeConfig = {}
  ): Promise<
    ExecutionResult<Array<{ name: string; address: string; txHash: string }>>
  > {
    const node = new ConfluxNode();

    return node.executeScript(async (node) => {
      const evmClient = node.getEvmClient();
      const miningWallet = node.getMiningWallet();

      if (!evmClient || !miningWallet) {
        throw new Error("EVM client or mining wallet not available");
      }

      // Create wallet client
      const walletClient = createWalletClient({
        account: miningWallet.privateKey as `0x${string}`,
        transport: http(`http://127.0.0.1:${config.evmPort || 8545}`),
      });

      const results = [];

      for (const contract of contracts) {
        // Deploy contract
        const hash = await walletClient.deployContract({
          abi: contract.abi,
          bytecode: contract.code as `0x${string}`,
          args: contract.args || [],
          chain: null,
        });

        // Wait for deployment
        const receipt = await evmClient.waitForTransactionReceipt({ hash });

        if (!receipt.contractAddress) {
          throw new Error(`Contract ${contract.name} deployment failed`);
        }

        results.push({
          name: contract.name,
          address: receipt.contractAddress,
          txHash: hash,
        });
      }

      return results;
    }, config);
  }
}
