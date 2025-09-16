// server/wallet-service.ts
import { HDNodeWallet, Mnemonic } from 'ethers';
import { format } from 'js-conflux-sdk';
import * as crypto from 'crypto';

interface ServerWalletConfig {
  encryptedMnemonic?: string;
  encryptionKey?: string;
  derivationPath?: string;
  networkId?: number;
}

export class ServerWalletService {
  private static instance: ServerWalletService;
  private wallets: Map<string, HDNodeWallet> = new Map();
  private encryptionKey: string;
  
  private constructor() {
    // Get encryption key from environment or generate one
    this.encryptionKey = process.env.WALLET_ENCRYPTION_KEY || this.generateEncryptionKey();
  }

  static getInstance(): ServerWalletService {
    if (!ServerWalletService.instance) {
      ServerWalletService.instance = new ServerWalletService();
    }
    return ServerWalletService.instance;
  }

  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypt mnemonic for storage
   */
  private encryptMnemonic(mnemonic: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(mnemonic, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt mnemonic from storage
   */
  private decryptMnemonic(encryptedMnemonic: string): string {
    const [ivHex, encrypted] = encryptedMnemonic.split(':');
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
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
    const encryptedMnemonic = process.env.ENCRYPTED_WALLET_MNEMONIC;
    
    // Option 2: From database (multi-user)
    // const encryptedMnemonic = await this.getUserEncryptedMnemonic(userId);
    
    if (!encryptedMnemonic) {
      throw new Error('No wallet found for user');
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
    const coreAddress = format.address(eSpaceAddress, 1029); // Mainnet network ID
    
    return {
      eSpaceAddress,
      coreAddress,
      walletId
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
  async signTransaction(walletId: string, transaction: any, chainType: 'eSpace' | 'core'): Promise<string> {
    const wallet = this.getWallet(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (chainType === 'eSpace') {
      return await wallet.signTransaction(transaction);
    } else {
      // For Core chain, you'd implement Core-specific signing
      throw new Error('Core chain signing not implemented in this example');
    }
  }

  /**
   * Clear wallet from memory
   */
  clearWallet(walletId: string): void {
    this.wallets.delete(walletId);
  }
}

// server/api/wallet/route.ts (Next.js API Route example)
import { NextRequest, NextResponse } from 'next/server';
import { ServerWalletService } from '../../wallet-service';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends NextRequest {
  userId?: string;
}

// Middleware to verify JWT token
function verifyAuth(request: NextRequest): string | null {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const userId = verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const walletService = ServerWalletService.getInstance();
    const { action, ...params } = await request.json();

    switch (action) {
      case 'load_wallet':
        const walletData = await walletService.loadWalletFromServer(userId);
        return NextResponse.json(walletData);

      case 'sign_transaction':
        const { walletId, transaction, chainType } = params;
        const signature = await walletService.signTransaction(walletId, transaction, chainType);
        return NextResponse.json({ signature });

      case 'clear_wallet':
        const { walletId: clearWalletId } = params;
        walletService.clearWallet(clearWalletId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// client/hooks/use-server-wallet.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useConflux } from '../providers/conflux-wagmi-provider';

interface ServerWalletState {
  eSpaceAddress: string | null;
  coreAddress: string | null;
  walletId: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useServerWallet() {
  const { currentChain, eSpaceAdapter, coreAdapter } = useConflux();
  const [walletState, setWalletState] = useState<ServerWalletState>({
    eSpaceAddress: null,
    coreAddress: null,
    walletId: null,
    isLoading: false,
    error: null,
  });

  const callWalletAPI = async (action: string, params: any = {}) => {
    const token = localStorage.getItem('authToken'); // Or however you store auth
    
    const response = await fetch('/api/wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ action, ...params }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API call failed');
    }

    return response.json();
  };

  const loadWallet = useCallback(async () => {
    setWalletState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const walletData = await callWalletAPI('load_wallet');
      setWalletState({
        eSpaceAddress: walletData.eSpaceAddress,
        coreAddress: walletData.coreAddress,
        walletId: walletData.walletId,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  }, []);

  const sendTransaction = useCallback(async (transaction: any) => {
    if (!walletState.walletId) {
      throw new Error('Wallet not loaded');
    }

    try {
      // First, get signature from server
      const { signature } = await callWalletAPI('sign_transaction', {
        walletId: walletState.walletId,
        transaction,
        chainType: currentChain,
      });

      // Then broadcast using appropriate adapter
      if (currentChain === 'eSpace' && eSpaceAdapter) {
        // For eSpace, you might need to reconstruct and broadcast
        return await eSpaceAdapter.sendTransaction(transaction);
      } else if (currentChain === 'core' && coreAdapter) {
        // For Core, broadcast the signed transaction
        return await coreAdapter.sendTransaction({ ...transaction, signature });
      }

      throw new Error('No adapter available');
    } catch (error) {
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }, [walletState.walletId, currentChain, eSpaceAdapter, coreAdapter, callWalletAPI]);

  const clearWallet = useCallback(async () => {
    if (walletState.walletId) {
      await callWalletAPI('clear_wallet', { walletId: walletState.walletId });
    }
    setWalletState({
      eSpaceAddress: null,
      coreAddress: null,
      walletId: null,
      isLoading: false,
      error: null,
    });
  }, [walletState.walletId, callWalletAPI]);

  return {
    ...walletState,
    loadWallet,
    sendTransaction,
    clearWallet,
    isConnected: !!walletState.walletId,
  };
}

// providers/conflux-server-provider.tsx
'use client';

import { createConfig, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { http } from 'viem';
import { confluxESpace, confluxESpaceTestnet } from '../config/conflux-chains';
import { ConfluxCoreAdapter } from '../adapters/conflux-core-adapter';
import { ConfluxESpaceAdapter } from '../adapters/conflux-espace-adapter';

interface ConfluxServerContextType {
  eSpaceAdapter: ConfluxESpaceAdapter | null;
  coreAdapter: ConfluxCoreAdapter | null;
  currentChain: 'eSpace' | 'core';
  switchChain: (chain: 'eSpace' | 'core') => void;
}

const ConfluxServerContext = createContext<ConfluxServerContextType | undefined>(undefined);

const wagmiConfig = createConfig({
  chains: [confluxESpace, confluxESpaceTestnet],
  transports: {
    [confluxESpace.id]: http(),
    [confluxESpaceTestnet.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function ConfluxServerProvider({ children }: { children: ReactNode }) {
  const [eSpaceAdapter, setESpaceAdapter] = useState<ConfluxESpaceAdapter | null>(null);
  const [coreAdapter, setCoreAdapter] = useState<ConfluxCoreAdapter | null>(null);
  const [currentChain, setCurrentChain] = useState<'eSpace' | 'core'>('eSpace');

  useEffect(() => {
    // Initialize adapters without private keys (server will handle signing)
    const eSpace = new ConfluxESpaceAdapter(
      process.env.NEXT_PUBLIC_CONFLUX_ESPACE_RPC || 'https://evm.confluxrpc.com'
    );
    const core = new ConfluxCoreAdapter(
      process.env.NEXT_PUBLIC_CONFLUX_CORE_RPC || 'https://main.confluxrpc.com',
      1029
    );
    
    setESpaceAdapter(eSpace);
    setCoreAdapter(core);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConfluxServerContext.Provider
          value={{
            eSpaceAdapter,
            coreAdapter,
            currentChain,
            switchChain: setCurrentChain,
          }}
        >
          {children}
        </ConfluxServerContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export const useConflux = () => {
  const context = useContext(ConfluxServerContext);
  if (!context) {
    throw new Error('useConflux must be used within ConfluxServerProvider');
  }
  return context;
};

// components/server-wallet-manager.tsx
'use client';

import { useServerWallet } from '../hooks/use-server-wallet';
import { useConflux } from '../providers/conflux-server-provider';

export function ServerWalletManager() {
  const { currentChain, switchChain } = useConflux();
  const {
    eSpaceAddress,
    coreAddress,
    isLoading,
    error,
    isConnected,
    loadWallet,
    sendTransaction,
    clearWallet,
  } = useServerWallet();

  const handleSendTransaction = async () => {
    try {
      const txHash = await sendTransaction({
        to: '0x742d35Cc6634C0532925a3b8D4B17dd07E2b9e84', // Example address
        value: '1000000000000000000', // 1 CFX
        gasLimit: '21000',
      });
      alert(`Transaction sent: ${txHash}`);
    } catch (error) {
      alert(`Transaction failed: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Server-Side Conflux Wallet</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Wallet will be loaded securely from the server using your stored mnemonic.
          </p>
          <button
            onClick={loadWallet}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load Server Wallet'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Addresses:</h3>
            <p className="text-sm text-gray-600 break-all">
              eSpace: {eSpaceAddress}
            </p>
            <p className="text-sm text-gray-600 break-all">
              Core: {coreAddress}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold">Current Chain: {currentChain}</h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => switchChain('eSpace')}
              className={`flex-1 py-2 px-4 rounded-md ${
                currentChain === 'eSpace' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              eSpace
            </button>
            <button
              onClick={() => switchChain('core')}
              className={`flex-1 py-2 px-4 rounded-md ${
                currentChain === 'core' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Core
            </button>
          </div>

          <button
            onClick={handleSendTransaction}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            Send Test Transaction
          </button>

          <button
            onClick={clearWallet}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Clear Wallet
          </button>
        </div>
      )}
    </div>
  );
}

// Environment variables (.env.local)
/*
# Encryption key for wallet storage
WALLET_ENCRYPTION_KEY=your-32-byte-hex-key

# Encrypted mnemonic (generated by your setup script)
ENCRYPTED_WALLET_MNEMONIC=encrypted-mnemonic-string

# JWT secret for authentication
JWT_SECRET=your-jwt-secret

# RPC endpoints
NEXT_PUBLIC_CONFLUX_ESPACE_RPC=https://evm.confluxrpc.com
NEXT_PUBLIC_CONFLUX_CORE_RPC=https://main.confluxrpc.com
*/
