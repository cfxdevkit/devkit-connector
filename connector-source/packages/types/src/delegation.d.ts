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
//# sourceMappingURL=delegation.d.ts.map