"use client";

import { useState, useEffect, useCallback } from 'react';
import { WalletState, WalletOperation, ChainType } from '../types/wallet';
import { getApiUrl, API_CONFIG } from '../config/api';

interface ServerWalletHook extends WalletState {
  loadWallet: () => Promise<void>;
  sendTransaction: (transaction: any, chainType?: ChainType) => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  clearWallet: () => Promise<void>;
  createDelegationSession: (delegateAddress: string, config: any) => Promise<string>;
  processOperation: (operation: WalletOperation) => Promise<any>;
}

export function useServerWallet(): ServerWalletHook {
  const [walletState, setWalletState] = useState<WalletState>({
    mode: null,
    eSpaceAddress: null,
    coreAddress: null,
    walletId: null,
    sessionId: null,
    isLoading: false,
    error: null,
    isConnected: false,
  });

  const callWalletAPI = async (action: string, params: any = {}) => {
    const token = localStorage.getItem('authToken');

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.WALLET), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
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
      const response = await callWalletAPI('load_wallet');
      setWalletState(prev => ({
        ...prev,
        mode: 'server-managed',
        eSpaceAddress: response.data.eSpaceAddress,
        coreAddress: response.data.coreAddress,
        walletId: response.data.walletId,
        isLoading: false,
        error: null,
        isConnected: true,
      }));
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        isConnected: false,
      }));
    }
  }, []);

  const sendTransaction = useCallback(async (transaction: any, chainType: ChainType = 'eSpace'): Promise<string> => {
    if (!walletState.walletId) {
      throw new Error('Wallet not loaded');
    }

    try {
      const response = await callWalletAPI('sign_transaction', {
        walletId: walletState.walletId,
        transaction,
        chainType,
      });

      return response.data.signature;
    } catch (error) {
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [walletState.walletId]);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!walletState.walletId) {
      throw new Error('Wallet not loaded');
    }

    try {
      const response = await callWalletAPI('sign_message', {
        walletId: walletState.walletId,
        message,
      });

      return response.data.signature;
    } catch (error) {
      throw new Error(`Message signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [walletState.walletId]);

  const clearWallet = useCallback(async () => {
    if (walletState.walletId) {
      await callWalletAPI('clear_wallet', { walletId: walletState.walletId });
    }
    setWalletState({
      mode: null,
      eSpaceAddress: null,
      coreAddress: null,
      walletId: null,
      sessionId: null,
      isLoading: false,
      error: null,
      isConnected: false,
    });
  }, [walletState.walletId]);

  const createDelegationSession = useCallback(async (delegateAddress: string, config: any): Promise<string> => {
    if (!walletState.eSpaceAddress) {
      throw new Error('Wallet not loaded');
    }

    try {
      const response = await callWalletAPI('create_delegation', {
        userAddress: walletState.eSpaceAddress,
        delegateAddress,
        config,
      });

      const sessionId = response.data.sessionId;
      setWalletState(prev => ({
        ...prev,
        sessionId,
      }));

      return sessionId;
    } catch (error) {
      throw new Error(`Delegation session creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [walletState.eSpaceAddress]);

  const processOperation = useCallback(async (operation: WalletOperation): Promise<any> => {
    if (!walletState.sessionId) {
      throw new Error('No delegation session');
    }

    try {
      const response = await callWalletAPI('process_operation', {
        sessionId: walletState.sessionId,
        operation,
      });

      return response.data.result;
    } catch (error) {
      throw new Error(`Operation processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [walletState.sessionId]);

  return {
    ...walletState,
    loadWallet,
    sendTransaction,
    signMessage,
    clearWallet,
    createDelegationSession,
    processOperation,
  };
}