export interface SecuritySettings {
  requireSignatureFor?: string[];
  ipWhitelist?: string[];
  timeBasedRestrictions?: TimeRestriction[];
  multiSigRequired?: boolean;
  maxSessionDuration?: number;
  maxOperationsPerSession?: number;
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

export interface FraudDetectionRule {
  id: string;
  name: string;
  type: 'transaction_value' | 'frequency' | 'pattern' | 'geographic';
  threshold: number;
  action: 'block' | 'require_approval' | 'alert';
  enabled: boolean;
}

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data: any;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
}
