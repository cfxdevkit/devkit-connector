# 🎯 UI API Mapping - Functions & Parameters for Hybrid Architecture

## 📊 **Current State Analysis**

### **Current useAppStore Functions (59 total)**

The current state package exposes 59 functions/actions that need to be properly categorized and mapped to the new hybrid architecture.

## 🏗️ **Hybrid Architecture Function Mapping**

### **1. UI State (Browser-Only) - @conflux-devkit/state-ui**

#### **UI State Management Functions**

```typescript
// Theme & Appearance
setTheme: (theme: 'light' | 'dark' | 'system') => void

// Layout & Navigation
toggleSidebar: () => void
setActiveTab: (tab: string) => void

// Notifications & Modals
addNotification: (notification: Omit<NotificationState, 'id' | 'timestamp'>) => void
removeNotification: (id: string) => void
openModal: (type: string, props?: Record<string, unknown>) => string
closeModal: (id: string) => void

// Loading States
setLoading: (key: string, loading: boolean) => void

// Error Handling (UI-specific)
setError: (error: string) => void
clearError: () => void
```

#### **UI State Selectors**

```typescript
// Theme & Appearance
theme: (state: UIState) => 'light' | 'dark' | 'system'

// Layout & Navigation
sidebarOpen: (state: UIState) => boolean
activeTab: (state: UIState) => string

// Notifications & Modals
notifications: (state: UIState) => NotificationState[]
modals: (state: UIState) => ModalState[]

// Loading States
isLoading: (state: UIState) => (key: string) => boolean

// Error States
error: (state: UIState) => string | null
```

### **2. Business State (Server-Only) - @conflux-devkit/state-server**

#### **Connection Management**

```typescript
// Connection Actions
connect: (config: Partial<NodeConfig>) => Promise<void>
disconnect: () => Promise<void>
setConnectionError: (error: string | null) => void

// Connection State
isConnected: boolean
isConnecting: boolean
connectionError: string | null
```

#### **Node Management**

```typescript
// Node Actions
startNode: (config?: Partial<NodeConfig>) => Promise<void>
stopNode: () => Promise<void>
restartNode: (config?: Partial<NodeConfig>) => Promise<void>
updateNodeStatus: (status: BrowserNodeStatus) => void
setNodeError: (error: string | null) => void

// Node State
node: {
  status: BrowserNodeStatus | null
  isRunning: boolean
  isStarting: boolean
  isStopping: boolean
  error: string | null
  lastHealthCheck: Date | null
  uptime: number
}
```

#### **Wallet Management**

```typescript
// Wallet Actions
createWallet: (mnemonic?: string) => Promise<BrowserWalletInfo>
importWallet: (privateKey: string) => Promise<BrowserWalletInfo>
selectWallet: (address: string) => void
refreshWalletBalance: (address: string) => Promise<void>
setWalletError: (error: string | null) => void
removeWallet: (address: string) => void

// Wallet State
wallets: {
  activeWallet: BrowserWalletInfo | null
  wallets: BrowserWalletInfo[]
  isCreating: boolean
  isImporting: boolean
  error: string | null
  balance: string | null
  isRefreshing: boolean
}
```

#### **Contract Management**

```typescript
// Contract Actions
deployContract: (contractName: string, args?: unknown[]) => Promise<BrowserContractOrchestrator>
selectContract: (address: string) => void
callContractMethod: (params: ContractCallParams) => Promise<ContractCallState>
subscribeToEvents: (contractAddress: string, eventName?: string) => void
unsubscribeFromEvents: (contractAddress: string, eventName?: string) => void
setContractError: (error: string | null) => void
addContract: (contract: BrowserContractOrchestrator) => void
removeContract: (address: string) => void

// Contract State
contracts: {
  deployed: BrowserContractOrchestrator[]
  isDeploying: boolean
  deploymentError: string | null
  activeContract: BrowserContractOrchestrator | null
  contractCalls: ContractCallState[]
  events: ContractEventState[]
  error: string | null
}
```

#### **Network Management**

```typescript
// Network Actions
switchNetwork: (networkId: string) => Promise<void>
setNetworkError: (error: string | null) => void
setCurrentNetwork: (network: BrowserNetworkConfig) => void

// Network State
network: {
  current: BrowserNetworkConfig | null
  available: BrowserNetworkConfig[]
  isSwitching: boolean
  switchError: string | null
}
```

#### **Utility Functions**

```typescript
// Utility Actions
reset: () => void
refreshAll: () => Promise<void>
```

### **3. API Client (Browser) - @conflux-devkit/state-client**

#### **HTTP API Client**

