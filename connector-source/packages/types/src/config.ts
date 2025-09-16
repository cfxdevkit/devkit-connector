export interface AppConfig {
  database: DatabaseConfig;
  redis: RedisConfig;
  encryption: EncryptionConfig;
  chains: ChainsConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
}

export interface DatabaseConfig {
  url: string;
  ssl: boolean;
  pool: {
    min: number;
    max: number;
  };
}

export interface RedisConfig {
  url: string;
  password?: string;
  db: number;
}

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
}

export interface ChainsConfig {
  eSpace: {
    rpcUrl: string;
    chainId: number;
    blockExplorerUrl: string;
  };
  core: {
    rpcUrl: string;
    networkId: number;
    blockExplorerUrl: string;
  };
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  rateLimit: {
    windowMs: number;
    max: number;
  };
  encryptionKey: string;
}

export interface MonitoringConfig {
  logLevel: string;
  enableMetrics: boolean;
  enableTracing: boolean;
}
