# Conflux DevKit Architecture Diagram

> **Comprehensive architecture overview of the Conflux DevKit ecosystem**

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Conflux DevKit Ecosystem                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────┐    ┌─────────────────────────────────┐    │
│  │        🌐 Dashboard             │    │     🎨 Showcase WebApp          │    │
│  │     (Next.js + Mantine)         │    │      (Express + Static)         │    │
│  │                                 │    │                                 │    │
│  │  • Development Checklist        │    │  • UI Components Demo           │    │
│  │  • Real-time Status Updates     │    │  • React Integration Demo       │    │
│  │  • Wallet Management UI         │    │  • API Integration Demo         │    │
│  │  • Contract Operations UI       │    │  • State Management Demo        │    │
│  │  • Node Control Interface       │    │  • Web Components Demo          │    │
│  └─────────────────────────────────┘    └─────────────────────────────────┘    │
│                    │                                        │                  │
│                    └────────────────┬───────────────────────┘                  │
│                                     │                                         │
│  ┌─────────────────────────────────┐ │ ┌─────────────────────────────────┐    │
│  │     📱 UI Primitives            │ │ │     🧩 UI Components            │    │
│  │    (React Hooks & Context)      │ │ │      (Web Components)           │    │
│  │                                 │ │ │                                 │    │
│  │  • useWallets()                 │ │ │  • <conflux-wallet-card>        │    │
│  │  • useContracts()               │ │ │  • <conflux-contract-card>      │    │
│  │  • useNode()                    │ │ │  • <conflux-node-status>        │    │
│  │  • useNetwork()                 │ │ │  • <conflux-network-selector>   │    │
│  │  • useUI()                      │ │ │  • <conflux-wallet-list>        │    │
│  │  • ConfluxProvider              │ │ │  • <conflux-contract-list>      │    │
│  └─────────────────────────────────┘ │ └─────────────────────────────────┘    │
│                    │                 │                 │                      │
│                    └─────────────────┼─────────────────┘                      │
│                                      │                                       │
│  ┌─────────────────────────────────┐ │ ┌─────────────────────────────────┐    │
│  │     🔌 API Server               │ │ │     📊 State Management         │    │
│  │      (Express + REST)           │ │ │        (Zustand + Persistence)  │    │
│  │                                 │ │ │                                 │    │
│  │  • Wallet Management APIs       │ │ │  • Real-time State Updates      │    │
│  │  • Contract Deployment APIs     │ │ │  • Persistent Storage           │    │
│  │  • Node Control APIs            │ │ │  • Event-driven Architecture    │    │
│  │  • Network Management APIs      │ │ │  • Cross-component Communication│    │
│  │  • System Health APIs           │ │ │  • Real Blockchain Integration  │    │
│  └─────────────────────────────────┘ │ └─────────────────────────────────┘    │
│                    │                 │                 │                      │
│                    └─────────────────┼─────────────────┘                      │
│                                      │                                       │
│  ┌─────────────────────────────────┐ │ ┌─────────────────────────────────┐    │
│  │     ⛓️ Blockchain Package       │ │ │     🏗️ Node Manager             │    │
│  │   (EVM + Core Integration)      │ │ │        (CLI + Automation)       │    │
│  │                                 │ │ │                                 │    │
│  │  • WalletManager                │ │ │  • NodeManager                  │    │
│  │  • EvmClient                    │ │ │  • ContractDeployer             │    │
│  │  • CoreClient                   │ │ │  • WorkflowOrchestrator         │    │
│  │  • ContractManager              │ │ │  • CLI Tools                    │    │
│  │  • TransactionManager           │ │ │  • Automation Scripts           │    │
│  │  • NetworkManager               │ │ │  • Status Monitoring            │    │
│  └─────────────────────────────────┘ │ └─────────────────────────────────┘    │
│                    │                 │                 │                      │
│                    └─────────────────┼─────────────────┘                      │
│                                      │                                       │
│  ┌─────────────────────────────────┐ │ ┌─────────────────────────────────┐    │
│  │     🎯 Core Package             │ │ │     🌐 Network Layer            │    │
│  │   (Types & Utilities)           │ │ │                                 │    │
│  │                                 │ │ │  • Conflux Mainnet Core        │    │
│  │  • NetworkConfig                │ │ │  • Conflux Mainnet EVM         │    │
│  │  • WalletInfo                   │ │ │  • Conflux Testnet Core        │    │
│  │  • ContractOrchestrator         │ │ │  • Conflux Testnet EVM         │    │
│  │  • BrowserConversion            │ │ │  • Local Development Core      │    │
│  │  • TypeNormalization            │ │ │  • Local Development EVM       │    │
│  │  • ApiUtils                     │ │ │                                 │    │
│  └─────────────────────────────────┘ │ └─────────────────────────────────┘    │
│                    │                 │                 │                      │
│                    └─────────────────┼─────────────────┘                      │
│                                      │                                       │
│  ┌─────────────────────────────────┐ │ ┌─────────────────────────────────┐    │
│  │     🔧 External Dependencies    │ │ │     📚 Documentation            │    │
│  │                                 │ │ │                                 │    │
│  │  • viem (EVM)                   │ │ │  • Package READMEs              │    │
│  │  • @xcfx/node (Core)            │ │ │  • API Documentation            │    │
│  │  • bip32/bip39 (Wallets)        │ │ │  • Usage Examples               │    │
│  │  • commander (CLI)              │ │ │  • Architecture Diagrams        │    │
│  │  • express (API Server)         │ │ │  • Development Guides           │    │
│  │  • zustand (State)              │ │ │  • Contributing Guidelines      │    │
│  │  • lit (Web Components)         │ │ │                                 │    │
│  └─────────────────────────────────┘ │ └─────────────────────────────────┘    │
│                                      │                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Data Flow & State Management                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   🌐 Frontend   │    │   🔌 API Layer  │    │   📊 State      │            │
│  │                 │    │                 │    │   Management    │            │
│  │  • Dashboard    │◄──►│  • REST APIs    │◄──►│  • Zustand      │            │
│  │  • Showcase     │    │  • WebSocket    │    │  • Persistence  │            │
│  │  • Components   │    │  • Rate Limiting│    │  • Events       │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│           │                       │                       │                    │
│           └───────────────────────┼───────────────────────┘                    │
│                                   │                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   ⛓️ Blockchain │    │   🏗️ Node       │    │   🎯 Core       │            │
│  │   Integration   │    │   Management    │    │   Foundation    │            │
│  │                 │    │                 │    │                 │            │
│  │  • Wallet Mgmt  │◄──►│  • Node Control │◄──►│  • Types        │            │
│  │  • Contract Ops │    │  • Deployment   │    │  • Utilities    │            │
│  │  • Transactions │    │  • Workflows    │    │  • Normalization│            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│           │                       │                       │                    │
│           └───────────────────────┼───────────────────────┘                    │
│                                   │                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   🌐 Network    │    │   🔧 External   │    │   📚 Dev Tools  │            │
│  │   Layer         │    │   Services      │    │                 │            │
│  │                 │    │                 │    │                 │            │
│  │  • Mainnet      │◄──►│  • Conflux RPC  │◄──►│  • CLI Tools    │            │
│  │  • Testnet      │    │  • EVM RPC      │    │  • Build Tools  │            │
│  │  • Local Dev    │    │  • Explorer APIs│    │  • Testing      │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 📦 Package Dependencies

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Package Dependency Graph                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐                                                           │
│  │   🌐 Dashboard  │                                                           │
│  │   (Next.js)     │                                                           │
│  └─────────────────┘                                                           │
│           │                                                                     │
│           ▼                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │ 📱 UI Primitives│    │ 🧩 UI Components│    │ 🔌 API Server   │            │
│  │ (React Hooks)   │    │ (Web Components)│    │ (Express)       │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│           │                       │                       │                    │
│           └───────────────────────┼───────────────────────┘                    │
│                                   │                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │ 📊 State Mgmt   │    │ ⛓️ Blockchain   │    │ 🏗️ Node Mgr     │            │
│  │ (Zustand)       │    │ (EVM + Core)    │    │ (CLI + Auto)    │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│           │                       │                       │                    │
│           └───────────────────────┼───────────────────────┘                    │
│                                   │                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │ 🎯 Core Package │    │ 🌐 Network      │    │ 🔧 External     │            │
│  │ (Types & Utils) │    │ (6 Networks)    │    │ Dependencies    │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│           │                       │                       │                    │
│           └───────────────────────┼───────────────────────┘                    │
│                                   │                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │ 📚 Documentation│    │ 🧪 Showcase     │    │ 🛠️ Dev Tools    │            │
│  │ (READMEs)       │    │ (Demo App)      │    │ (Build + Test)  │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔗 Type Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Type System & Data Flow                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   🎯 Core       │    │   ⛓️ Blockchain │    │   📊 State      │            │
│  │   Types         │    │   Types         │    │   Types         │            │
│  │                 │    │                 │    │                 │            │
│  │  • NetworkConfig│───►│  • WalletInfo   │───►│  • AppState     │            │
│  │  • WalletInfo   │    │  • ContractInfo │    │  • BrowserTypes │            │
│  │  • ContractInfo │    │  • Transaction  │    │  • UIState      │            │
│  │  • ApiResponse  │    │  • NetworkConfig│    │  • EventTypes   │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│           │                       │                       │                    │
│           ▼                       ▼                       ▼                    │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   🔄 Normalize  │    │   🌍 Browser    │    │   📱 UI         │            │
│  │   & Convert     │    │   Safe Types    │    │   Components    │            │
│  │                 │    │                 │    │                 │            │
│  │  • normalizeAddress│  │  • BrowserWallet│  │  • React Hooks  │            │
│  │  • normalizeBigInt │  │  • BrowserContract│  │  • Web Components│          │
│  │  • toBrowserSafe  │  │  • BrowserNetwork│  │  • Context      │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│           │                       │                       │                    │
│           └───────────────────────┼───────────────────────┘                    │
│                                   │                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   🔌 API        │    │   🏗️ Node       │    │   📚 Docs       │            │
│  │   Types         │    │   Types         │    │   Types         │            │
│  │                 │    │                 │    │                 │            │
│  │  • ApiResponse  │    │  • NodeConfig   │    │  • README       │            │
│  │  • EndpointTypes│    │  • NodeStatus   │    │  • Examples     │            │
│  │  • RequestTypes │    │  • WorkflowTypes│    │  • Guides       │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🌐 Network Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Network Configuration                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   🌐 Mainnet    │    │   🧪 Testnet    │    │   🏠 Local      │            │
│  │                 │    │                 │    │   Development   │            │
│  │  • Core: 2029   │    │  • Core: 2029   │    │  • Core: 2029   │            │
│  │  • EVM: 2030    │    │  • EVM: 2030    │    │  • EVM: 2030    │            │
│  │  • RPC: Main    │    │  • RPC: Test    │    │  • RPC: Local   │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│           │                       │                       │                    │
│           └───────────────────────┼───────────────────────┘                    │
│                                   │                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   🔗 Network    │    │   🔧 Client     │    │   📊 Status     │            │
│  │   Manager       │    │   Factory       │    │   Monitor       │            │
│  │                 │    │                 │    │                 │            │
│  │  • getNetwork() │    │  • createClient()│   │  • healthCheck()│            │
│  │  • switchNetwork│    │  • getClient()  │    │  • getStatus()  │            │
│  │  • listNetworks │    │  • destroyClient│    │  • monitor()    │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│           │                       │                       │                    │
│           └───────────────────────┼───────────────────────┘                    │
│                                   │                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   ⛓️ Core       │    │   🔗 EVM        │    │   🔄 Unified    │            │
│  │   Client        │    │   Client        │    │   Interface     │            │
│  │                 │    │                 │    │                 │            │
│  │  • CoreClient   │    │  • EvmClient    │    │  • UnifiedClient│            │
│  │  • Core RPC     │    │  • EVM RPC      │    │  • Auto-routing │            │
│  │  • Core Types   │    │  • EVM Types    │    │  • Type Safety  │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🚀 Development Workflow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Development Workflow                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   🏗️ Setup      │    │   💻 Develop    │    │   🧪 Test       │            │
│  │                 │    │                 │    │                 │            │
│  │  • pnpm install │    │  • pnpm run dev │    │  • pnpm run test│            │
│  │  • pnpm run build│   │  • Hot reload   │    │  • pnpm run lint│            │
│  │  • pnpm run dev │    │  • Live updates │    │  • pnpm run check│           │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│           │                       │                       │                    │
│           └───────────────────────┼───────────────────────┘                    │
│                                   │                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   📦 Build      │    │   🚀 Deploy      │    │   🔄 Maintain   │            │
│  │                 │    │                 │    │                 │            │
│  │  • pnpm run build│   │  • pnpm run start│   │  • pnpm run clean│           │
│  │  • Type check   │    │  • Production   │    │  • Update deps  │            │
│  │  • Lint check   │    │  • Monitoring   │    │  • Bug fixes    │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│           │                       │                       │                    │
│           └───────────────────────┼───────────────────────┘                    │
│                                   │                                           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   📚 Document   │    │   🤝 Contribute │    │   🔧 Debug      │            │
│  │                 │    │                 │    │                 │            │
│  │  • Update README│    │  • Fork repo    │    │  • Check logs   │            │
│  │  • Write guides │    │  • Create PR    │    │  • Use dev tools│            │
│  │  │  • Examples  │    │  • Review code  │    │  • Monitor perf │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 📊 Package Status