```typescript
// Connection API
connect: (config: Partial<NodeConfig>) => Promise<ConnectionResponse>;
disconnect: () => Promise<void>;

// Node API
startNode: (config?: Partial<NodeConfig>) => Promise<NodeResponse>;
stopNode: () => Promise<void>;
restartNode: (config?: Partial<NodeConfig>) => Promise<NodeResponse>;
getNodeStatus: () => Promise<NodeStatusResponse>;

// Wallet API
createWallet: (mnemonic?: string) => Promise<WalletResponse>;
importWallet: (privateKey: string) => Promise<WalletResponse>;
getWallets: () => Promise<WalletsResponse>;
selectWallet: (address: string) => Promise<void>;
refreshWalletBalance: (address: string) => Promise<BalanceResponse>;
removeWallet: (address: string) => Promise<void>;

// Contract API
deployContract: (contractName: string, args?: unknown[]) =>
  Promise<ContractResponse>;
getContracts: () => Promise<ContractsResponse>;
selectContract: (address: string) => Promise<void>;
callContractMethod: (params: ContractCallParams) =>
  Promise<ContractCallResponse>;
removeContract: (address: string) => Promise<void>;

// Network API
switchNetwork: (networkId: string) => Promise<NetworkResponse>;
getNetworks: () => Promise<NetworksResponse>;
```

#### **WebSocket Client**

```typescript
// WebSocket Events
onWalletCreated: (callback: (wallet: BrowserWalletInfo) => void) => void
onWalletUpdated: (callback: (wallet: BrowserWalletInfo) => void) => void
onWalletRemoved: (callback: (address: string) => void) => void

onContractDeployed: (callback: (contract: BrowserContractOrchestrator) => void) => void
onContractUpdated: (callback: (contract: BrowserContractOrchestrator) => void) => void
onContractRemoved: (callback: (address: string) => void) => void
onContractCalled: (callback: (call: ContractCallState) => void) => void

onNodeStatusChanged: (callback: (status: BrowserNodeStatus) => void) => void
onNetworkSwitched: (callback: (network: BrowserNetworkConfig) => void) => void

onError: (callback: (error: string, context: string) => void) => void
```

## 🔄 **API Endpoint Mapping**

### **REST API Endpoints**

#### **Connection Endpoints**

```typescript
POST   /api/connect
Body: { config: Partial<NodeConfig> }
Response: { success: boolean, isConnected: boolean }

POST   /api/disconnect
Response: { success: boolean }
```

#### **Node Endpoints**

```typescript
GET    /api/node/status
Response: { status: BrowserNodeStatus }

POST   /api/node/start
Body: { config?: Partial<NodeConfig> }
Response: { success: boolean, status: BrowserNodeStatus }

POST   /api/node/stop
Response: { success: boolean }

POST   /api/node/restart
Body: { config?: Partial<NodeConfig> }
Response: { success: boolean, status: BrowserNodeStatus }
```

#### **Wallet Endpoints**

```typescript
GET    /api/wallets
Response: { wallets: BrowserWalletInfo[] }

POST   /api/wallets
Body: { mnemonic?: string }
Response: { wallet: BrowserWalletInfo }

POST   /api/wallets/import
Body: { privateKey: string }
Response: { wallet: BrowserWalletInfo }

PUT    /api/wallets/:address/select
Response: { success: boolean }

GET    /api/wallets/:address/balance
Response: { balance: string, balanceFormatted: string }

DELETE /api/wallets/:address
Response: { success: boolean }
```

#### **Contract Endpoints**

```typescript
GET    /api/contracts
Response: { contracts: BrowserContractOrchestrator[] }

POST   /api/contracts
Body: { contractName: string, args?: unknown[] }
Response: { contract: BrowserContractOrchestrator }

PUT    /api/contracts/:address/select
Response: { success: boolean }

POST   /api/contracts/:address/call
Body: { method: string, args: unknown[] }
Response: { result: ContractCallState }

DELETE /api/contracts/:address
Response: { success: boolean }
```

#### **Network Endpoints**

```typescript
GET    /api/networks
Response: { networks: BrowserNetworkConfig[] }

POST   /api/networks/switch
Body: { networkId: string }
Response: { success: boolean, network: BrowserNetworkConfig }
```

### **WebSocket Events**

#### **Connection Events**

```typescript
'connection:connected'     # Connection established
'connection:disconnected'  # Connection lost
'connection:error'         # Connection error
```

#### **Node Events**

```typescript
'node:started'            # Node started
'node:stopped'            # Node stopped
'node:status:changed'     # Node status updated
'node:error'              # Node error
```

