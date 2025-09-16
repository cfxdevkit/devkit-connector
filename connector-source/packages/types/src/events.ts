export interface DelegationEvent {
  id: string;
  sessionId: string;
  type: 'session_created' | 'operation_requested' | 'operation_completed' | 'session_expired' | 'permission_denied';
  data: any;
  timestamp: number;
}

export interface OperationEvent {
  id: string;
  operationId: string;
  sessionId: string;
  type: 'operation_started' | 'operation_approved' | 'operation_rejected' | 'operation_completed' | 'operation_failed';
  data: any;
  timestamp: number;
}

export interface SecurityEvent {
  id: string;
  type: 'suspicious_activity' | 'rate_limit_exceeded' | 'unauthorized_access' | 'fraud_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  timestamp: number;
  resolved: boolean;
}

export interface EventSubscription {
  id: string;
  sessionId?: string;
  eventTypes: string[];
  callback: (event: any) => void;
  active: boolean;
}