| Package                             | Status         | Dependencies          | Size  | Features                             |
| ----------------------------------- | -------------- | --------------------- | ----- | ------------------------------------ |
| **@conflux-devkit/core**            | ✅ Production  | None                  | 15KB  | Types, utilities, normalization      |
| **@conflux-devkit/blockchain**      | ✅ Production  | viem, @xcfx/node      | 45KB  | Wallet, contract, network management |
| **@conflux-devkit/state**           | ✅ Production  | zustand, core         | 35KB  | State management, persistence        |
| **@conflux-devkit/api-server**      | ✅ Production  | express, core         | 25KB  | RESTful APIs, real-time updates      |
| **@conflux-devkit/ui-primitives**   | ✅ Production  | react, state          | 20KB  | React hooks, context providers       |
| **@conflux-devkit/ui-components**   | ✅ Production  | lit, core             | 30KB  | Web Components, framework-agnostic   |
| **@conflux-devkit/devkit-node**     | ✅ Production  | commander, blockchain | 40KB  | CLI tools, node management           |
| **@conflux-devkit/showcase-webapp** | ✅ Production  | express, all packages | 50KB  | Demo application, examples           |
| **@conflux-devkit/dashboard**       | ✅ Build Ready | next.js, mantine      | 200KB | Development dashboard, UI            |

