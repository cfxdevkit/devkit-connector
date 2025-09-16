# Complete Implementation Guide: Conflux Dual Chain Wallet System

## Project Overview

Build a production-ready wallet system supporting both Conflux eSpace (EVM-compatible) and Core chains with two operation modes:
- **Option A**: Server-managed wallets with encrypted mnemonic storage
- **Option B**: User-delegated wallets with permission-based operations

## Architecture Summary

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client App    │◄──►│   Server API     │◄──►│   Blockchain    │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Wagmi/Viem  │ │    │ │ Wallet Mgmt  │ │    │ │ eSpace      │ │
│ │ (eSpace)    │ │    │ │ Service      │ │    │ │ (EVM)       │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Core Chain  │ │    │ │ Delegation   │ │    │ │ Core Chain  │ │
│ │ Adapter     │ │    │ │ Manager      │ │    │ │ (CIVE)      │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Prerequisites

### Dependencies
```json
{
  "dependencies": {
    "ethers": "^6.8.0",
    "js-conflux-sdk": "^2.2.0", 
    "viem": "^1.18.0",
    "wagmi": "^1.4.0",
    "@tanstack/react-query": "^4.35.0",
    "bip39": "^3.1.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "@rainbow-me/rainbowkit": "^1.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "typescript": "^5.2.0",
    "next": "^14.0.0"
  }
}
```

### Environment Variables
```bash
# .env.local
# Encryption & Security
WALLET_ENCRYPTION_KEY=your-32-byte-hex-encryption-key
JWT_SECRET=your-jwt-secret-key
NEXTAUTH_SECRET=your-nextauth-secret

# Server Wallet (Option A)
ENCRYPTED_WALLET_MNEMONIC=your-encrypted-mnemonic-string

# Database (if using multi-user)
DATABASE_URL=postgresql://user:password@localhost:5432/conflux_wallet

# RPC Endpoints
NEXT_PUBLIC_CONFLUX_ESPACE_RPC=https://evm.confluxrpc.com
NEXT_PUBLIC_CONFLUX_CORE_RPC=https://main.confluxrpc.com
CONFLUX_ESPACE_TESTNET_RPC=https://evmtestnet.confluxrpc.com
CONFLUX_CORE_TESTNET_RPC=https://test.confluxrpc.com

# Optional: External Services
ALCHEMY_API_KEY=your-alchemy-key
INFURA_PROJECT_ID=your-infura-project-id
```

## Implementation Steps

### Phase 1: Foundation Setup (Week 1)

#### 1.1 Project Structure
```
src/
├── server/
│   ├── services/
│   │   ├── wallet-service.ts          # Option A: Server wallet management
│   │   ├── delegation-service.ts      # Option B: User delegation
│   │   ├── enhanced-delegation.ts     # Advanced delegation features
│   │   └── event-manager.ts          # Event tracking system
│   ├── adapters/
│   │   ├── espace-adapter.ts         # eSpace (viem) integration
│   │   └── core-adapter.ts           # Core chain (cive) integration
│   └── api/
│       ├── wallet/route.ts           # Wallet management endpoints
│       ├── delegation/route.ts       # Delegation endpoints
│       └── events/route.ts           # Event stream endpoints
├── client/
│   ├── providers/
│   │   └── conflux-provider.tsx      # Unified wallet provider
│   ├── hooks/
│   │   ├── use-unified-wallet.ts     # Main wallet hook
│   │   ├── use-delegation.ts         # Delegation management
│   │   └── use-chain-switching.ts    # Chain switching logic
│   ├── components/
│   │   ├── wallet-connector.tsx      # Wallet connection UI
│   │   ├── delegation-dashboard.tsx  # Delegation management UI
│   │   └── transaction-history.tsx   # Transaction tracking
│   └── utils/
│       ├── address-conversion.ts     # eSpace ↔ Core address utils
│       ├── chain-config.ts          # Chain configurations
│       └── encryption.ts            # Client-side crypto utils
└── types/
    ├── wallet.ts                    # Wallet-related types
    ├── delegation.ts               # Delegation types
    └── chains.ts                   # Chain-specific types
```

#### 1.2 Core Type Definitions
```typescript
// types/wallet.ts
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

// types/delegation.ts
export interface DelegationSession {
  sessionId: string;
  userAddress: string;
  expiresAt: number;
  permissions: string[];
  limits: OperationLimits;
}

export interface OperationLimits {
  maxTransactionValue: string;
  maxDailyTransactions: number;
  allowedContracts?: string[];
}
```

### Phase 2: Server Infrastructure (Week 2)

