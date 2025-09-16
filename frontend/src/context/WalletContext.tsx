import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WalletMode, ChainType, WalletState } from '../types/wallet';
import { useServerWallet } from '../hooks/useServerWallet';
import { useBrowserWallet } from '../hooks/useBrowserWallet';

interface WalletContextType {
  // Current wallet state
  currentMode: WalletMode | null;
  currentChain: ChainType;
  walletState: WalletState;

  // Server wallet methods
  serverWallet: ReturnType<typeof useServerWallet>;

  // Browser wallet methods
  browserWallet: ReturnType<typeof useBrowserWallet>;

  // Mode switching
  switchToServerWallet: () => Promise<void>;
  switchToBrowserWallet: () => Promise<void>;
  switchChain: (chain: ChainType) => void;

  // Delegation
  createBrowserDelegation: (config?: any) => Promise<string>;
  clearAllWallets: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [currentMode, setCurrentMode] = useState<WalletMode | null>(null);
  const [currentChain, setCurrentChain] = useState<ChainType>('eSpace');

  const serverWallet = useServerWallet();
  const browserWallet = useBrowserWallet();

  // Get current wallet state based on active mode
  const walletState: WalletState = {
    mode: currentMode,
    eSpaceAddress: currentMode === 'server-managed'
      ? serverWallet.eSpaceAddress
      : currentMode === 'browser-connected'
      ? browserWallet.wallet?.address || null
      : null,
    coreAddress: currentMode === 'server-managed'
      ? serverWallet.coreAddress
      : null, // Browser wallets don't have core addresses by default
    walletId: currentMode === 'server-managed' ? serverWallet.walletId : null,
    sessionId: serverWallet.sessionId,
    isLoading: serverWallet.isLoading || browserWallet.isLoading,
    error: serverWallet.error || browserWallet.error,
    isConnected: currentMode === 'server-managed'
      ? serverWallet.isConnected
      : currentMode === 'browser-connected'
      ? browserWallet.wallet?.connected || false
      : false,
  };

  const switchToServerWallet = useCallback(async () => {
    try {
      await serverWallet.loadWallet();
      setCurrentMode('server-managed');
    } catch (error) {
      console.error('Failed to switch to server wallet:', error);
      throw error;
    }
  }, [serverWallet]);

  const switchToBrowserWallet = useCallback(async () => {
    try {
      if (!browserWallet.wallet?.connected) {
        await browserWallet.connect();
      }
      setCurrentMode('browser-connected');
    } catch (error) {
      console.error('Failed to switch to browser wallet:', error);
      throw error;
    }
  }, [browserWallet]);

  const switchChain = useCallback((chain: ChainType) => {
    setCurrentChain(chain);
  }, []);

  const createBrowserDelegation = useCallback(async (config: any = {}): Promise<string> => {
    if (!browserWallet.wallet?.connected) {
      throw new Error('Browser wallet not connected');
    }

    // Get server wallet address to delegate to
    if (!serverWallet.eSpaceAddress) {
      await serverWallet.loadWallet();
    }

    if (!serverWallet.eSpaceAddress) {
      throw new Error('Server wallet not available');
    }

    const defaultConfig = {
      sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
      allowedOperations: ['sign_transaction', 'sign_message'],
      maxTransactionValue: '1000000000000000000', // 1 ETH in wei
      ...config,
    };

    const sessionId = await browserWallet.delegateToServer(
      serverWallet.eSpaceAddress,
      defaultConfig
    );

    setCurrentMode('user-delegated');
    return sessionId;
  }, [browserWallet, serverWallet]);

  const clearAllWallets = useCallback(async () => {
    await serverWallet.clearWallet();
    browserWallet.disconnect();
    setCurrentMode(null);
  }, [serverWallet, browserWallet]);

  const value: WalletContextType = {
    currentMode,
    currentChain,
    walletState,
    serverWallet,
    browserWallet,
    switchToServerWallet,
    switchToBrowserWallet,
    switchChain,
    createBrowserDelegation,
    clearAllWallets,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}