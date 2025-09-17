import { createServer } from "@xcfx/node";
import { createPublicClient, http } from "cive";
import { createPublicClient as createViemClient, http as viemHttp } from "viem";
import { BIP32Factory } from "bip32";
import { mnemonicToSeed, validateMnemonic } from "bip39";
import { privateKeyToAccount as corePrivateKeyToAccount } from "cive/accounts";
import * as ecc from "tiny-secp256k1";
import { privateKeyToAccount as espacePrivateKeyToAccount } from "viem/accounts";

const bip32 = BIP32Factory(ecc);

export interface ConfluxNodeConfig {
  posReferenceEnableHeight?: number;
  jsonrpcHttpPort?: number;
  jsonrpcWsPort?: number;
  jsonrpcHttpEthPort?: number;
  jsonrpcWsEthPort?: number;
  chainId?: number;
  evmChainId?: number;
  nodeType?: string;
  blockDbType?: string;
  log?: boolean;
  logLevel?: string;
  confluxDataDir?: string;
  devBlockIntervalMs?: number;
  genesisSecrets?: `0x${string}`[];
  genesisEvmSecrets?: `0x${string}`[];
  miningAuthor?: string;
}

export interface WalletInfo {
  index: number;
  coreAddress: string;
  espaceAddress: string;
  corePrivateKey: string;
  espacePrivateKey: string;
  isMining?: boolean;
  balance?: string;
}

export interface NodeStatus {
  running: boolean;
  healthy: boolean;
  uptime: string;
  chainId: number | null;
  processId: number | null;
  error?: string;
  logs: string[];
  wallets?: WalletInfo[];
  coreRpcUrl?: string;
  evmRpcUrl?: string;
}

export const defaultConfluxNodeConfig: ConfluxNodeConfig = {
  posReferenceEnableHeight: 0,
  jsonrpcHttpPort: 12537,
  jsonrpcWsPort: 12535,
  jsonrpcHttpEthPort: 8545,
  jsonrpcWsEthPort: 8546,
  chainId: 2029,
  evmChainId: 2030,
  nodeType: "full",
  blockDbType: "sqlite",
  log: false,
  logLevel: "error",
  devBlockIntervalMs: 1000,
};

export class ConfluxNodeManager {
  private server: any = null;
  private coreClient: any = null;
  private evmClient: any = null;
  private config: ConfluxNodeConfig;
  private mnemonic?: string;
  private wallets: WalletInfo[] = [];
  private miningWallet: WalletInfo | null = null;
  private isRunningFlag = false;
  private nodeLogs: string[] = [];
  private startTime: Date | null = null;

  constructor(config?: Partial<ConfluxNodeConfig>) {
    this.config = { ...defaultConfluxNodeConfig, ...config };

    // Get mnemonic from environment variable
    if (process.env.HARDHAT_VAR_DEPLOYER_MNEMONIC) {
      this.mnemonic = process.env.HARDHAT_VAR_DEPLOYER_MNEMONIC;
    } else {
      // Use default test mnemonic
      this.mnemonic =
        "test test test test test test test test test test test junk";
    }
  }

  /**
   * Sets the mnemonic to use for key derivation
   */
  setMnemonic(mnemonic: string): void {
    this.mnemonic = mnemonic;
  }

  /**
   * Derives a private key from the mnemonic using a derivation path
   */
  private async derivePrivateKey(derivationPath: string): Promise<string> {
    if (!this.mnemonic) {
      throw new Error("Mnemonic not available");
    }

    if (!validateMnemonic(this.mnemonic)) {
      throw new Error("Invalid mnemonic");
    }

    const seed = await mnemonicToSeed(this.mnemonic);
    const root = bip32.fromSeed(Buffer.from(seed));
    const child = root.derivePath(derivationPath);

    if (!child.privateKey) {
      throw new Error("Unable to derive private key");
    }

    return `0x${child.privateKey.toString("hex")}`;
  }

  /**
   * Gets a Core private key for the specified index
   */
  private async getCorePrivateKey(index: number): Promise<string> {
    return this.derivePrivateKey(`m/44'/503'/0'/0/${index}`);
  }

  /**
   * Gets an eSpace private key for the specified index
   */
  private async getEspacePrivateKey(index: number): Promise<string> {
    return this.derivePrivateKey(`m/44'/60'/0'/0/${index}`);
  }

  /**
   * Gets a Core address for the specified index
   */
  private async getCoreAddress(
    index: number,
    networkId?: number
  ): Promise<string> {
    const privateKey = await this.getCorePrivateKey(index);
    return corePrivateKeyToAccount(privateKey as `0x${string}`, {
      networkId: networkId || this.config.chainId || 2029,
    }).address;
  }

  /**
   * Gets an eSpace address for the specified index
   */
  private async getEspaceAddress(index: number): Promise<string> {
    const privateKey = await this.getEspacePrivateKey(index);
    return espacePrivateKeyToAccount(privateKey as `0x${string}`).address;
  }