#### 2.1 Database Schema (PostgreSQL)
```sql
-- User wallet storage (Option A)
CREATE TABLE user_wallets (
    user_id VARCHAR(255) PRIMARY KEY,
    encrypted_mnemonic TEXT NOT NULL,
    encryption_iv VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_accessed TIMESTAMP,
    wallet_version INTEGER DEFAULT 1
);

-- Delegation sessions (Option B)
CREATE TABLE delegation_sessions (
    session_id VARCHAR(64) PRIMARY KEY,
    user_address VARCHAR(42) NOT NULL,
    espace_address VARCHAR(42) NOT NULL,
    core_address VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    permissions TEXT[] NOT NULL,
    max_transaction_value NUMERIC(78,0),
    max_daily_transactions INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW()
);

-- Operation tracking
CREATE TABLE wallet_operations (
    operation_id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64),
    user_id VARCHAR(255),
    operation_type VARCHAR(32) NOT NULL,
    chain_type VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    payload JSONB NOT NULL,
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES delegation_sessions(session_id),
    FOREIGN KEY (user_id) REFERENCES user_wallets(user_id)
);

-- Event logging
CREATE TABLE delegation_events (
    event_id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64),
    event_type VARCHAR(32) NOT NULL,
    event_data JSONB NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (session_id) REFERENCES delegation_sessions(session_id)
);

-- Indexes for performance
CREATE INDEX idx_operations_session ON wallet_operations(session_id);
CREATE INDEX idx_operations_user ON wallet_operations(user_id);
CREATE INDEX idx_operations_status ON wallet_operations(status);
CREATE INDEX idx_events_session ON delegation_events(session_id);
CREATE INDEX idx_events_timestamp ON delegation_events(timestamp);
```

#### 2.2 Core Services Implementation
```typescript
// server/services/base-wallet-service.ts
export abstract class BaseWalletService {
  protected abstract loadWallet(identifier: string): Promise<WalletConfig>;
  protected abstract signTransaction(walletId: string, tx: any, chain: ChainType): Promise<string>;
  protected abstract validatePermissions(walletId: string, operation: string): Promise<boolean>;
}

// server/services/database-manager.ts
export class DatabaseManager {
  private pool: Pool;
  
  async storeEncryptedMnemonic(userId: string, encryptedMnemonic: string, iv: string): Promise<void>;
  async getEncryptedMnemonic(userId: string): Promise<{mnemonic: string, iv: string} | null>;
  async createDelegationSession(session: DelegationSession): Promise<void>;
  async getDelegationSession(sessionId: string): Promise<DelegationSession | null>;
  async logOperation(operation: WalletOperation): Promise<void>;
  async getOperationHistory(identifier: string): Promise<WalletOperation[]>;
}
```

### Phase 3: Chain Adapters (Week 2-3)

#### 3.1 eSpace Adapter (Viem Integration)
```typescript
// server/adapters/espace-adapter.ts
export class ESpaceAdapter {
  private publicClient: PublicClient;
  private walletClients: Map<string, WalletClient> = new Map();

  constructor(rpcUrl: string) {
    this.publicClient = createPublicClient({
      chain: confluxESpace,
      transport: http(rpcUrl)
    });
  }

  async createWalletClient(privateKey: string): Promise<string> {
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: confluxESpace,
      transport: http()
    });
    
    const clientId = `wallet_${Date.now()}`;
    this.walletClients.set(clientId, walletClient);
    return clientId;
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.publicClient.getBalance({ 
      address: address as `0x${string}` 
    });
    return balance.toString();
  }

  async estimateGas(transaction: any): Promise<string> {
    const gas = await this.publicClient.estimateGas(transaction);
    return gas.toString();
  }

  async sendTransaction(clientId: string, transaction: any): Promise<string> {
    const walletClient = this.walletClients.get(clientId);
    if (!walletClient) throw new Error('Wallet client not found');
    
    return await walletClient.sendTransaction(transaction);
  }

  async signTransaction(clientId: string, transaction: any): Promise<string> {
    const walletClient = this.walletClients.get(clientId);
    if (!walletClient) throw new Error('Wallet client not found');
    
    // Sign transaction without broadcasting
    return await walletClient.signTransaction(transaction);
  }
}
```

