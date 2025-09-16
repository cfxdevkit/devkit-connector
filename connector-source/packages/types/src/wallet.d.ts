export type WalletMode = 'server-managed' | 'user-delegated';
export type ChainType = 'eSpace' | 'core';
export interface WalletAddresses {
    eSpace: string;
    core: string;
}
export interface WalletConfig {
    mode: WalletMode;
    addresses: WalletAddresses;
    sessionId?: string;
    walletId?: string;
}
export interface ServerWalletConfig {
    encryptedMnemonic?: string;
    encryptionKey?: string;
    derivationPath?: string;
    networkId?: number;
}
export interface WalletState {
    mode: WalletMode | null;
    eSpaceAddress: string | null;
    coreAddress: string | null;
    walletId: string | null;
    sessionId: string | null;
    isLoading: boolean;
    error: string | null;
}
export interface WalletOperation {
    id: string;
    type: 'sign_transaction' | 'sign_message' | 'get_balance' | 'estimate_gas';
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
    chainType: ChainType;
    payload: any;
    result?: any;
    error?: string;
    createdAt: number;
    completedAt?: number;
    requiresUserApproval?: boolean;
}
//# sourceMappingURL=wallet.d.ts.map