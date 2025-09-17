"use client";

import { useState, useEffect, useCallback } from 'react';
import { BrowserWalletInfo, ChainType } from '../types/wallet';
import { getApiUrl } from '../config/api';

interface BrowserWalletHook {
  wallet: BrowserWalletInfo | null;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
  sendTransaction: (transaction: any) => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  delegateToServer: (serverAddress: string, config: any) => Promise<string>;
}

declare global {
  interface Window {
    ethereum?: any;
    conflux?: any;
    fluent?: any;
    getAvailableWallets?: () => Array<{name: string, provider: any}>;
  }
}

export function useBrowserWallet(): BrowserWalletHook {
  const [wallet, setWallet] = useState<BrowserWalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is already connected on load
  useEffect(() => {
    // Small delay to allow wallet extensions to fully load
    const timer = setTimeout(() => {
      checkConnection();

      // Listen for account changes
      const provider = getWalletProvider();
      if (provider && provider.on) {
        provider.on('accountsChanged', handleAccountsChanged);
        provider.on('chainChanged', handleChainChanged);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      const provider = getWalletProvider();
      if (provider && provider.removeListener) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    // Check for available wallet providers
    const provider = getWalletProvider();
    if (!provider) return;

    try {
      const accounts = await provider.request({ method: 'eth_accounts' });
      const chainId = await provider.request({ method: 'eth_chainId' });

      if (accounts.length > 0) {
        setWallet({
          address: accounts[0],
          chainId: parseInt(chainId, 16),
          connected: true,
          connector: getConnectorName(),
        });
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const getWalletProvider = () => {
    // Use the global helper function if available
    if (window.getAvailableWallets) {
      const wallets = window.getAvailableWallets();
      if (wallets.length > 0) {
        // Prefer Fluent Wallet for Conflux, then others
        const fluent = wallets.find(w => w.name === 'Fluent Wallet');
        if (fluent) return fluent.provider;

        const metamask = wallets.find(w => w.name === 'MetaMask');
        if (metamask) return metamask.provider;

        return wallets[0].provider;
      }
    }

    // Fallback to manual detection with conflict prevention
    try {
      if (window.ethereum && !window.ethereum.isFluentWallet) {
        return window.ethereum;
      }
      if (window.fluent) {
        return window.fluent;
      }
      if (window.conflux) {
        return window.conflux;
      }
    } catch (error) {
      console.warn('[useBrowserWallet] Error accessing wallet providers:', error);
    }

    return window.ethereum; // Final fallback
  };

  const getConnectorName = () => {
    // Use the global helper function if available
    if (window.getAvailableWallets) {
      const wallets = window.getAvailableWallets();
      if (wallets.length > 0) {
        const provider = getWalletProvider();
        const wallet = wallets.find(w => w.provider === provider);
        if (wallet) return wallet.name;
      }
    }

    // Fallback to manual detection
    try {
      if (window.ethereum?.isMetaMask && !window.ethereum?.isFluentWallet) {
        return 'MetaMask';
      }
      if (window.fluent || window.ethereum?.isFluentWallet) {
        return 'Fluent Wallet';
      }
      if (window.conflux) {
        return 'Conflux Wallet';
      }
    } catch (error) {
      console.warn('[useBrowserWallet] Error detecting wallet name:', error);
    }

    return 'Unknown Wallet';
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setWallet(null);
    } else {
      setWallet(prev => prev ? { ...prev, address: accounts[0] } : null);
    }
  };

  const handleChainChanged = (chainId: string) => {
    setWallet(prev => prev ? { ...prev, chainId: parseInt(chainId, 16) } : null);
  };

  const connect = useCallback(async () => {
    const provider = getWalletProvider();
    if (!provider) {
      setError('No wallet detected. Please install MetaMask, Fluent Wallet, or Portal Wallet.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });
      const chainId = await provider.request({
        method: 'eth_chainId'
      });

      setWallet({
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        connected: true,
        connector: getConnectorName(),
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(null);
    setError(null);
  }, []);

  const switchChain = useCallback(async (targetChainId: number) => {
    const provider = getWalletProvider();
    if (!provider || !wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to wallet
        throw new Error('Please add the network to your wallet first');
      }
      throw error;
    }
  }, [wallet]);

  const sendTransaction = useCallback(async (transaction: any): Promise<string> => {
    const provider = getWalletProvider();
    if (!provider || !wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: wallet.address,
          ...transaction,
        }],
      });

      return txHash;
    } catch (error) {
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [wallet]);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    const provider = getWalletProvider();
    if (!provider || !wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, wallet.address],
      });

      return signature;
    } catch (error) {
      throw new Error(`Message signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [wallet]);

  const delegateToServer = useCallback(async (serverAddress: string, config: any): Promise<string> => {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      // Create delegation message
      const delegationMessage = JSON.stringify({
        delegator: wallet.address,
        delegate: serverAddress,
        config,
        timestamp: Date.now(),
      });

      // Sign the delegation message
      const signature = await signMessage(delegationMessage);

      // Call server API to create delegation session
      const response = await fetch(getApiUrl('/api/wallet/delegation'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          delegationMessage,
          signature,
          userAddress: wallet.address,
          delegateAddress: serverAddress,
          config,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delegation failed');
      }

      const result = await response.json();
      return result.data.sessionId;
    } catch (error) {
      throw new Error(`Delegation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [wallet, signMessage]);

  return {
    wallet,
    isLoading,
    error,
    connect,
    disconnect,
    switchChain,
    sendTransaction,
    signMessage,
    delegateToServer,
  };
}