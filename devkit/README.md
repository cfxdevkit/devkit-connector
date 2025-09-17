# Conflux DevKit

A professional monorepo for Conflux blockchain development, built with modern tools and best practices.

## 🏗️ Architecture

The DevKit is organized as a professional monorepo with clear separation of concerns:

```
conflux-devkit/
├── packages/
│   ├── devkit-node/          # Conflux node management (@conflux-devkit/node)
│   ├── server/               # Backend services (@conflux-devkit/server)
│   ├── dashboard/            # React dashboard with Mantine UI (@conflux-devkit/dashboard)
│   └── utility/              # Shared utilities and types (@conflux-devkit/utility)
├── apps/                     # Example applications
├── shared/                   # Shared configuration and contracts
└── scripts/                  # Build and deployment scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- pnpm 8+
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd conflux-devkit

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Start the full development stack
pnpm run dev
```

## 📦 Packages

### @conflux-devkit/node

Local Conflux node management for development and testing.

**Features:**

- Easy setup and configuration
- Dual space support (Core and EVM/eSpace)
- Ephemeral execution for testing
- Contract deployment tools
- Wallet management (mnemonic and private key modes)
- CLI interface
- TypeScript support
- Silent mode for CI/CD

**Usage:**

```bash
# Start a local node
pnpm run start:devkit-node

# Or use the CLI directly
pnpm --filter @conflux-devkit/node cli start
```

### @conflux-devkit/server

Backend services and API endpoints for blockchain development.

**Features:**

- RESTful API endpoints
- Wallet management
- Transaction handling
- Contract interaction
- Rate limiting and security
- CORS support
- JWT authentication

**Usage:**

```bash
# Start the server
pnpm run start:server

# The server will be available at http://localhost:3001
```

### @conflux-devkit/dashboard

Modern React dashboard with Mantine UI components.

**Features:**

- Next.js 15 with App Router
- Mantine UI component library
- Wallet connection (MetaMask, WalletConnect)
- Real-time blockchain data
- Responsive design
- TypeScript support

**Usage:**

```bash
# Start the dashboard
pnpm run start:dashboard

# The dashboard will be available at http://localhost:3000
```

### @conflux-devkit/utility

Shared utilities, types, and constants used across packages.

**Features:**

- Common TypeScript types
- Wallet utilities
- Network configuration
- Validation functions
- Formatting helpers
- Constants and enums

**Usage:**

```typescript
import {
  WalletInfo,
  formatAddress,
  isValidAddress,
} from '@conflux-devkit/utility';
```

## 🛠️ Development

### Available Scripts

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm run build

# Start full development stack
pnpm run dev

# Start individual services
pnpm run start:devkit-node    # Start Conflux node
pnpm run start:server         # Start backend server
pnpm run start:dashboard      # Start dashboard

# Linting and formatting
pnpm run lint                 # Lint all packages
pnpm run format              # Format all packages

# Clean build artifacts
pnpm run clean               # Clean all packages
```

### Working with Packages

```bash
# Add a dependency to a specific package
pnpm add <package> --filter @conflux-devkit/server

# Run a command in a specific package
pnpm run build --filter @conflux-devkit/dashboard

# Run a command in all packages
pnpm run build --recursive
```

### VSCode Integration

The project includes a comprehensive VSCode workspace configuration:

1. Open `conflux-devkit.code-workspace` in VSCode
2. Install recommended extensions
3. Use the integrated tasks and launch configurations

**Recommended Extensions:**

- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens

## 🔧 Configuration

### Environment Variables

Create `.env.local` files in each package as needed:

**Server (.env.local):**

```env
ESPACE_RPC_URL=http://localhost:8545
JWT_SECRET=your-secret-key
PORT=3001
```

**Dashboard (.env.local):**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_RPC_URL=http://localhost:12537
```

### Network Configuration

The DevKit supports multiple Conflux networks:

- **Local Development**: `http://localhost:12537` (Chain ID: 2030)
- **Testnet**: `https://test.confluxrpc.com` (Chain ID: 1)
- **Mainnet**: `https://main.confluxrpc.com` (Chain ID: 1029)

## 🐳 Docker Support

Each package includes Docker support for easy deployment:

```bash
# Build all Docker images
docker-compose build

# Start all services
docker-compose up

# Start specific service
docker-compose up devkit-node
```

## 📚 API Documentation

### Server Endpoints

- `GET /api/health` - Health check
- `POST /api/wallet/create` - Create new wallet
- `GET /api/wallet/:address` - Get wallet info
- `POST /api/transaction/send` - Send transaction
- `GET /api/contract/:address` - Get contract info

### Frontend Components

- `WalletProvider` - Wallet connection context
- `NetworkSelector` - Network switching component
- `TransactionForm` - Transaction creation form
- `ContractInterface` - Contract interaction component

## 🧪 Testing

```bash
# Run tests for all packages
pnpm run test

# Run tests for specific package
pnpm run test --filter @conflux-devkit/utility

# Run tests in watch mode
pnpm run test:watch
```

## 📦 Deployment

### Production Build

```bash
# Build all packages for production
pnpm run build

# Start production services
pnpm run start:server
pnpm run start:dashboard
```

### Docker Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commit messages
- Update documentation for new features
- Ensure all packages build successfully

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](https://docs.conflux-devkit.com)
- 🐛 [Issue Tracker](https://github.com/conflux-devkit/issues)
- 💬 [Discord Community](https://discord.gg/conflux-devkit)
- 📧 [Email Support](mailto:support@conflux-devkit.com)

## 🙏 Acknowledgments

- [Conflux Network](https://confluxnetwork.org/) for the blockchain infrastructure
- [Mantine](https://mantine.dev/) for the UI component library
- [Next.js](https://nextjs.org/) for the React framework
- [pnpm](https://pnpm.io/) for the package manager
