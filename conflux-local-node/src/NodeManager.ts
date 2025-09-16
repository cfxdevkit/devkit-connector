import { ConfluxNode } from "./ConfluxNode";
import { createPublicClient, http } from "cive";
import { createPublicClient as createViemClient, http as viemHttp } from "viem";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { NodeConfig, NodeStatus } from "./types";

export class NodeManager {
  private node: ConfluxNode;
  private spinner: any = null;

  constructor() {
    this.node = new ConfluxNode();
  }

  async start(config: NodeConfig = {}): Promise<void> {
    const {
      corePort = 12537,
      evmPort = 8545,
      blockInterval = 1000,
      chainId = 1111,
      evmChainId = 2222,
      dataDir = ".conflux-dev",
      silent = false,
      walletMode = "mnemonic",
      mnemonic,
      privateKey,
      fundWallets = true,
      walletCount = 10,
    } = config;

    if (!silent) {
      this.spinner = ora("Starting Conflux node...").start();
    }

    try {
      await this.node.start(config);

      if (!silent) {
        this.spinner?.succeed(
          chalk.green("Conflux node started successfully!")
        );
        console.log(chalk.blue(`🔗 Core RPC: http://127.0.0.1:${corePort}`));
        console.log(chalk.blue(`🔗 EVM RPC: http://127.0.0.1:${evmPort}`));
        console.log(chalk.blue(`⏱️  Block interval: ${blockInterval}ms`));
      }
    } catch (error) {
      this.spinner?.fail(chalk.red("Failed to start node"));
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isSilent()) {
      this.spinner = ora("Stopping Conflux node...").start();
    }

    try {
      await this.node.stop();
      if (!this.isSilent()) {
        this.spinner?.succeed(chalk.green("Node stopped successfully!"));
      }
    } catch (error) {
      if (!this.isSilent()) {
        this.spinner?.fail(chalk.red("Failed to stop node"));
      }
      throw error;
    }
  }

  async startDev(config: NodeConfig = {}): Promise<void> {
    await this.start(config);

    if (!this.isSilent()) {
      console.log(
        chalk.yellow("🔧 Development mode active. Press Ctrl+C to stop.")
      );
    }

    // Keep process alive
    process.on("SIGINT", async () => {
      if (!this.isSilent()) {
        console.log(
          chalk.yellow("\n🛑 Shutting down development environment...")
        );
      }
      await this.stop();
      process.exit(0);
    });

    // Keep alive
    setInterval(() => {}, 1000);
  }

  async getStatus(): Promise<NodeStatus> {
    return this.node.getStatus();
  }

  async reset(): Promise<void> {
    await this.stop();

    // Clean up data directory
    const dataDir = path.join(process.cwd(), ".conflux-dev");
    if (await fs.pathExists(dataDir)) {
      await fs.remove(dataDir);
    }

    if (!this.isSilent()) {
      console.log(chalk.green("Node data reset complete!"));
    }
  }

  getCoreClient() {
    return this.node.getCoreClient();
  }

  getEvmClient() {
    return this.node.getEvmClient();
  }

  private isSilent(): boolean {
    // Check if we're in silent mode by looking at console methods
    return console.log === (() => {});
  }
}
