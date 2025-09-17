import type { WalletConfig, WalletInfo } from '../types';

/**
 * Validate wallet configuration
 */
export function validateWalletConfig(config: WalletConfig): boolean {
  if (!config.type || !config.value) {
    return false;
  }

  if (config.type === 'mnemonic') {
    // Basic mnemonic validation (12, 15, 18, 21, or 24 words)
    const words = config.value.trim().split(/\s+/);
    return [12, 15, 18, 21, 24].includes(words.length);
  }

  if (config.type === 'privateKey') {
    // Basic private key validation (64 hex characters)
    return /^[0-9a-fA-F]{64}$/.test(config.value);
  }

  return false;
}

/**
 * Generate wallet info from configuration
 */
export function generateWalletInfo(config: WalletConfig): WalletInfo | null {
  if (!validateWalletConfig(config)) {
    return null;
  }

  // This is a simplified implementation
  // In a real scenario, you'd use proper cryptographic libraries
  return {
    address: `0x${'0'.repeat(40)}`, // Placeholder
    privateKey: config.type === 'privateKey' ? config.value : '',
    mnemonic: config.type === 'mnemonic' ? config.value : undefined,
  };
}

/**
 * Format address for display
 */
export function formatAddress(address: string, length: number = 6): string {
  if (!address || address.length < 10) {
    return address;
  }

  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}
