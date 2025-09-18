# 🚀 Hybrid Architecture Implementation Guide

## 📊 **Function Mapping Summary**

### **Current State: 59 Functions → 3 Packages**

| **Package**                      | **Functions** | **Purpose**    | **Location** |
| -------------------------------- | ------------- | -------------- | ------------ |
| **@conflux-devkit/state-ui**     | 8 functions   | UI state only  | Browser      |
| **@conflux-devkit/state-server** | 35 functions  | Business logic | Server       |
| **@conflux-devkit/state-client** | 16 functions  | API client     | Browser      |

## 🎯 **Detailed Function Categorization**

### **1. UI State Functions (8 functions) - Browser Only**

```typescript
// Theme & Appearance
setTheme(theme: 'light' | 'dark' | 'system') => void

// Layout & Navigation
toggleSidebar() => void
setActiveTab(tab: string) => void

// Notifications & Modals
addNotification(notification: Omit<NotificationState, 'id' | 'timestamp'>) => void
removeNotification(id: string) => void
openModal(type: string, props?: Record<string, unknown>) => string
closeModal(id: string) => void

// Loading States
setLoading(key: string, loading: boolean) => void
```

### **2. Business State Functions (35 functions) - Server Only**

#### **Connection Management (3 functions)**

```typescript
connect(config: Partial<NodeConfig>) => Promise<void>
disconnect() => Promise<void>
setConnectionError(error: string | null) => void
```

#### **Node Management (5 functions)**

```typescript
startNode(config?: Partial<NodeConfig>) => Promise<void>
stopNode() => Promise<void>
restartNode(config?: Partial<NodeConfig>) => Promise<void>
updateNodeStatus(status: BrowserNodeStatus) => void
setNodeError(error: string | null) => void
```

#### **Wallet Management (6 functions)**

```typescript
createWallet(mnemonic?: string) => Promise<BrowserWalletInfo>
importWallet(privateKey: string) => Promise<BrowserWalletInfo>
selectWallet(address: string) => void
refreshWalletBalance(address: string) => Promise<void>
setWalletError(error: string | null) => void
removeWallet(address: string) => void
```

#### **Contract Management (8 functions)**

```typescript
deployContract(contractName: string, args?: unknown[]) => Promise<BrowserContractOrchestrator>
selectContract(address: string) => void
callContractMethod(params: ContractCallParams) => Promise<ContractCallState>
subscribeToEvents(contractAddress: string, eventName?: string) => void
unsubscribeFromEvents(contractAddress: string, eventName?: string) => void
setContractError(error: string | null) => void
addContract(contract: BrowserContractOrchestrator) => void
removeContract(address: string) => void
```

#### **Network Management (3 functions)**

```typescript
switchNetwork(networkId: string) => Promise<void>
setNetworkError(error: string | null) => void
setCurrentNetwork(network: BrowserNetworkConfig) => void
```

#### **Utility Functions (2 functions)**

```typescript
reset() => void
refreshAll() => Promise<void>
```

#### **Error Handling (2 functions)**

```typescript
setError(error: string) => void
clearError() => void
```

### **3. API Client Functions (16 functions) - Browser**

#### **HTTP API Client (12 functions)**

```typescript
// Connection API
connect(config: Partial<NodeConfig>) => Promise<ConnectionResponse>
disconnect() => Promise<void>

// Node API
startNode(config?: Partial<NodeConfig>) => Promise<NodeResponse>
stopNode() => Promise<void>
restartNode(config?: Partial<NodeConfig>) => Promise<NodeResponse>
getNodeStatus() => Promise<NodeStatusResponse>

// Wallet API
createWallet(mnemonic?: string) => Promise<WalletResponse>
importWallet(privateKey: string) => Promise<WalletResponse>
getWallets() => Promise<WalletsResponse>
selectWallet(address: string) => Promise<void>
refreshWalletBalance(address: string) => Promise<BalanceResponse>
removeWallet(address: string) => Promise<void>

// Contract API
deployContract(contractName: string, args?: unknown[]) => Promise<ContractResponse>
getContracts() => Promise<ContractsResponse>
selectContract(address: string) => Promise<void>
callContractMethod(params: ContractCallParams) => Promise<ContractCallResponse>
removeContract(address: string) => Promise<void>

// Network API
switchNetwork(networkId: string) => Promise<NetworkResponse>
getNetworks() => Promise<NetworksResponse>
```

#### **WebSocket Client (4 functions)**

```typescript
// WebSocket Events
onWalletCreated(callback: (wallet: BrowserWalletInfo) => void) => void
onContractDeployed(callback: (contract: BrowserContractOrchestrator) => void) => void
onNodeStatusChanged(callback: (status: BrowserNodeStatus) => void) => void
onError(callback: (error: string, context: string) => void) => void
```

## 🔄 **API Endpoint Mapping**

### **REST API Endpoints (12 endpoints)**