#### **Wallet Events**

```typescript
'wallet:created'          # New wallet created
'wallet:updated'          # Wallet updated
'wallet:removed'          # Wallet removed
'wallet:selected'         # Wallet selected
'wallet:balance:updated'  # Wallet balance updated
```

#### **Contract Events**

```typescript
'contract:deployed'       # Contract deployed
'contract:updated'        # Contract updated
'contract:removed'        # Contract removed
'contract:selected'       # Contract selected
'contract:called'         # Contract method called
'contract:event'          # Contract event emitted
```

#### **Network Events**

```typescript
'network:switched'        # Network switched
'network:error'           # Network error
```

## 🎯 **UI Component Integration**

### **React Hooks for UI Components**

#### **UI State Hooks**

```typescript
// UI State Hook
const useUIState = () => {
  const theme = useUIStore((state) => state.theme);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const activeTab = useUIStore((state) => state.activeTab);
  const notifications = useUIStore((state) => state.notifications);
  const modals = useUIStore((state) => state.modals);

  const setTheme = useUIStore((state) => state.setTheme);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const addNotification = useUIStore((state) => state.addNotification);
  const removeNotification = useUIStore((state) => state.removeNotification);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);

  return {
    // State
    theme,
    sidebarOpen,
    activeTab,
    notifications,
    modals,
    // Actions
    setTheme,
    toggleSidebar,
    setActiveTab,
    addNotification,
    removeNotification,
    openModal,
    closeModal,
  };
};
```

#### **Business State Hooks**

```typescript
// Business State Hook
const useBusinessState = () => {
  const [wallets, setWallets] = useState<BrowserWalletInfo[]>([]);
  const [contracts, setContracts] = useState<BrowserContractOrchestrator[]>([]);
  const [nodeStatus, setNodeStatus] = useState<BrowserNodeStatus | null>(null);
  const [currentNetwork, setCurrentNetwork] =
    useState<BrowserNetworkConfig | null>(null);

  // API Client
  const apiClient = useAPIClient();

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");

    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      switch (type) {
        case "wallet:created":
          setWallets((prev) => [...prev, data]);
          break;
        case "wallet:updated":
          setWallets((prev) =>
            prev.map((w) => (w.address === data.address ? data : w))
          );
          break;
        case "wallet:removed":
          setWallets((prev) => prev.filter((w) => w.address !== data.address));
          break;
        case "contract:deployed":
          setContracts((prev) => [...prev, data]);
          break;
        case "node:status:changed":
          setNodeStatus(data);
          break;
        case "network:switched":
          setCurrentNetwork(data);
          break;
      }
    };

    return () => ws.close();
  }, []);

  // Actions
  const createWallet = useCallback(
    async (mnemonic?: string) => {
      const wallet = await apiClient.createWallet(mnemonic);
      setWallets((prev) => [...prev, wallet]);
      return wallet;
    },
    [apiClient]
  );

  const deployContract = useCallback(
    async (contractName: string, args?: unknown[]) => {
      const contract = await apiClient.deployContract(contractName, args);
      setContracts((prev) => [...prev, contract]);
      return contract;
    },
    [apiClient]
  );

  return {
    // State
    wallets,
    contracts,
    nodeStatus,
    currentNetwork,
    // Actions
    createWallet,
    deployContract,
  };
};
```

## 📋 **Migration Checklist**

### **Phase 1: Create Packages**

- [ ] Create `@conflux-devkit/state-ui` package
- [ ] Create `@conflux-devkit/state-server` package
- [ ] Create `@conflux-devkit/state-client` package

### **Phase 2: Implement API Layer**

- [ ] Implement REST API endpoints
- [ ] Implement WebSocket server
- [ ] Add authentication & authorization
- [ ] Add rate limiting & caching

### **Phase 3: Update UI Components**

- [ ] Update components to use separated state
- [ ] Implement WebSocket integration
- [ ] Add error handling & loading states
- [ ] Test real-time updates

### **Phase 4: Migration & Testing**

- [ ] Migrate showcase webapp
- [ ] Test both dev and production modes
- [ ] Validate security and performance
- [ ] Ensure backward compatibility

## 🎯 **Key Benefits**

1. **Clear Separation**: UI state vs business state
2. **Security**: Private keys on server
3. **Performance**: UI state in browser, business logic on server
4. **Real-time**: WebSocket for live updates
5. **Scalability**: Centralized business state
6. **Maintainability**: Clear function mapping and API contracts

This comprehensive mapping ensures that all current functionality is preserved while providing a clean, secure, and scalable architecture for the future.
