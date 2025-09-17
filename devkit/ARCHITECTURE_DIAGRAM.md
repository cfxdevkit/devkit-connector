# Conflux DevKit Architecture Diagram

## 🏗️ Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          CONFLUX DEVKIT MONOREPO                                              │
│                                        Complete Architecture Overview                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              PACKAGE LAYER                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   @conflux-     │    │   @conflux-     │    │   @conflux-     │    │   @conflux-     │    │   @conflux-     │
│   devkit/core   │    │   devkit/       │    │   devkit/node   │    │   devkit/       │    │   @conflux-     │
│                 │    │   blockchain    │    │                 │    │   api-server    │    │   devkit/       │
│  ✅ Complete    │    │  ✅ Complete    │    │  ✅ Complete    │    │  🔄 Partial     │    │   dashboard     │
│                 │    │                 │    │                 │    │                 │    │                 │
│  • Types        │◄───┤  • RPC Clients  │◄───┤  • Node Mgmt    │◄───┤  • Express API  │◄───┤  • Next.js UI  │
│  • Constants    │    │  • Contracts    │    │  • Workflows    │    │  • Services     │    │  • Mantine UI   │
│  • Schemas      │    │  • Wallets      │    │  • CLI Tools    │    │  • Routes       │    │  • Components   │
│  • Utils        │    │  • Networks     │    │  • Lifecycle    │    │  • Middleware   │    │  • Services     │
│  • Validation   │    │  • API Types    │    │  • Services     │    │  • Error Hand   │    │  • Pages        │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │                       │
         │                       │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            DEPENDENCY FLOW                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   @conflux-     │