| **Endpoint**                     | **Method** | **Purpose**          | **Request Body**                             | **Response**                                          |
| -------------------------------- | ---------- | -------------------- | -------------------------------------------- | ----------------------------------------------------- |
| `/api/connect`                   | POST       | Connect to network   | `{ config: Partial<NodeConfig> }`            | `{ success: boolean, isConnected: boolean }`          |
| `/api/disconnect`                | POST       | Disconnect           | -                                            | `{ success: boolean }`                                |
| `/api/node/status`               | GET        | Get node status      | -                                            | `{ status: BrowserNodeStatus }`                       |
| `/api/node/start`                | POST       | Start node           | `{ config?: Partial<NodeConfig> }`           | `{ success: boolean, status: BrowserNodeStatus }`     |
| `/api/node/stop`                 | POST       | Stop node            | -                                            | `{ success: boolean }`                                |
| `/api/node/restart`              | POST       | Restart node         | `{ config?: Partial<NodeConfig> }`           | `{ success: boolean, status: BrowserNodeStatus }`     |
| `/api/wallets`                   | GET        | Get all wallets      | -                                            | `{ wallets: BrowserWalletInfo[] }`                    |
| `/api/wallets`                   | POST       | Create wallet        | `{ mnemonic?: string }`                      | `{ wallet: BrowserWalletInfo }`                       |
| `/api/wallets/import`            | POST       | Import wallet        | `{ privateKey: string }`                     | `{ wallet: BrowserWalletInfo }`                       |
| `/api/wallets/:address/select`   | PUT        | Select wallet        | -                                            | `{ success: boolean }`                                |
| `/api/wallets/:address/balance`  | GET        | Get wallet balance   | -                                            | `{ balance: string, balanceFormatted: string }`       |
| `/api/wallets/:address`          | DELETE     | Remove wallet        | -                                            | `{ success: boolean }`                                |
| `/api/contracts`                 | GET        | Get all contracts    | -                                            | `{ contracts: BrowserContractOrchestrator[] }`        |
| `/api/contracts`                 | POST       | Deploy contract      | `{ contractName: string, args?: unknown[] }` | `{ contract: BrowserContractOrchestrator }`           |
| `/api/contracts/:address/select` | PUT        | Select contract      | -                                            | `{ success: boolean }`                                |
| `/api/contracts/:address/call`   | POST       | Call contract method | `{ method: string, args: unknown[] }`        | `{ result: ContractCallState }`                       |
| `/api/contracts/:address`        | DELETE     | Remove contract      | -                                            | `{ success: boolean }`                                |
| `/api/networks`                  | GET        | Get all networks     | -                                            | `{ networks: BrowserNetworkConfig[] }`                |
| `/api/networks/switch`           | POST       | Switch network       | `{ networkId: string }`                      | `{ success: boolean, network: BrowserNetworkConfig }` |

### **WebSocket Events (8 events)**

| **Event**                 | **Purpose**            | **Data**                                    |
| ------------------------- | ---------------------- | ------------------------------------------- |
| `connection:connected`    | Connection established | `{ isConnected: boolean }`                  |
| `connection:disconnected` | Connection lost        | `{ isConnected: boolean }`                  |
| `connection:error`        | Connection error       | `{ error: string }`                         |
| `node:started`            | Node started           | `{ status: BrowserNodeStatus }`             |
| `node:stopped`            | Node stopped           | `{ status: BrowserNodeStatus }`             |
| `node:status:changed`     | Node status updated    | `{ status: BrowserNodeStatus }`             |
| `wallet:created`          | New wallet created     | `{ wallet: BrowserWalletInfo }`             |
| `wallet:updated`          | Wallet updated         | `{ wallet: BrowserWalletInfo }`             |
| `wallet:removed`          | Wallet removed         | `{ address: string }`                       |
| `wallet:selected`         | Wallet selected        | `{ wallet: BrowserWalletInfo }`             |
| `wallet:balance:updated`  | Wallet balance updated | `{ address: string, balance: string }`      |
| `contract:deployed`       | Contract deployed      | `{ contract: BrowserContractOrchestrator }` |
| `contract:updated`        | Contract updated       | `{ contract: BrowserContractOrchestrator }` |
| `contract:removed`        | Contract removed       | `{ address: string }`                       |
| `contract:selected`       | Contract selected      | `{ contract: BrowserContractOrchestrator }` |
| `contract:called`         | Contract method called | `{ call: ContractCallState }`               |
| `contract:event`          | Contract event emitted | `{ event: ContractEventState }`             |
| `network:switched`        | Network switched       | `{ network: BrowserNetworkConfig }`         |
| `network:error`           | Network error          | `{ error: string }`                         |

## 🎯 **Implementation Strategy**

### **Phase 1: Package Creation**

1. **@conflux-devkit/state-ui** - UI state management (8 functions)
2. **@conflux-devkit/state-server** - Business logic + API (35 functions)
3. **@conflux-devkit/state-client** - API client + hooks (16 functions)

### **Phase 2: API Implementation**

1. **REST API** - 12 endpoints for CRUD operations
2. **WebSocket** - 8 events for real-time updates
3. **Authentication** - JWT tokens for security
4. **Rate Limiting** - Prevent abuse

### **Phase 3: UI Integration**

1. **React Hooks** - Custom hooks for each package
2. **WebSocket Integration** - Real-time state synchronization
3. **Error Handling** - Comprehensive error management
4. **Loading States** - User feedback during operations

### **Phase 4: Migration**

1. **Showcase WebApp** - Migrate to new architecture
2. **Backward Compatibility** - Ensure existing code works
3. **Testing** - Comprehensive testing of all functions
4. **Documentation** - Update all documentation

## 📋 **Key Benefits**

1. **Security**: Private keys and sensitive operations on server
2. **Performance**: UI state in browser, business logic on server
3. **Scalability**: Centralized business state, distributed UI state
4. **Real-time**: WebSocket for live updates
5. **Maintainability**: Clear separation of concerns
6. **Flexibility**: Can work in browser-only mode for development

## 🎯 **Next Steps**

1. **Create the three new packages** with proper function mapping
2. **Implement the API layer** with REST and WebSocket
3. **Update UI components** to use the new architecture
4. **Migrate showcase webapp** to the hybrid approach
5. **Test and validate** the complete system

This comprehensive mapping ensures that all 59 current functions are properly categorized and mapped to the new hybrid architecture, providing a clear path forward for implementation.
