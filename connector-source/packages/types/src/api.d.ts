export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface CreateDelegationRequest {
    userAddress: string;
    signature: string;
    message: string;
    config: DelegationConfig;
}
export interface CreateDelegationResponse {
    sessionId: string;
    expiresAt: number;
    addresses: {
        eSpace: string;
        core: string;
    };
}
export interface LoadWalletRequest {
    userId: string;
    mode: 'server-managed' | 'user-delegated';
    sessionId?: string;
}
export interface LoadWalletResponse {
    eSpaceAddress: string;
    coreAddress: string;
    walletId: string;
    mode: 'server-managed' | 'user-delegated';
}
export interface SignTransactionRequest {
    walletId: string;
    transaction: any;
    chainType: 'eSpace' | 'core';
}
export interface SignTransactionResponse {
    signature: string;
    transactionHash?: string;
}
//# sourceMappingURL=api.d.ts.map