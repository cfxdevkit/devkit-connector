# @conflux-devkit/showcase-webapp

> **Demo application showcasing Conflux DevKit capabilities**

[![npm version](https://img.shields.io/npm/v/@conflux-devkit/showcase-webapp)](https://www.npmjs.com/package/@conflux-devkit/showcase-webapp)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🎯 Overview

The showcase webapp is a comprehensive demonstration application that showcases all the capabilities of the Conflux DevKit ecosystem. It provides a live example of how to integrate and use all the packages together in a real-world application.

## ✨ Features

- **📱 React Integration**: Examples of React hooks and context usage
- **🔌 API Integration**: Real-time API server integration
- **💼 Wallet Management**: Complete wallet creation and management flow
- **📦 Contract Operations**: Contract deployment and interaction examples
- **🌐 Network Management**: Multi-network switching and management
- **🖥️ Node Control**: Node management and status monitoring
- **📊 Real-time Updates**: Live data updates and state synchronization

## 📦 Installation

```bash
pnpm add @conflux-devkit/showcase-webapp
# or
npm install @conflux-devkit/showcase-webapp
# or
yarn add @conflux-devkit/showcase-webapp
```

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start the showcase webapp
pnpm run dev

# Open in browser
open http://localhost:3002
```

## 📚 Application Structure

```
showcase-webapp/
├── src/
│   ├── index.html          # Main HTML file
│   ├── index.ts           # Main TypeScript entry
│   ├── server.ts          # Express server
│   └── public/            # Static assets
├── package.json
└── tsconfig.json
```

## 🧪 Demo Sections

### 1. React Components Demo

Demonstrates the usage of `@conflux-devkit/ui-primitives` React hooks and context providers.

**Features:**

- Wallet creation and management
- Contract deployment and interaction
- Network switching
- Real-time state updates

**Code Example:**

```typescript
import { useWallets, useContracts, useNetwork } from '@conflux-devkit/ui-primitives';

function ReactDemo() {
  const { wallets, createWallet } = useWallets();
  const { contracts, deployContract } = useContracts();
  const { current, switchNetwork } = useNetwork();

  const handleCreateWallet = async () => {
    await createWallet();
  };

  const handleDeployContract = async () => {
    await deployContract({
      name: 'DemoContract',
      bytecode: '0x...',
      abi: [...],
      args: []
    });
  };

  return (
    <div>
      <button onClick={handleCreateWallet}>Create Wallet</button>
      <button onClick={handleDeployContract}>Deploy Contract</button>
      <p>Current Network: {current?.name}</p>
    </div>
  );
}
```

### 2. API Endpoints Demo

Demonstrates the usage of `@conflux-devkit/api-server` RESTful API endpoints.

**Features:**

- Wallet management APIs
- Contract deployment APIs
- Node control APIs
- Network management APIs

**JavaScript Example:**

```javascript
// Create wallet via API
const walletResponse = await fetch('/api/wallets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_API_KEY',
  },
  body: JSON.stringify({
    mnemonic:
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  }),
});

const wallet = await walletResponse.json();
console.log('Wallet created:', wallet.data.address);

// Deploy contract via API
const contractResponse = await fetch('/api/contracts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_API_KEY',
  },
  body: JSON.stringify({
    name: 'DemoToken',
    bytecode: '0x608060405234801561001057600080fd5b50...',
    abi: [
      {
        type: 'constructor',
        inputs: [{ name: 'initialSupply', type: 'uint256' }],
        stateMutability: 'nonpayable',
      },
    ],
    args: [1000000],
  }),
});

const contract = await contractResponse.json();
console.log('Contract deployed:', contract.data.address);
```

### 4. State Management Demo

Demonstrates the usage of `@conflux-devkit/state` Zustand state management.

**Features:**

- Real-time state updates
- Persistent storage
- Event-driven architecture
- Cross-component communication

**TypeScript Example:**

```typescript
import { useAppStore } from '@conflux-devkit/state';

