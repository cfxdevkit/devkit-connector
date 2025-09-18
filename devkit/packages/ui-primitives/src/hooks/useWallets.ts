// Wallet Data Hook - Provides wallet data and actions

import type { BrowserWalletInfo } from '@conflux-devkit/core';
import { useAppStore } from '@conflux-devkit/state';
import { useCallback, useMemo } from 'react';
import type { UseWalletsReturn, WalletContextData } from '../types/ui';

// Extended wallet interface with network information
interface WalletWithNetwork extends BrowserWalletInfo {
  network?: string;
}

export function useWallets(): UseWalletsReturn {
  const store = useAppStore();

  // Get wallet data from store
  const walletData: WalletContextData = useMemo(
    () => ({
      wallets: store.wallets.wallets || [],
      activeWallet: store.wallets.activeWallet,
      isLoading:
        store.wallets.isCreating || store.wallets.isRefreshing || false,
      error: store.wallets.error,
      lastUpdated:
        store.wallets.wallets.length > 0 ? new Date().toISOString() : null,
    }),
    [
      store.wallets.wallets,
      store.wallets.activeWallet,
      store.wallets.isCreating,
      store.wallets.isRefreshing,
      store.wallets.error,
    ]
  );

  // Actions
  const selectWallet = useCallback(
    (address: string) => {
      store.selectWallet(address);
    },
    [store]
  );

  const createWallet = useCallback(
    async (mnemonic?: string) => {
      try {
        store.setLoading('createWallet', true);
        await store.createWallet(mnemonic);
      } catch (error) {
        console.error('Failed to create wallet:', error);
        throw error;
      } finally {
        store.setLoading('createWallet', false);
      }
    },
    [store]
  );

  const importWallet = useCallback(
    async (privateKey: string) => {
      try {
        store.setLoading('importWallet', true);
        // This would need to be implemented in the store
        // await store.importWallet(privateKey);
        console.log('Import wallet:', privateKey);
      } catch (error) {
        console.error('Failed to import wallet:', error);
        throw error;
      } finally {
        store.setLoading('importWallet', false);
      }
    },
    [store]
  );

  const refreshWallets = useCallback(async () => {
    try {
      store.setLoading('refreshWallets', true);
      // Refresh wallets from API
      // This would call the API server to get updated wallet data
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay
    } catch (error) {
      console.error('Failed to refresh wallets:', error);
      throw error;
    } finally {
      store.setLoading('refreshWallets', false);
    }
  }, [store]);

  // Computed values
  const walletCount = walletData.wallets.length;
  const hasActiveWallet = !!walletData.activeWallet;

  const totalBalance = useMemo(() => {
    return walletData.wallets
      .reduce((total, wallet) => {
        const balance = BigInt(wallet.balance || '0');
        return total + balance;
      }, 0n)
      .toString();
  }, [walletData.wallets]);

  const walletsByNetwork = useMemo(() => {
    const grouped: Record<string, typeof walletData.wallets> = {};
    walletData.wallets.forEach((wallet) => {
      const network = (wallet as WalletWithNetwork).network || 'unknown';
      if (!grouped[network]) {
        grouped[network] = [];
      }
      grouped[network].push(wallet);
    });
    return grouped;
  }, [walletData.wallets]);

  return {
    ...walletData,
    selectWallet,
    createWallet,
    importWallet,
    refreshWallets,
    walletCount,
    hasActiveWallet,
    totalBalance,
    walletsByNetwork,
  };
}

// Specific wallet hooks
export function useWallet(address: string) {
  const { wallets, selectWallet } = useWallets();

  const wallet = wallets.find((w) => w.address === address);

  const select = useCallback(() => {
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    selectWallet(address);
  }, [wallet, selectWallet, address]);

  const refreshBalance = useCallback(async () => {
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    // This would refresh the specific wallet's balance
    console.log('Refresh balance for wallet:', address);
  }, [wallet, address]);

  return {
    wallet,
    isActive:
      wallet?.address === wallets.find((w) => w.address === address)?.address,
    select,
    refreshBalance,
    isLoading: false, // Would be based on specific wallet loading state
  };
}

export function useWalletCreation() {
  const { createWallet, importWallet, isLoading } = useWallets();

  const create = useCallback(
    async (mnemonic?: string) => {
      try {
        await createWallet(mnemonic);
        return true;
      } catch (error) {
        console.error('Wallet creation failed:', error);
        return false;
      }
    },
    [createWallet]
  );

  const importWalletFromKey = useCallback(
    async (privateKey: string) => {
      try {
        await importWallet(privateKey);
        return true;
      } catch (error) {
        console.error('Wallet import failed:', error);
        return false;
      }
    },
    [importWallet]
  );

  return {
    create,
    import: importWalletFromKey,
    isCreating: isLoading,
  };
}

export function useWalletBalance(address: string) {
  const { wallets } = useWallets();

  const wallet = wallets.find((w) => w.address === address);
  const balance = wallet?.balance || '0';

  const formatBalance = useCallback((value: string) => {
    // Format balance for display
    const num = BigInt(value);
    const cfx = Number(num) / 1e18;
    return `${cfx.toFixed(4)} CFX`;
  }, []);

  return {
    balance,
    formattedBalance: formatBalance(balance),
    hasBalance: BigInt(balance) > 0n,
  };
}