## 🎯 Key Features by Package

### Core Package

- **Type Safety**: Comprehensive TypeScript types
- **Utilities**: Data normalization and conversion
- **Browser Safety**: Safe data types for web environments
- **API Utils**: Response handling and error management

### Blockchain Package

- **Dual Chain**: Both Conflux Core and EVM support
- **Wallet Management**: BIP39/BIP32 compliant wallets
- **Contract Operations**: Complete deployment and interaction
- **Network Management**: 6 network configurations

### State Package

- **Real-time Updates**: Live blockchain data synchronization
- **Persistence**: Automatic state persistence
- **Event System**: Event-driven architecture
- **Service Integration**: Real blockchain service integration

### API Server Package

- **RESTful APIs**: Complete REST API for all operations
- **Real-time Data**: Live blockchain data and updates
- **Security**: Rate limiting, CORS, security headers
- **Integration**: Direct state management integration

### UI Primitives Package

- **React Hooks**: Custom hooks for all functionality
- **Context Providers**: React context for state management
- **Performance**: Optimized with React best practices
- **Type Safety**: Full TypeScript integration

### UI Components Package

- **Web Components**: Framework-agnostic components
- **Accessibility**: WCAG compliant components
- **Theming**: Built-in theming and customization
- **Responsive**: Mobile-first responsive design

### Node Manager Package

- **CLI Tools**: Command-line interface for all operations
- **Workflow Automation**: End-to-end development workflows
- **Node Management**: Complete node lifecycle management
- **Contract Deployment**: Automated deployment and management

### Showcase WebApp Package

- **Live Demos**: Interactive demonstrations of all features
- **Integration Examples**: Real-world usage examples
- **API Testing**: Live API endpoint testing
- **Component Showcase**: All UI components in action

### Dashboard Package

- **Development Interface**: Complete development dashboard
- **Real-time Monitoring**: Live system status monitoring
- **Interactive Tools**: One-click operations and management
- **Modern UI**: Built with Next.js and Mantine

---

**This architecture provides a complete, production-ready blockchain development platform for Conflux Network** 🚀
