// Dashboard-specific types
export interface DashboardState {
  systemHealth: SystemHealth | null;
  nodeStatus: NodeStatus | null;
  walletStatus: WalletStatus | null;
  contractStatus: ContractStatus | null;
  isLoading: boolean;
  error: string | null;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  lastCheck: Date;
}

export interface WalletStatus {
  loaded: boolean;
  address: string | null;
  balance: string | null;
  isMining: boolean;
}

export interface ContractStatus {
  espace: ContractDeploymentStatus;
  core: ContractDeploymentStatus;
}

export interface ContractDeploymentStatus {
  deployed: boolean;
  address: string | null;
  txHash: string | null;
  deployedAt: Date | null;
}

// Checklist types
export interface ChecklistStep {
  id: number;
  title: string;
  completed: boolean;
  description: string;
}

// Import core types from utility
import type {
  ContractStatus as CoreContractStatus,
  NodeStatus,
} from '@conflux-devkit/utility';