function StateDemo() {
  const {
    isConnected,
    wallets,
    contracts,
    node,
    network,
    connect,
    createWallet,
    deployContract,
    startNode
  } = useAppStore();

  const handleConnect = async () => {
    await connect({ chainId: 2029 });
  };

  const handleCreateWallet = async () => {
    await createWallet();
  };

  const handleDeployContract = async () => {
    await deployContract({
      name: 'StateDemoContract',
      bytecode: '0x...',
      abi: [...],
      args: []
    });
  };

  const handleStartNode = async () => {
    await startNode();
  };

  return (
    <div>
      <h3>State Management Demo</h3>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      <p>Wallets: {wallets.wallets.length}</p>
      <p>Contracts: {contracts.deployed.length}</p>
      <p>Node Running: {node.isRunning ? 'Yes' : 'No'}</p>
      <p>Current Network: {network.current?.name || 'None'}</p>

      <button onClick={handleConnect}>Connect</button>
      <button onClick={handleCreateWallet}>Create Wallet</button>
      <button onClick={handleDeployContract}>Deploy Contract</button>
      <button onClick={handleStartNode}>Start Node</button>
    </div>
  );
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Server configuration
PORT=3002
HOST=localhost
NODE_ENV=development

# API server configuration
API_SERVER_URL=http://localhost:3001
API_KEY=your-api-key

# Blockchain configuration
CONFLUX_RPC_URL=https://main.confluxrpc.com
CONFLUX_EVM_RPC_URL=https://main.confluxrpc.com
```

### Server Configuration

```typescript
// server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
  })
);
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// API proxy
app.use('/api', async (req, res) => {
  try {
    const apiUrl = `http://localhost:3001${req.path}`;
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'API request failed' });
  }
});

// Serve static files
app.use(express.static('public'));

// Start server
app.listen(3002, () => {
  console.log('Showcase WebApp running on http://localhost:3002');
});
```

## 🚀 Development

### Available Scripts

```bash
# Development
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run start        # Start production server

# Linting
pnpm run lint         # Lint code
pnpm run format       # Format code

# Type checking
pnpm run type-check   # Check TypeScript types
```

### Development Workflow

1. **Start API Server**: Make sure the API server is running on port 3001
2. **Start Showcase**: Run `pnpm run dev` to start the showcase webapp
3. **Open Browser**: Navigate to `http://localhost:3002`
4. **Explore Demos**: Try out all the different demo sections
5. **Check Console**: Monitor browser console for any errors or logs

### Adding New Demos

1. **Create Component**: Add new demo component in the appropriate section
2. **Update HTML**: Add the component to the main HTML file
3. **Add Styling**: Style the component as needed
4. **Test Integration**: Ensure it works with the API server
5. **Update Documentation**: Update this README with the new demo

## 🔗 Dependencies

- **express**: Web server framework
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting
- **@conflux-devkit/core**: Core types and utilities
- **@conflux-devkit/blockchain**: Blockchain interactions
- **@conflux-devkit/state**: State management
- **@conflux-devkit/api-server**: API server integration
- **@conflux-devkit/ui-primitives**: React hooks and context

## 📊 Bundle Size

- **Minified**: ~50KB
- **Gzipped**: ~18KB
- **Tree-shakeable**: Import only what you need

## 🚨 Troubleshooting

### Common Issues

1. **API Server Not Running**: Make sure the API server is running on port 3001
2. **CORS Errors**: Check CORS configuration in both API server and showcase
3. **Network Errors**: Verify network configuration and RPC URLs
4. **Component Not Loading**: Check browser console for JavaScript errors

### Debug Mode

```bash
# Enable debug logging
DEBUG=conflux-devkit:* pnpm run dev

# Check API server logs
curl http://localhost:3001/api/health

# Check showcase server logs
curl http://localhost:3002/health
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Part of the Conflux DevKit ecosystem** 🚀
