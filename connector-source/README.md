# Conflux Dual Wallet System

A production-ready wallet delegation solution supporting both Conflux eSpace (EVM-compatible) and Core chains with two operation modes: server-managed wallets and user-delegated wallets.

## 🚀 Features

- **Dual-Chain Support**: Seamless operation across Conflux eSpace and Core chains
- **Dual-Mode Architecture**: Server-managed and user-delegated wallet options
- **Auto-Approval Engine**: Rule-based automatic approval for low-risk operations
- **Real-Time Monitoring**: WebSocket-based event streaming and analytics
- **Security Framework**: Multi-layer security with audit trails and fraud detection
- **Wagmi Integration**: Seamless integration with existing Web3 tooling
- **Production Ready**: Enterprise-grade security, monitoring, and scalability

## 📁 Repository Structure

```
conflux-dual-wallet/
├── apps/                          # Applications
│   ├── demo-app/                  # Demo application
│   ├── admin-dashboard/           # Management interface
│   └── docs/                      # Documentation site
├── packages/                      # Shared packages
│   ├── core/                      # Core delegation engine
│   ├── server/                    # Server-side services
│   ├── client/                    # Client SDK and React hooks
│   ├── wagmi-connector/           # Wagmi integration
│   ├── database/                  # Database schemas and migrations
│   ├── types/                     # Shared TypeScript types
│   ├── utils/                     # Shared utilities
│   └── config/                    # Configuration management
├── tools/                         # Development tools
│   ├── cli/                       # CLI tools
│   └── codegen/                   # Code generation tools
├── contracts/                     # Smart contracts
│   ├── test-contracts/            # Test contracts
│   └── deployment/                # Deployment scripts
├── infrastructure/                # Infrastructure as code
│   ├── docker/                    # Docker configurations
│   ├── kubernetes/                # K8s manifests
│   └── terraform/                 # Terraform configurations
└── docs/                          # Documentation
    ├── api/                       # API documentation
    ├── guides/                    # User guides
    └── architecture/              # Architecture docs
```

## 🛠 Quick Start

### Prerequisites

- Node.js 18+ LTS
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 6+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/conflux-dual-wallet.git
   cd conflux-dual-wallet
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development environment**
   ```bash
   # Start database and Redis
   pnpm docker:up

   # Run database migrations
   pnpm db:migrate

   # Start development server
   pnpm dev
   ```

### Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Type checking
pnpm type-check

# Clean build artifacts
pnpm clean

# Database operations
pnpm db:migrate    # Run migrations
pnpm db:seed       # Seed database
pnpm db:reset      # Reset database

# Docker operations
pnpm docker:build  # Build Docker images
pnpm docker:up     # Start services
pnpm docker:down   # Stop services
pnpm docker:logs   # View logs

# Kubernetes operations
pnpm k8s:deploy    # Deploy to Kubernetes
pnpm k8s:delete    # Delete from Kubernetes

# Contract operations
pnpm contracts:compile  # Compile contracts
pnpm contracts:deploy   # Deploy contracts
pnpm contracts:test     # Test contracts

# Code generation
pnpm codegen       # Generate code

# CLI tools
pnpm cli           # Run CLI tools
```

## 🏗 Architecture

### Core Packages

- **`@conflux-wallet/types`**: Shared TypeScript type definitions
- **`@conflux-wallet/core`**: Core delegation engine and business logic
- **`@conflux-wallet/database`**: Database schemas, migrations, and ORM
- **`@conflux-wallet/server`**: Backend services and API layer
- **`@conflux-wallet/client`**: Client SDK and React hooks
- **`@conflux-wallet/wagmi-connector`**: Wagmi integration and code generation

### Applications

- **`demo-app`**: Demonstration application showcasing all features
- **`admin-dashboard`**: Management interface for monitoring and configuration
- **`docs`**: Documentation website

## 🔧 Configuration

### Environment Variables

See `env.example` for all available configuration options.

### Database Configuration

The system uses PostgreSQL with the following key tables:
- `users`: User authentication and preferences
- `server_wallets`: Encrypted mnemonic storage
- `delegation_sessions`: User delegation management
- `wallet_operations`: Complete operation audit trail
- `auto_approval_rules`: Rule-based approval system
- `security_events`: Security monitoring and alerts

### Chain Configuration

- **eSpace**: EVM-compatible chain using Viem
- **Core**: Native Conflux chain using js-conflux-sdk

## 🚀 Deployment

### Docker Deployment

```bash
# Build and start with Docker Compose
pnpm docker:build
pnpm docker:up
```

### Kubernetes Deployment

```bash
# Deploy to Kubernetes
pnpm k8s:deploy
```

### Production Deployment

1. Set up production environment variables
2. Configure database and Redis
3. Build and deploy using Docker or Kubernetes
4. Set up monitoring and logging
5. Configure SSL certificates and domain

## 📚 Documentation

- [Technical Architecture](./TECHNICAL_ARCHITECTURE.md)
- [Implementation Report](./IMPLEMENTATION_REPORT.md)
- [API Documentation](./docs/api/)
- [User Guides](./docs/guides/)
- [Architecture Docs](./docs/architecture/)

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test --filter @conflux-wallet/core

# Run tests with coverage
pnpm test --coverage
```

### Test Contracts

The repository includes comprehensive test contracts for both eSpace and Core chains:

- **ConfluxWalletTestSuite**: Main test contract with various operation types
- **ConfluxTestToken**: ERC20 token for testing
- **ConfluxTestNFT**: ERC721 NFT for testing

## 🔒 Security

### Security Features

- **Encryption**: AES-256-CBC for mnemonic storage
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control
- **Rate Limiting**: Per-user and per-IP limits
- **Audit Trails**: Complete operation history
- **Fraud Detection**: Real-time anomaly detection

### Security Best Practices

1. Use strong encryption keys
2. Enable rate limiting
3. Monitor security events
4. Regular security audits
5. Keep dependencies updated

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the code style guide
- Ensure all checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/conflux-dual-wallet/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/conflux-dual-wallet/discussions)
- **Discord**: [Join our Discord](https://discord.gg/conflux-wallet)

## 🗺 Roadmap

- [ ] Phase 1: Foundation & Core Infrastructure (Weeks 1-4)
- [ ] Phase 2: Wallet Management Implementation (Weeks 5-8)
- [ ] Phase 3: Advanced Features & Client Integration (Weeks 9-12)
- [ ] Phase 4: Security & Testing (Weeks 13-16)
- [ ] Phase 5: Documentation & Community (Weeks 17-20)
- [ ] Phase 6: Production Deployment (Weeks 21-24)

## 🙏 Acknowledgments

- Conflux Foundation for ecosystem support
- Wagmi team for Web3 integration
- Viem team for EVM utilities
- OpenZeppelin for security standards

---

**Built with ❤️ for the Conflux ecosystem**