#### 3.2 Core Chain Adapter (CIVE Integration)
```typescript
// server/adapters/core-adapter.ts
import { Conflux, Drip } from 'js-conflux-sdk';

export class CoreAdapter {
  private conflux: Conflux;
  private accounts: Map<string, any> = new Map();

  constructor(rpcUrl: string, networkId: number = 1029) {
    this.conflux = new Conflux({
      url: rpcUrl,
      networkId: networkId
    });
  }

  async createAccount(privateKey: string): Promise<string> {
    const account = this.conflux.wallet.addPrivateKey(privateKey);
    const accountId = `account_${Date.now()}`;
    this.accounts.set(accountId, account);
    return accountId;
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.conflux.cfx.getBalance(address);
    return balance.toString();
  }

  async estimateGasAndCollateral(transaction: any): Promise<{gas: string, storageLimit: string}> {
    const estimate = await this.conflux.cfx.estimateGasAndCollateral(transaction);
    return {
      gas: estimate.gasUsed?.toString() || '0',
      storageLimit: estimate.storageCollateralized?.toString() || '0'
    };
  }

  async sendTransaction(accountId: string, transaction: any): Promise<string> {
    const account = this.accounts.get(accountId);
    if (!account) throw new Error('Account not found');

    // Add epoch height for Core chain
    const status = await this.conflux.cfx.getStatus();
    transaction.epochHeight = status.epochNumber;

    const signedTx = await account.signTransaction(transaction);
    return await this.conflux.cfx.sendRawTransaction(signedTx.serialize());
  }

  formatAddress(address: string, networkId: number = 1029): string {
    return this.conflux.format.address(address, networkId);
  }
}
```

### Phase 4: Client Implementation (Week 3-4)

#### 4.1 Unified Wallet Provider
```typescript
// client/providers/conflux-provider.tsx
export function ConfluxProvider({ children }: { children: ReactNode }) {
  const [eSpaceAdapter, setESpaceAdapter] = useState<ESpaceAdapter | null>(null);
  const [coreAdapter, setCoreAdapter] = useState<CoreAdapter | null>(null);
  const [currentChain, setCurrentChain] = useState<ChainType>('eSpace');

  // Wagmi configuration for eSpace
  const wagmiConfig = createConfig({
    chains: [confluxESpace, confluxESpaceTestnet],
    transports: {
      [confluxESpace.id]: http(process.env.NEXT_PUBLIC_CONFLUX_ESPACE_RPC),
      [confluxESpaceTestnet.id]: http(process.env.CONFLUX_ESPACE_TESTNET_RPC),
    },
    ssr: true,
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 }
    }
  });

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConfluxContext.Provider value={{
          eSpaceAdapter,
          coreAdapter,
          currentChain,
          switchChain: setCurrentChain,
        }}>
          {children}
        </ConfluxContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

#### 4.2 Main Wallet Hook
```typescript
// client/hooks/use-unified-wallet.ts
export function useUnifiedWallet() {
  const [mode, setMode] = useState<WalletMode | null>(null);
  const [walletConfig, setWalletConfig] = useState<WalletConfig | null>(null);
  const { address, isConnected } = useAccount(); // Wagmi for user wallets

  const loadServerWallet = async (userId: string) => {
    const response = await fetch('/api/wallet', {
      method: 'POST',
      body: JSON.stringify({ action: 'load_server_wallet', userId })
    });
    const data = await response.json();
    
    setMode('server-managed');
    setWalletConfig(data);
  };

  const delegateUserWallet = async (permissions: string[]) => {
    if (!isConnected || !address) throw new Error('Connect wallet first');
    
    // Create delegation session
    const message = `Delegate wallet to server\nAddress: ${address}\nTime: ${Date.now()}`;
    const signature = await signMessage({ message });
    
    const response = await fetch('/api/delegation', {
      method: 'POST',
      body: JSON.stringify({ 
        action: 'create_delegation',
        userAddress: address,
        signature,
        message,
        permissions 
      })
    });
    const data = await response.json();
    
    setMode('user-delegated');
    setWalletConfig(data);
  };

  const sendTransaction = async (transaction: any) => {
    if (!walletConfig) throw new Error('No wallet loaded');
    
    const response = await fetch('/api/wallet', {
      method: 'POST',
      body: JSON.stringify({
        action: 'send_transaction',
        mode,
        walletId: walletConfig.walletId || walletConfig.sessionId,
        transaction,
        chainType: currentChain
      })
    });
    
    return await response.json();
  };

  return {
    mode,
    walletConfig,
    loadServerWallet,
    delegateUserWallet,
    sendTransaction,
    isConnected: !!walletConfig,
  };
}
```

### Phase 5: Advanced Features (Week 4-5)

#### 5.1 Real-time Event System
```typescript
// server/services/websocket-manager.ts
export class WebSocketManager {
  private wss: WebSocketServer;
  private connections: Map<string, WebSocket> = new Map();

  setupEventStreaming(): void {
    this.wss.on('connection', (ws, request) => {
      const sessionId = this.extractSessionId(request);
      this.connections.set(sessionId, ws);

      ws.on('close', () => {
        this.connections.delete(sessionId);
      });
    });

    // Listen to delegation events
    eventManager.on('delegation_event', (event) => {
      const ws = this.connections.get(event.sessionId);
      if (ws) {
        ws.send(JSON.stringify(event));
      }
    });
  }
}
```

#### 5.2 Transaction Batching
```typescript
// server/services/batch-processor.ts
export class BatchProcessor {
  private pendingTransactions: Map<string, any[]> = new Map();

