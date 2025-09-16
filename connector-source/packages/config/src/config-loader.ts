import { config } from 'dotenv';
import { AppConfig } from '@conflux-wallet/types';
import { validateConfig } from './validation';

// Load environment variables
config();

export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  getConfig(): AppConfig {
    return this.config;
  }

  private loadConfig(): AppConfig {
    const config: AppConfig = {
      database: {
        url: process.env.DATABASE_URL || 'postgresql://conflux_user:conflux_password@localhost:5432/conflux_wallet',
        ssl: process.env.NODE_ENV === 'production',
        pool: {
          min: parseInt(process.env.DB_POOL_MIN || '2'),
          max: parseInt(process.env.DB_POOL_MAX || '10'),
        },
      },
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
      },
      encryption: {
        algorithm: 'aes-256-cbc',
        keyLength: 32,
        ivLength: 16,
      },
      chains: {
        eSpace: {
          rpcUrl: process.env.NEXT_PUBLIC_CONFLUX_ESPACE_RPC || 'https://evm.confluxrpc.com',
          chainId: 1030,
          blockExplorerUrl: 'https://evm.confluxscan.net',
        },
        core: {
          rpcUrl: process.env.NEXT_PUBLIC_CONFLUX_CORE_RPC || 'https://main.confluxrpc.com',
          networkId: 1029,
          blockExplorerUrl: 'https://confluxscan.net',
        },
      },
      security: {
        jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
        rateLimit: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
          max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
        },
        encryptionKey: process.env.WALLET_ENCRYPTION_KEY || 'your-32-byte-hex-encryption-key',
      },
      monitoring: {
        logLevel: process.env.LOG_LEVEL || 'info',
        enableMetrics: process.env.ENABLE_METRICS === 'true',
        enableTracing: process.env.ENABLE_TRACING === 'true',
      },
    };

    // Validate configuration
    validateConfig(config);

    return config;
  }
}
