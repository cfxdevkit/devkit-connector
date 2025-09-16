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

export interface DelegationSession {
  sessionId: string;
  userAddress: string;
  eSpaceAddress: string;
  coreAddress: string;
  expiresAt: number;
  permissions: string[];
  config: DelegationConfig;
}

export interface DelegationConfig {
  sessionDuration?: number;
  allowedOperations?: string[];
  maxTransactionValue?: string;
  autoApprovalRules?: AutoApprovalRule[];
  securitySettings?: SecuritySettings;
  notifications?: NotificationSettings;
}

export interface AutoApprovalRule {
  id?: string;
  name?: string;
  type: 'transaction_value' | 'contract_address' | 'function_signature';
  condition: 'less_than' | 'equals' | 'whitelist';
  value: string | string[];
  autoApprove: boolean;
  priority?: number;
  chainSpecific?: 'eSpace' | 'core';
}

export interface SecuritySettings {
  requireSignatureFor?: string[];
  ipWhitelist?: string[];
  timeBasedRestrictions?: TimeRestriction[];
  multiSigRequired?: boolean;
}

export interface NotificationSettings {
  realTimeUpdates?: boolean;
  emailNotifications?: boolean;
  webhookUrl?: string;
  alertThresholds?: AlertThreshold[];
}

export interface TimeRestriction {
  type: 'daily_window' | 'weekly_schedule' | 'specific_dates';
  allowedTimes?: {
    startTime: string;
    endTime: string;
    timezone?: string;
    daysOfWeek?: number[];
  };
  blockedDates?: string[];
}

export interface AlertThreshold {
  type: 'transaction_value' | 'daily_volume' | 'operation_count';
  threshold: string | number;
  action: 'notify' | 'require_approval' | 'block';
  message?: string;
}