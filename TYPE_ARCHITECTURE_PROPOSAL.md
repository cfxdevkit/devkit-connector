# 🏗️ Conflux DevKit Type Architecture Proposal

## 🎯 **Current Problems**

### 1. **Type Duplication**

- Multiple packages define similar types with variations
- No clear inheritance hierarchy
- Inconsistent patterns across packages

### 2. **Wrong Type Locations**

- Browser types defined in core package
- UI-specific types scattered across packages
- No clear separation of concerns

### 3. **Circular Dependencies**

- Core → State → UI-Primitives → Core
- Makes refactoring difficult
- Creates maintenance overhead

### 4. **Inconsistent Patterns**

- Server types use `bigint` and `0x${string}`
- Browser types use `string` for JSON serialization
- No clear conversion strategy

## 🏛️ **Proposed Architecture**

### **Package Structure**

```
@conflux-devkit/
├── core/                    # Base types and utilities
│   ├── types/
│   │   ├── base.ts         # Core base types
│   │   ├── blockchain.ts   # Blockchain-specific base types
│   │   └── utils.ts        # Type utilities and guards
│   └── utils/
│       └── type-conversion.ts  # Server ↔ Client conversion
├── types/                   # NEW: Dedicated types package
│   ├── server/             # Server-side type extensions
│   ├── client/             # Client-side type extensions
│   └── shared/             # Shared type utilities
├── state/                   # State management (uses types package)
├── ui-primitives/          # UI components (uses types package)
└── showcase-webapp/        # Application (uses all packages)
```

### **Type Hierarchy**

#### **1. Base Types (Core Package)**

```typescript
// @conflux-devkit/core/types/base.ts

// Base wallet interface
export interface BaseWalletInfo {
  index: number;
  address: `0x${string}`;
  privateKey: `0x${string}`;
  mnemonic?: string;
  isMining?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Base network interface
export interface BaseNetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  evmChainId?: number;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
  networkType?: "core" | "evm";
  blockExplorer?: string;
}

// Base contract interface
export interface BaseContractInfo {
  address: `0x${string}`;
  abi: AbiItem[];
  name: string;
  version?: string;
  deployedAt?: Date;
  network: string;
}
```

#### **2. Server Types (Core Package)**

```typescript
// @conflux-devkit/core/types/blockchain.ts

// Server-side wallet with bigint precision
export interface WalletInfo extends BaseWalletInfo {
  balance?: bigint; // Internal: bigint for calculations
  balanceFormatted?: string; // Display: formatted string
}

// Server-side network config
export interface NetworkConfig extends BaseNetworkConfig {
  // No changes needed - already server-optimized
}

// Server-side contract info
export interface ContractInfo extends BaseContractInfo {
  // No changes needed - already server-optimized
}
```

#### **3. Client Types (Types Package)**

```typescript
// @conflux-devkit/types/client/wallet.ts

// Client-side wallet with string serialization
export interface ClientWalletInfo
  extends Omit<BaseWalletInfo, "address" | "privateKey"> {
  address: string; // Browser-safe address
  privateKey: string; // Browser-safe private key
  balance: string; // Browser-safe balance
  balanceFormatted: string; // Human-readable balance
  isDefault?: boolean;
  name?: string;
  network?: string;
}

// @conflux-devkit/types/client/network.ts

// Client-side network config
export interface ClientNetworkConfig
  extends Omit<BaseNetworkConfig, "chainId" | "evmChainId" | "currency"> {
  chainId: string; // Browser-safe chain ID
  evmChainId?: string; // Browser-safe EVM chain ID
  currency: {
    name: string;
    symbol: string;
    decimals: string; // Browser-safe decimals
  };
}

// @conflux-devkit/types/client/contract.ts

// Client-side contract orchestrator
export interface ClientContractOrchestrator
  extends Omit<BaseContractInfo, "address"> {
  id?: string;
  address: string; // Browser-safe address
  abi: string | any[]; // JSON stringified ABI or ABI array
  bytecode: string;
  deployedBytecode: string;
  chainType: "core" | "evm";
  networkId: string;
  chainId: string | number;
  evmChainId?: string | number;
  network: ClientNetworkConfig;
  methods: {
    read: string[] | any[];
    write: string[] | any[];
    events: string[] | any[];
    constructor?: any;
  };
  capabilities: {
    read: boolean;
    write: boolean;
    events: boolean;
    canRead?: boolean;
    canWrite?: boolean;
    hasEvents?: boolean;
    canReceive?: boolean;
    canFallback?: boolean;
    isUpgradeable?: boolean;
    isPausable?: boolean;
    isOwnable?: boolean;
  };
  metadata?: {
    name?: string;
    version?: string;
    description?: string;
    author?: string;
    license?: string;
    source?: string;
    tags?: string[];
    category?: string;
    icon?: string;
    color?: string;
    website?: string;
    documentation?: string;
  };
  deployment?: {
    transactionHash?: string;
    blockNumber?: string;
    gasUsed?: string;
    deployedAt?: string;
    isVerified?: boolean;
    verificationStatus?: string;
  };
  types?: {
    generated?: boolean;
    generatedAt?: string;
    error?: string;
    generatedTypes?: Record<string, unknown>;
  };
  ui?: {
    displayName?: string;
    description?: string;
    category?: string;
    icon?: string;
    color?: string;
    tags?: string[];
    isActive?: boolean;
    lastUsed?: string;
    usageCount?: number;
  };
}
```

