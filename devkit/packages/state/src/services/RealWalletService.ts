// Real wallet service using blockchain package integration

import { EvmClient, networkManager } from '@conflux-devkit/blockchain';
import type { BrowserWalletInfo, NetworkConfig } from '@conflux-devkit/core';
import { BIP32Factory } from 'bip32';
import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import * as ecc from 'tiny-secp256k1';
import { privateKeyToAccount } from 'viem/accounts';

const bip32 = BIP32Factory(ecc);

export class RealWalletService {
  private evmClient: EvmClient | null = null;
  private currentNetwork: NetworkConfig | null = null;

  constructor(networkId?: string) {
    if (networkId) {
      this.setNetwork(networkId);
    }
  }

  /**
   * Set the current network
   */
  setNetwork(networkId: string): void {
    const network = networkManager.getNetwork(networkId);
    if (!network) {
      throw new Error(`Network not found: ${networkId}`);
    }
    this.currentNetwork = network;
    this.evmClient = new EvmClient(network);
  }

  /**
   * Create a new wallet from mnemonic
   */
  async createWallet(mnemonic?: string): Promise<BrowserWalletInfo> {
    if (!this.currentNetwork) {
      throw new Error('Network not set');
    }

    try {
      // Generate mnemonic if not provided
      const walletMnemonic = mnemonic || generateMnemonic();

      // Generate seed from mnemonic
      const seed = mnemonicToSeedSync(walletMnemonic);
      const root = bip32.fromSeed(seed);

      // Derive wallet at index 0
      const child = root.derivePath("m/44'/60'/0'/0/0");
      const privateKey =
        `0x${child.privateKey?.toString('hex')}` as `0x${string}`;

      // Create account from private key
      const account = privateKeyToAccount(privateKey);

      // Get balance using EVM client
      const balance = await this.evmClient?.getBalance({
        address: account.address,
      });

      return {
        address: account.address,
        privateKey,
        mnemonic: walletMnemonic,
        index: 0,
        balance: balance?.toString() || '0',
        balanceFormatted: `${(Number(balance || 0) / 1e18).toFixed(4)} ETH`,
        isMining: false,
      };
    } catch (error) {
      throw new Error(
        `Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Import wallet from private key
   */
  async importWallet(privateKey: string): Promise<BrowserWalletInfo> {
    if (!this.currentNetwork) {
      throw new Error('Network not set');
    }

    try {
      // Create account from private key
      const account = privateKeyToAccount(privateKey as `0x${string}`);

      // Get balance using EVM client
      const balance = await this.evmClient?.getBalance({
        address: account.address,
      });

      return {
        address: account.address,
        privateKey,
        mnemonic: '',
        index: 0,
        balance: balance?.toString() || '0',
        balanceFormatted: `${(Number(balance || 0) / 1e18).toFixed(4)} ETH`,
        isMining: false,
      };
    } catch (error) {
      throw new Error(
        `Failed to import wallet: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(address: string): Promise<string> {
    if (!this.evmClient) {
      throw new Error('EVM client not initialized');
    }

    try {
      const balance = await this.evmClient.getBalance({
        address: address as `0x${string}`,
      });
      return balance.toString();
    } catch (error) {
      throw new Error(
        `Failed to get balance: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get formatted balance
   */
  async getFormattedBalance(address: string): Promise<string> {
    const balance = await this.getBalance(address);
    return `${(Number(balance) / 1e18).toFixed(4)} ETH`;
  }

  /**
   * Send transaction
   */
  async sendTransaction(
    _from: string,
    to: string,
    value: string,
    privateKey: string
  ): Promise<`0x${string}`> {
    if (!this.evmClient) {
      throw new Error('EVM client not initialized');
    }

    try {
      const _account = privateKeyToAccount(privateKey as `0x${string}`);
      if (!this.currentNetwork) {
        throw new Error('Current network not set');
      }
      const evmClientWithWallet = new EvmClient(
        this.currentNetwork,
        privateKey as `0x${string}`
      );

      const txHash = await evmClientWithWallet.sendTransaction({
        to: to as `0x${string}`,
        value: BigInt(value),
      });

      return txHash;
    } catch (error) {
      throw new Error(
        `Failed to send transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get all wallets (placeholder implementation)
   */
  async getWallets(): Promise<BrowserWalletInfo[]> {
    // This would typically return stored wallets
    // For now, return empty array as this is a placeholder
    return [];
  }

  /**
   * Remove a wallet (placeholder implementation)
   */
  async removeWallet(address: string): Promise<void> {
    // This would typically remove the wallet from storage
    // For now, just log the action
    console.log(`Removing wallet: ${address}`);
  }
}

export const realWalletService = new RealWalletService();
