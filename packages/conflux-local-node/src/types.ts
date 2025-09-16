export interface NodeConfig {
  corePort?: number;
  evmPort?: number;
  blockInterval?: number;
  chainId?: number;
  evmChainId?: number;
  dataDir?: string;
  silent?: boolean;
  walletMode?: "mnemonic" | "privatekey";
  mnemonic?: string;
  privateKey?: string;
  fundWallets?: boolean;
  walletCount?: number;
}

export interface ExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
}

export interface NodeStatus {
  running: boolean;
  corePort?: number;
  evmPort?: number;
  chainId?: number;
  evmChainId?: number;
  blockNumber?: number;
  peerCount?: number;
  walletMode?: "mnemonic" | "privatekey";
  wallets?: WalletInfo[];
  miningAddress?: string;
}

export interface WalletInfo {
  index: number;
  address: string;
  privateKey: string;
  balance?: string;
  isMining?: boolean;
}

export interface DeployOptions {
  network?: string;
  port?: string;
  ethPort?: string;
}

export interface DeploymentResult {
  network: string;
  contract: string;
  address: string;
  txHash: string;
  gasUsed: string;
  timestamp: string;
}

export interface TestOptions {
  network?: string;
  port?: string;
  ethPort?: string;
}

export interface TestResult {
  network: string;
  test: string;
  passed: boolean;
  duration: number;
  error?: string;
}