#### **4. State Types (State Package)**

```typescript
// @conflux-devkit/state/types/state.ts

import type {
  ClientWalletInfo,
  ClientNetworkConfig,
  ClientContractOrchestrator,
  ClientNodeStatus,
} from "@conflux-devkit/types/client";

// State package uses client types directly
export interface AppState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  error: string | null;

  node: {
    status: ClientNodeStatus | null;
    isRunning: boolean;
    isStarting: boolean;
    isStopping: boolean;
    error: string | null;
    lastHealthCheck: Date | null;
    uptime: number;
  };

  wallets: {
    activeWallet: ClientWalletInfo | null;
    wallets: ClientWalletInfo[];
    isCreating: boolean;
    isImporting: boolean;
    error: string | null;
    balance: string | null;
    isRefreshing: boolean;
  };

  contracts: {
    deployed: ClientContractOrchestrator[];
    isDeploying: boolean;
    deploymentError: string | null;
    activeContract: ClientContractOrchestrator | null;
    contractCalls: ContractCallState[];
    events: ContractEventState[];
    error: string | null;
  };

  network: {
    current: ClientNetworkConfig | null;
    available: ClientNetworkConfig[];
    isSwitching: boolean;
    switchError: string | null;
  };

  ui: {
    theme: "light" | "dark" | "system";
    sidebarOpen: boolean;
    activeTab: string;
    notifications: NotificationState[];
    modals: ModalState[];
    loading: Record<string, boolean>;
    error: string | null;
  };
}
```

#### **5. UI Types (UI Primitives Package)**

```typescript
// @conflux-devkit/ui-primitives/types/ui.ts

import type {
  ClientWalletInfo,
  ClientNetworkConfig,
  ClientContractOrchestrator,
} from "@conflux-devkit/types/client";

// UI-specific types that extend client types
export interface ContractCardProps {
  contract: ClientContractOrchestrator;
  isActive?: boolean;
  onSelect?: (contract: ClientContractOrchestrator) => void;
  onCall?: (contract: ClientContractOrchestrator, method: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface WalletCardProps {
  wallet: ClientWalletInfo;
  isActive?: boolean;
  onSelect?: (wallet: ClientWalletInfo) => void;
  onRefresh?: (wallet: ClientWalletInfo) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface NetworkSelectorProps {
  current: ClientNetworkConfig | null;
  available: ClientNetworkConfig[];
  onSwitch: (networkId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}
```

### **Type Conversion Utilities**

```typescript
// @conflux-devkit/core/utils/type-conversion.ts

export class TypeConverter {
  // Server to Client conversion
  static toClientWalletInfo(server: WalletInfo): ClientWalletInfo {
    return {
      ...server,
      address: server.address,
      privateKey: server.privateKey,
      balance: server.balance?.toString() || "0",
      balanceFormatted: server.balanceFormatted || "0",
    };
  }

  static toClientNetworkConfig(server: NetworkConfig): ClientNetworkConfig {
    return {
      ...server,
      chainId: server.chainId.toString(),
      evmChainId: server.evmChainId?.toString(),
      currency: {
        ...server.currency,
        decimals: server.currency.decimals.toString(),
      },
    };
  }

  // Client to Server conversion
  static toServerWalletInfo(client: ClientWalletInfo): WalletInfo {
    return {
      ...client,
      address: client.address as `0x${string}`,
      privateKey: client.privateKey as `0x${string}`,
      balance: BigInt(client.balance),
      balanceFormatted: client.balanceFormatted,
    };
  }

  static toServerNetworkConfig(client: ClientNetworkConfig): NetworkConfig {
    return {
      ...client,
      chainId: parseInt(client.chainId),
      evmChainId: client.evmChainId ? parseInt(client.evmChainId) : undefined,
      currency: {
        ...client.currency,
        decimals: parseInt(client.currency.decimals),
      },
    };
  }
}
```

## 🔄 **Migration Strategy**

### **Phase 1: Create Types Package**

1. Create `@conflux-devkit/types` package
2. Move browser types from core to types package
3. Create proper inheritance hierarchy
4. Add type conversion utilities

### **Phase 2: Update Core Package**

1. Refactor core types to be base types
2. Remove browser-specific types
3. Add type conversion utilities
4. Update exports

### **Phase 3: Update State Package**

1. Update to use client types from types package
2. Remove duplicated type definitions
3. Update imports and exports

### **Phase 4: Update UI Packages**

1. Update UI primitives to use client types
2. Remove duplicated type definitions
3. Update component props

### **Phase 5: Update Applications**

1. Update showcase webapp
2. Update other applications
3. Test type consistency

## ✅ **Benefits**

1. **Clear Hierarchy**: Base types → Server types → Client types
2. **No Duplication**: Each type defined once in the right place
3. **Type Safety**: Proper inheritance and conversion utilities
4. **Maintainability**: Changes propagate through the hierarchy
5. **Performance**: No circular dependencies
6. **Developer Experience**: Clear imports and type definitions

## 🎯 **Next Steps**

1. Create the types package structure
2. Implement base types in core
3. Implement client types in types package
4. Add conversion utilities
5. Update all packages to use the new hierarchy
6. Test and validate the changes