  /**
   * Initializes wallets with the specified count
   */
  private async initializeWallets(accountCount: number = 10): Promise<void> {
    this.wallets = [];

    // Generate accounts
    for (let i = 0; i < accountCount; i++) {
      const corePrivateKey = await this.getCorePrivateKey(i);
      const espacePrivateKey = await this.getEspacePrivateKey(i);
      const coreAddress = await this.getCoreAddress(i);
      const espaceAddress = await this.getEspaceAddress(i);

      this.wallets.push({
        index: i,
        coreAddress,
        espaceAddress,
        corePrivateKey,
        espacePrivateKey,
        isMining: i === 0,
      });
    }

    // Set mining wallet (first account)
    this.miningWallet = this.wallets[0];
  }

  /**
   * Starts the Conflux node
   */
  async start(): Promise<NodeStatus> {
    try {
      if (this.isRunningFlag) {
        throw new Error("Node is already running");
      }

      console.log("Starting Conflux node with @xcfx/node...");

      // Initialize wallets
      await this.initializeWallets(10);

      // Prepare server configuration
      const serverConfig = {
        ...this.config,
        genesisSecrets: this.wallets.map(
          (w) => w.corePrivateKey as `0x${string}`
        ),
        genesisEvmSecrets: this.wallets.map(
          (w) => w.espacePrivateKey as `0x${string}`
        ),
        miningAuthor: this.miningWallet?.coreAddress,
        // Additional logging suppression
        log: false,
        logLevel: "off",
        // Disable file logging to prevent disk space issues
        logFile: null,
        logDir: null,
      };

      // Create and start server
      this.server = await createServer(serverConfig);
      await this.server.start();

      // Create RPC clients
      this.coreClient = createPublicClient({
        transport: http(`http://127.0.0.1:${this.config.jsonrpcHttpPort}`),
      });

      this.evmClient = createViemClient({
        transport: viemHttp(
          `http://127.0.0.1:${this.config.jsonrpcHttpEthPort}`
        ),
      });

      this.isRunningFlag = true;
      this.startTime = new Date();

      // Add startup log
      this.nodeLogs.push(
        `[${new Date().toISOString()}] Node started successfully with @xcfx/node`
      );

      console.log("Conflux node started successfully!");
      console.log(`Core RPC: http://127.0.0.1:${this.config.jsonrpcHttpPort}`);
      console.log(
        `EVM RPC: http://127.0.0.1:${this.config.jsonrpcHttpEthPort}`
      );

      return this.getStatus();
    } catch (error) {
      console.error("Failed to start Conflux node:", error);
      throw error;
    }
  }

  /**
   * Stops the Conflux node
   */
  async stop(): Promise<void> {
    try {
      if (this.server) {
        console.log("Stopping Conflux node...");
        await this.server.stop();
        this.server = null;
        this.coreClient = null;
        this.evmClient = null;
        this.isRunningFlag = false;
        this.startTime = null;

        // Add stop log
        this.nodeLogs.push(
          `[${new Date().toISOString()}] Node stopped successfully`
        );

        console.log("Conflux node stopped");
      }
    } catch (error) {
      console.error("Error stopping Conflux node:", error);
      throw error;
    }
  }

  /**
   * Restarts the Conflux node
   */
  async restart(): Promise<NodeStatus> {
    await this.stop();
    // Wait a moment before restarting
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return this.start();
  }

  /**
   * Gets the current node status
   */
  getStatus(): NodeStatus {
    const uptime = this.startTime
      ? `${Math.floor((Date.now() - this.startTime.getTime()) / 1000)}s`
      : "Stopped";

    return {
      running: this.isRunningFlag,
      healthy: this.isRunningFlag && this.server !== null,
      uptime,
      chainId: this.isRunningFlag ? this.config.evmChainId || null : null,
      processId: this.isRunningFlag ? process.pid : null,
      logs: [...this.nodeLogs],
      wallets: this.wallets,
      coreRpcUrl: this.isRunningFlag
        ? `http://127.0.0.1:${this.config.jsonrpcHttpPort}`
        : undefined,
      evmRpcUrl: this.isRunningFlag
        ? `http://127.0.0.1:${this.config.jsonrpcHttpEthPort}`
        : undefined,
    };
  }

  /**
   * Gets the node logs
   */
  getLogs(limit: number = 100): string[] {
    return this.nodeLogs.slice(-limit);
  }

  /**
   * Checks if the node is running
   */
  isRunning(): boolean {
    return this.isRunningFlag;
  }

  /**
   * Gets the Core RPC client
   */
  getCoreClient() {
    return this.coreClient;
  }

  /**
   * Gets the EVM RPC client
   */
  getEvmClient() {
    return this.evmClient;
  }

  /**
   * Gets wallet information
   */
  getWallets(): WalletInfo[] {
    return [...this.wallets];
  }

  /**
   * Gets the mining wallet
   */
  getMiningWallet(): WalletInfo | null {
    return this.miningWallet;
  }
}

export default ConfluxNodeManager;
