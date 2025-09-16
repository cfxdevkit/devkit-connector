import { HDNodeWallet, Mnemonic, ethers } from "ethers";
import * as crypto from "crypto";
import { getAddress } from "viem";
import {
  WalletConfig,
  ServerWalletConfig,
  WalletOperation,
  ChainType,
} from "../types/wallet";

export class ServerWalletService {
  private static instance: ServerWalletService;
  private wallets: Map<string, HDNodeWallet> = new Map();
  private encryptionKey: string;
  private sessions: Map<string, any> = new Map();

  private constructor() {
    // Get encryption key from environment or generate one
    this.encryptionKey =
      process.env.WALLET_ENCRYPTION_KEY || this.generateEncryptionKey();
  }

  static getInstance(): ServerWalletService {
    if (!ServerWalletService.instance) {
      ServerWalletService.instance = new ServerWalletService();
    }
    return ServerWalletService.instance;
  }

  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Encrypt mnemonic for storage
   */
  private encryptMnemonic(mnemonic: string): string {
    const algorithm = "aes-256-cbc";
    const key = crypto.scryptSync(this.encryptionKey, "salt", 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(mnemonic, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
  }

  /**
   * Decrypt mnemonic from storage
   */
  private decryptMnemonic(encryptedMnemonic: string): string {
    const algorithm = "aes-256-cbc";
    const key = crypto.scryptSync(this.encryptionKey, "salt", 32);

    const [ivHex, encrypted] = encryptedMnemonic.split(":");
    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  /**
   * Load wallet from environment variables or database
   */
  async loadWalletFromServer(userId: string): Promise<{
    eSpaceAddress: string;
    coreAddress: string;
    walletId: string;
  }> {
    // Option 1: From environment variable (single wallet)
    let encryptedMnemonic = process.env.ENCRYPTED_WALLET_MNEMONIC;

    // Option 2: From database (multi-user)
    // const encryptedMnemonic = await this.getUserEncryptedMnemonic(userId);

    // Option 3: For demo purposes, create a wallet if none exists
    if (!encryptedMnemonic) {
      console.log(
        "🔄 No existing wallet found, generating new wallet for demo..."
      );
      const randomWallet = HDNodeWallet.createRandom();
      const mnemonic = randomWallet.mnemonic?.phrase;

      if (!mnemonic) {
        throw new Error("Failed to generate wallet mnemonic");
      }

      encryptedMnemonic = this.encryptMnemonic(mnemonic);
      console.log(`✅ Generated new wallet for user ${userId}`);
      console.log(`📝 Mnemonic: ${mnemonic}`);
      console.log(`🔒 Encrypted: ${encryptedMnemonic.substring(0, 50)}...`);
    }

    const mnemonic = this.decryptMnemonic(encryptedMnemonic);
    const walletId = `wallet_${userId}`;

    // Create HD wallet
    const mnemonicObj = Mnemonic.fromPhrase(mnemonic);
    const hdWallet = HDNodeWallet.fromMnemonic(mnemonicObj, "m/44'/60'/0'/0/0");

    // Cache wallet
    this.wallets.set(walletId, hdWallet);

    // Generate addresses
    const eSpaceAddress = hdWallet.address;
    const coreAddress = `cfx:${eSpaceAddress.slice(2)}`; // Simple conversion for demo

    return {
      eSpaceAddress,
      coreAddress,
      walletId,
    };
  }

  /**
   * Get wallet by ID (from cache)
   */
  getWallet(walletId: string): HDNodeWallet | null {
    return this.wallets.get(walletId) || null;
  }

  /**
   * Sign transaction on server
   */
  async signTransaction(
    walletId: string,
    transaction: any,
    chainType: ChainType
  ): Promise<string> {
    const wallet = this.getWallet(walletId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (chainType === "eSpace") {
      return await wallet.signTransaction(transaction);
    } else {
      // For Core chain, you'd implement Core-specific signing
      throw new Error("Core chain signing not implemented in this example");
    }
  }

  /**
   * Sign message on server
   */
  async signMessage(walletId: string, message: string): Promise<string> {
    const wallet = this.getWallet(walletId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    return await wallet.signMessage(message);
  }

  /**
   * Get balance for wallet
   */
  async getBalance(
    walletId: string,
    provider: ethers.Provider
  ): Promise<string> {
    const wallet = this.getWallet(walletId);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const balance = await provider.getBalance(wallet.address);
    return balance.toString();
  }

  /**
   * Create delegation session
   */
  createDelegationSession(
    userAddress: string,
    delegateAddress: string,
    config: any
  ): string {
    const sessionId = crypto.randomUUID();
    const session = {
      sessionId,
      userAddress,
      delegateAddress,
      config,
      createdAt: Date.now(),
      expiresAt: Date.now() + (config.sessionDuration || 24 * 60 * 60 * 1000), // 24 hours default
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * Get delegation session
   */
  getDelegationSession(sessionId: string): any | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.expiresAt < Date.now()) {
      this.sessions.delete(sessionId);
      return null;
    }
    return session;
  }

  /**
   * Clear wallet from memory
   */
  clearWallet(walletId: string): void {
    this.wallets.delete(walletId);
  }

  /**
   * Clear delegation session
   */
  clearDelegationSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Validate wallet operation against delegation rules
   */
  validateWalletOperation(
    sessionId: string,
    operation: WalletOperation
  ): boolean {
    const session = this.getDelegationSession(sessionId);
    if (!session) {
      return false;
    }

    // Implement validation logic based on delegation config
    // This is a simplified example
    const config = session.config;

    if (
      config.allowedOperations &&
      !config.allowedOperations.includes(operation.type)
    ) {
      return false;
    }

    if (config.maxTransactionValue && operation.payload.value) {
      const maxValue = BigInt(config.maxTransactionValue);
      const operationValue = BigInt(operation.payload.value);
      if (operationValue > maxValue) {
        return false;
      }
    }

    return true;
  }
}