│   devkit/core   │
│                 │
│  • No deps      │
│  • Base types   │
│  • Utilities    │
│  • Constants    │
│  • Schemas      │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   @conflux-     │
│   devkit/       │
│   blockchain    │
│                 │
│  • Depends on   │
│    core         │
│  • RPC clients  │
│  • Contracts    │
│  • Wallets      │
│  • Networks     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   @conflux-     │
│   devkit/node   │
│                 │
│  • Depends on   │
│    core +       │
│    blockchain   │
│  • Node mgmt    │
│  • Workflows    │
│  • CLI tools    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   @conflux-     │
│   devkit/       │
│   api-server    │
│                 │
│  • Depends on   │
│    core +       │
│    blockchain   │
│  • Express API  │
│  • Services     │
│  • Routes       │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   @conflux-     │
│   devkit/       │
│   dashboard     │
│                 │
│  • Depends on   │
│    core +       │
│    blockchain   │
│  • Next.js UI   │
│  • Mantine UI   │
│  • Components   │
└─────────────────┘
```

## 🔄 Type System Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            TYPE SYSTEM FLOW                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              CORE TYPES                                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NODE TYPES    │    │  WALLET TYPES   │    │ NETWORK TYPES   │    │ CONTRACT TYPES  │
│                 │    │                 │    │                 │    │                 │
│  • NodeConfig   │    │  • WalletInfo   │    │  • NetworkConfig│    │  • ContractInfo │
│  • NodeStatus   │    │  • WalletOps    │    │  • NetworkOps   │    │  • ContractOps  │
│  • NodeHealth   │    │  • WalletVal    │    │  • NetworkVal   │    │  • ContractVal  │
│  • NodeLifecycle│    │  • WalletFund   │    │  • NetworkSw    │    │  • ContractReg  │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            BLOCKCHAIN TYPES                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   RPC TYPES     │    │  CONTRACT TYPES │    │  WALLET TYPES   │    │  NETWORK TYPES  │
│                 │    │                 │    │                 │    │                 │
│  • CoreClient   │    │  • ContractMgr  │    │  • WalletMgr    │    │  • NetworkMgr   │
│  • EvmClient    │    │  • ContractDep  │    │  • WalletOps    │    │  • NetworkOps   │
│  • UnifiedClient│    │  • ContractWrap │    │  • WalletFund   │    │  • NetworkVal   │
│  • Mock Clients │    │  • ContractReg  │    │  • WalletVal    │    │  • NetworkSw    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                             NODE TYPES                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NODE TYPES    │    │ WORKFLOW TYPES  │    │  SERVICE TYPES  │    │   CLI TYPES     │
│                 │    │                 │    │                 │    │                 │
│  • NodeStatus   │    │  • WorkflowResult│   │  • INodeService │    │  • WorkflowCmd  │
│  • NodeHealth   │    │  • ValidationResult│  │  • IWorkflowSvc │    │  • NodeCmd      │
│  • NodeLifecycle│    │  • ExecutionResult│  │  • IWalletSvc   │    │  • DeployCmd    │
│  • NodeOps      │    │  • DeployOptions │  │  • IContractSvc  │    │  • TestCmd      │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            API TYPES                                                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API TYPES     │    │  BROWSER TYPES  │    │  SERVICE TYPES  │    │  MIDDLEWARE     │
│                 │    │                 │    │                 │    │     TYPES       │
│  • ApiResponse  │    │  • BrowserWallet│    │  • WalletSvc    │    │  • Auth         │
│  • ApiError     │    │  • BrowserTx    │    │  • TransactionSvc│    │  • Validation   │
│  • ResponseMeta │    │  • BrowserBlock │    │  • ContractSvc  │    │  • Logging      │
│  • Error Classes│    │  • BrowserContract│   │  • NodeSvc      │    │  • Security     │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           DASHBOARD TYPES                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  COMPONENT TYPES│    │   PAGE TYPES    │    │  SERVICE TYPES  │    │   UTIL TYPES    │
│                 │    │                 │    │                 │    │                 │
│  • Navbar       │    │  • HomePage     │    │  • ApiClient    │    │  • Formatters   │
│  • Sidebar      │    │  • WalletsPage  │    │  • WalletSvc    │    │  • Validators   │
│  • Dashboard    │    │  • ContractsPage│    │  • NodeSvc      │    │  • Helpers      │
│  • Forms        │    │  • TransactionsPage│  │  • ContractSvc  │    │  • Constants    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Service Interfaces

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          SERVICE INTERFACES                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              CORE SERVICES                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NODE SERVICE  │    │ WALLET SERVICE  │    │ CONTRACT SERVICE│    │ NETWORK SERVICE │
│                 │    │                 │    │                 │    │                 │
│  • start()      │    │  • create()     │    │  • deploy()     │    │  • switch()     │
│  • stop()       │    │  • get()        │    │  • call()       │    │  • getInfo()    │
│  • restart()    │    │  • fund()       │    │  • write()      │    │  • validate()   │
│  • getStatus()  │    │  • getBalance() │    │  • validate()   │    │  • monitor()    │
│  • isHealthy()  │    │  • validate()   │    │  • register()   │    │  • getStatus()  │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            WORKFLOW SERVICES                                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ WORKFLOW SERVICE│    │  DEPLOY SERVICE │    │ VALIDATE SERVICE│    │  TEST SERVICE   │
│                 │    │                 │    │                 │    │                 │
│  • runComplete()│    │  • deploy()     │    │  • validate()   │    │  • runTests()   │
│  • runDeploy()  │    │  • verify()     │    │  • check()      │    │  • runUnit()    │
│  • runValidate()│    │  • register()   │    │  • report()     │    │  • runE2E()     │
│  • runTest()    │    │  • monitor()    │    │  • fix()        │    │  • runPerf()    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                             API SERVICES                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ WALLET API SVC  │    │ TRANSACTION API │    │ CONTRACT API SVC│    │  NODE API SVC   │
│                 │    │      SVC        │    │                 │    │                 │
│  • create()     │    │  • send()       │    │  • deploy()     │    │  • start()      │
│  • list()       │    │  • getStatus()  │    │  • call()       │    │  • stop()       │
│  • getBalance() │    │  • getReceipt() │    │  • write()      │    │  • getStatus()  │
│  • fund()       │    │  • monitor()    │    │  • validate()   │    │  • restart()    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              DATA FLOW                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   USER INPUT    │    │   CLI/API       │    │   SERVICES      │    │   BLOCKCHAIN    │
│                 │    │                 │    │                 │    │                 │
│  • Commands     │    │  • Parse        │    │  • Process      │    │  • Execute      │
│  • Forms        │    │  • Validate     │    │  • Transform    │    │  • Return       │
│  • Actions      │    │  • Route        │    │  • Normalize    │    │  • Events       │
│  • Events       │    │  • Handle       │    │  • Validate     │    │  • Results      │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   RESPONSE      │    │   API RESPONSE  │    │   NORMALIZED    │    │   RAW DATA      │
│                 │    │                 │    │                 │    │                 │
│  • Success      │    │  • ApiResponse  │    │  • BrowserSafe  │    │  • BigInt       │
│  • Error        │    │  • ApiError     │    │  • Stringified  │    │  • Hex          │
│  • Status       │    │  • ResponseMeta │    │  • Formatted    │    │  • Binary       │
│  • Data         │    │  • Metadata     │    │  • Validated    │    │  • Raw          │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            TYPE CONVERSION                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NORMALIZE     │    │   CONVERT       │    │   VALIDATE      │    │   FORMAT        │
│                 │    │                 │    │                 │    │                 │
│  • Addresses    │    │  • To Browser   │    │  • Schemas      │    │  • Display      │
│  • BigInts      │    │  • To API       │    │  • Types        │    │  • Logs         │
│  • Hashes       │    │  • To Core      │    │  • Rules        │    │  • Errors       │
│  • Objects      │    │  • To Blockchain│    │  • Constraints  │    │  • Responses    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔗 Network Configuration

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          NETWORK CONFIGURATION                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    MAINNET      │    │    TESTNET      │    │     LOCAL       │
│                 │    │                 │    │                 │
│  Core: 1029     │    │  Core: 2029     │    │  Core: 2029     │
│  EVM:  1030     │    │  EVM:  2030     │    │  EVM:  2030     │
│  Port: 12537    │    │  Port: 12537    │    │  Port: 12537    │
│  EVM:  8545     │    │  EVM:  8545     │    │  EVM:  8545     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CORE CHAIN    │    │   EVM CHAIN     │    │  UNIFIED CLIENT │
│                 │    │                 │    │                 │
│  • cive client  │    │  • viem client  │    │  • Both clients │
│  • Core RPC     │    │  • EVM RPC      │    │  • Auto switch  │
│  • Core types   │    │  • EVM types    │    │  • Unified API  │
│  • Core ops     │    │  • EVM ops      │    │  • Type safety  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Package Status

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            PACKAGE STATUS                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   @conflux-     │    │   @conflux-     │    │   @conflux-     │    │   @conflux-     │    │   @conflux-     │
│   devkit/core   │    │   devkit/       │    │   devkit/node   │    │   devkit/       │    │   devkit/       │
│                 │    │   blockchain    │    │                 │    │   api-server    │    │   dashboard     │
│  ✅ Complete    │    │  ✅ Complete    │    │  ✅ Complete    │    │  🔄 Partial     │    │  🔄 Partial     │
│                 │    │                 │    │                 │    │                 │    │                 │
│  • 100% Done    │    │  • 100% Done    │    │  • 100% Done    │    │  • 30% Done     │    │  • 20% Done     │
│  • All Types    │    │  • All Clients  │    │  • All Services │    │  • Basic API    │    │  • Basic UI     │
│  • All Utils    │    │  • All Contracts│    │  • All CLI      │    │  • Basic Routes │    │  • Basic Pages  │
│  • All Schemas  │    │  • All Wallets  │    │  • All Workflows│    │  • Basic Middleware│  • Basic Components│
│  • All Constants│    │  • All Networks │    │  • All Lifecycle│    │  • Basic Error  │    │  • Basic Services│
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

This architecture provides a comprehensive, type-safe, and maintainable foundation for Conflux blockchain development with clear separation of concerns and excellent developer experience.