  async addToBatch(sessionId: string, transaction: any): Promise<void> {
    if (!this.pendingTransactions.has(sessionId)) {
      this.pendingTransactions.set(sessionId, []);
    }
    
    this.pendingTransactions.get(sessionId)!.push(transaction);
    
    // Auto-process batch when it reaches threshold
    if (this.pendingTransactions.get(sessionId)!.length >= 5) {
      await this.processBatch(sessionId);
    }
  }

  async processBatch(sessionId: string): Promise<string[]> {
    const transactions = this.pendingTransactions.get(sessionId) || [];
    this.pendingTransactions.delete(sessionId);

    // Process all transactions in batch
    return await Promise.all(
      transactions.map(tx => this.processTransaction(sessionId, tx))
    );
  }
}
```

### Phase 6: Security & Testing (Week 5-6)

#### 6.1 Security Measures
```typescript
// server/middleware/security.ts
export class SecurityMiddleware {
  static rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
  });

  static validateSession(req: Request, res: Response, next: NextFunction) {
    const sessionId = req.headers['x-session-id'];
    const session = delegationService.getSession(sessionId);
    
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    req.session = session;
    next();
  }

  static validateOperation(req: Request, res: Response, next: NextFunction) {
    const { operation } = req.body;
    const { session } = req;
    
    if (!session.permissions.includes(operation)) {
      return res.status(403).json({ error: 'Operation not permitted' });
    }
    
    next();
  }
}
```

#### 6.2 Test Suite Structure
```typescript
// tests/integration/wallet-system.test.ts
describe('Conflux Dual Wallet System', () => {
  describe('Option A: Server-Managed Wallets', () => {
    it('should create and load server wallet');
    it('should sign transactions securely');
    it('should handle wallet cleanup');
  });

  describe('Option B: User-Delegated Wallets', () => {
    it('should create delegation session');
    it('should validate user signature');
    it('should enforce operation limits');
    it('should handle session expiration');
  });

  describe('Chain Operations', () => {
    it('should switch between eSpace and Core');
    it('should convert addresses correctly');
    it('should estimate gas for both chains');
  });
});
```

## Deployment Strategy

### Development Environment
```bash
# 1. Clone and setup
git clone <repository>
cd conflux-dual-wallet
npm install

# 2. Setup environment
cp .env.example .env.local
# Fill in your environment variables

# 3. Setup database
npm run db:migrate
npm run db:seed

# 4. Start development
npm run dev
```

### Production Deployment

#### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### Kubernetes Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: conflux-wallet-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: conflux-wallet-api
  template:
    metadata:
      labels:
        app: conflux-wallet-api
    spec:
      containers:
      - name: api
        image: conflux-wallet:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

## Monitoring & Maintenance

### Health Checks
```typescript
// server/health/health-check.ts
export const healthCheck = {
  async database(): Promise<boolean> {
    // Check database connectivity
  },
  
  async rpcEndpoints(): Promise<{eSpace: boolean, core: boolean}> {
    // Check RPC endpoint availability
  },
  
  async memoryUsage(): Promise<{used: number, total: number}> {
    // Monitor memory usage
  }
};
```

### Logging Strategy
```typescript
// server/logging/logger.ts
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

## Performance Optimization

### Caching Strategy
```typescript
// server/cache/redis-cache.ts
export class RedisCache {
  private redis: Redis;

  async cacheBalance(address: string, balance: string, ttl: number = 300): Promise<void> {
    await this.redis.setex(`balance:${address}`, ttl, balance);
  }

  async getCachedBalance(address: string): Promise<string | null> {
    return await this.redis.get(`balance:${address}`);
  }
}
```

### Database Optimization
```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_operations_created_at ON wallet_operations(created_at DESC);
CREATE INDEX CONCURRENTLY idx_sessions_expires_at ON delegation_sessions(expires_at);
CREATE INDEX CONCURRENTLY idx_events_timestamp ON delegation_events(timestamp DESC);

-- Partitioning for large tables
CREATE TABLE wallet_operations_y2024m01 PARTITION OF wallet_operations
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## Success Metrics

### Key Performance Indicators
- **Transaction Success Rate**: >99.5%
- **API Response Time**: <200ms p95
- **Session Creation Time**: <1s
- **Chain Switch Time**: <500ms
- **Uptime**: >99.9%

### Business Metrics
- **User Adoption**: Track wallet connection rates
- **Transaction Volume**: Monitor daily/monthly transaction counts
- **Error Rates**: Track and analyze failure patterns
- **User Satisfaction**: Measure through user feedback

This implementation guide provides a complete foundation for building a production-ready Conflux dual chain wallet system with both server-managed and user-delegated operation modes.
