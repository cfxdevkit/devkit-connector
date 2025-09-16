# Conflux Dual Wallet System - Project Structure

## 🎯 Overview

This document provides a complete overview of the Turbo-based monorepo structure for the Conflux Dual Wallet System, a production-ready wallet delegation solution supporting both Conflux eSpace and Core chains.

## 📁 Repository Structure

```
conflux-dual-wallet/
├── 📱 apps/                          # Applications
│   ├── demo-app/                     # Demo application (Next.js 14)
│   ├── admin-dashboard/              # Management interface (Next.js 14)
│   └── docs/                         # Documentation site (Next.js 14)
├── 📦 packages/                      # Shared packages
│   ├── types/                        # Shared TypeScript types
│   ├── core/                         # Core delegation engine
│   ├── database/                     # Database schemas and migrations
│   ├── server/                       # Server-side services
│   ├── client/                       # Client SDK and React hooks
│   ├── wagmi-connector/              # Wagmi integration
│   ├── utils/                        # Shared utilities
│   ├── config/                       # Configuration management
│   └── testing/                      # Testing utilities
├── 🛠️ tools/                         # Development tools
│   ├── cli/                          # CLI tools
│   └── codegen/                      # Code generation tools
├── 📄 contracts/                     # Smart contracts
│   ├── test-contracts/               # Test contracts
│   └── deployment/                   # Deployment scripts
├── 🏗️ infrastructure/                # Infrastructure as code
│   ├── kubernetes/                   # K8s manifests
│   └── terraform/                    # Terraform configurations
├── 📚 docs/                          # Documentation
│   ├── api/                          # API documentation
│   ├── guides/                       # User guides
│   └── architecture/                 # Architecture docs
└── 🔧 scripts/                       # Build and deployment scripts
```

## 🏗️ Architecture Components

### Core Packages

#### 1. `@conflux-wallet/types` 
- **Purpose**: Shared TypeScript type definitions
- **Dependencies**: None
- **Exports**: All type definitions for wallet, delegation, chains, API, etc.

#### 2. `@conflux-wallet/core`
- **Purpose**: Core delegation engine and business logic
- **Dependencies**: `types`, `utils`, `config`
- **Exports**: Delegation engine, rule engine, address utilities, validation

#### 3. `@conflux-wallet/database`
- **Purpose**: Database schemas, migrations, and ORM
- **Dependencies**: `types`
- **Exports**: Prisma schema, database models, migration scripts

#### 4. `@conflux-wallet/server`
- **Purpose**: Backend services and API layer
- **Dependencies**: `core`, `database`, `types`, `utils`
- **Exports**: API routes, services, middleware, chain adapters

#### 5. `@conflux-wallet/client`
- **Purpose**: Client SDK and React hooks
- **Dependencies**: `core`, `types`, `utils`, `wagmi-connector`
- **Exports**: React hooks, components, providers, utilities

#### 6. `@conflux-wallet/wagmi-connector`
- **Purpose**: Wagmi integration and code generation
- **Dependencies**: `core`, `types`, `client`
- **Exports**: Custom Wagmi connector, generated hooks, chain configs

#### 7. `@conflux-wallet/utils`
- **Purpose**: Shared utilities
- **Dependencies**: `types`
- **Exports**: Encryption, validation, formatting, constants, errors

#### 8. `@conflux-wallet/config`
- **Purpose**: Configuration management
- **Dependencies**: `types`
- **Exports**: Config loader, validation, defaults

#### 9. `@conflux-wallet/testing`
- **Purpose**: Testing utilities
- **Dependencies**: `core`, `types`
- **Exports**: Test helpers, mocks, fixtures

### Applications

#### 1. `demo-app`
- **Tech Stack**: Next.js 14, React 18, Tailwind CSS
- **Purpose**: Demonstration application showcasing all features
- **Dependencies**: `client`, `wagmi-connector`, `types`

#### 2. `admin-dashboard`
- **Tech Stack**: Next.js 14, React 18, Tailwind CSS
- **Purpose**: Management interface for monitoring and configuration
- **Dependencies**: `client`, `server`, `types`

#### 3. `docs`
- **Tech Stack**: Next.js 14, MDX, Tailwind CSS
- **Purpose**: Documentation website
- **Dependencies**: `types`

### Tools

#### 1. `cli`
- **Purpose**: Command-line interface tools
- **Features**: Wallet management, database operations, contract deployment
- **Dependencies**: `core`, `database`, `types`

#### 2. `codegen`
- **Purpose**: Code generation tools
- **Features**: Wagmi code generation, contract ABI generation
- **Dependencies**: `types`, `wagmi-connector`

## 🐳 Docker Configuration

### Multi-Stage Build
- **Base Stage**: Node.js 18 Alpine with pnpm
- **Build Stage**: Install dependencies and build packages
- **Production Stage**: Optimized production image

### Docker Compose
- **Development**: `docker-compose.dev.yml`
- **Production**: `docker-compose.yml`
- **Services**: PostgreSQL, Redis, Application

### Services
- **PostgreSQL**: Database with health checks
- **Redis**: Caching layer with health checks
- **Application**: Main application container

## ☸️ Kubernetes Configuration

### Manifests
- **Namespace**: `conflux-wallet`
- **ConfigMap**: Application configuration
- **Secret**: Sensitive data (encrypted)
- **Deployment**: Application deployment with 3 replicas
- **Service**: LoadBalancer service

### Features
- **Health Checks**: Liveness and readiness probes
- **Resource Limits**: CPU and memory constraints
- **Auto-scaling**: Horizontal Pod Autoscaling ready
- **Security**: Non-root user, security contexts

## 🔧 Development Workflow

### Prerequisites
- Node.js 18+ LTS
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 6+

### Quick Start
```bash
# Clone and setup
git clone <repository>
cd conflux-dual-wallet
pnpm install

# Start development environment
pnpm dev
```

### Available Scripts
```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build all packages
pnpm test             # Run tests
pnpm lint             # Run linter
pnpm type-check       # Type checking

# Database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database
pnpm db:reset         # Reset database

# Docker
pnpm docker:build     # Build Docker images
pnpm docker:up        # Start services
pnpm docker:down      # Stop services
pnpm docker:logs      # View logs

# Kubernetes
pnpm k8s:deploy       # Deploy to Kubernetes
pnpm k8s:delete       # Delete from Kubernetes

# Contracts
pnpm contracts:compile # Compile contracts
pnpm contracts:deploy  # Deploy contracts
pnpm contracts:test    # Test contracts

# Tools
pnpm codegen          # Generate code
pnpm cli              # Run CLI tools
```

## 🗄️ Database Architecture

### PostgreSQL Schema
- **Users**: Authentication and preferences
- **Server Wallets**: Encrypted mnemonic storage
- **Delegation Sessions**: User delegation management
- **Wallet Operations**: Complete operation audit trail
- **Auto Approval Rules**: Rule-based approval system
- **Security Events**: Security monitoring and alerts

### Features
- **Encryption**: AES-256-CBC for sensitive data
- **Indexing**: Optimized for performance
- **Partitioning**: Monthly partitions for large tables
- **Audit Trails**: Complete operation history

## 🔒 Security Features

### Multi-Layer Security
1. **Network Security**: VPC, security groups, WAF
2. **Application Security**: JWT, rate limiting, input validation
3. **Data Security**: Encryption at rest and in transit
4. **Infrastructure Security**: Container scanning, vulnerability management

### Compliance
- **Audit Trails**: Complete operation logging
- **Data Retention**: Configurable retention policies
- **Privacy**: GDPR compliance features

## 📊 Monitoring & Observability

### Metrics
- **Application Metrics**: Response times, error rates
- **Business Metrics**: Transaction volumes, user activity
- **Infrastructure Metrics**: CPU, memory, disk usage

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Log Aggregation**: Centralized log collection
- **Log Analysis**: Real-time log analysis and alerting

## 🚀 Deployment Strategy

### Environments
1. **Development**: Local development environment
2. **Staging**: Pre-production testing environment
3. **Production**: Live production environment

### Deployment Process
1. **Code Review**: Pull request review process
2. **Testing**: Automated testing in CI/CD
3. **Staging**: Deploy to staging for validation
4. **Production**: Blue-green deployment to production

## 📈 Scalability Considerations

### Horizontal Scaling
- **Stateless Services**: All services are stateless
- **Load Balancing**: Multiple instances behind load balancers
- **Database Scaling**: Read replicas and connection pooling

### Performance Optimization
- **Caching Strategy**: Multi-level caching
- **CDN**: Static asset delivery
- **Database Optimization**: Query optimization and indexing

## 🧪 Testing Strategy

### Test Types
- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **End-to-End Tests**: Complete workflow testing
- **Security Tests**: Vulnerability and penetration testing

### Test Contracts
- **ConfluxWalletTestSuite**: Comprehensive test contract
- **ConfluxTestToken**: ERC20 token for testing
- **ConfluxTestNFT**: ERC721 NFT for testing

## 📚 Documentation

### Structure
- **API Documentation**: Complete API reference
- **User Guides**: Step-by-step guides
- **Architecture Docs**: Technical architecture details
- **Examples**: Implementation examples

### Tools
- **TypeScript**: Type-safe documentation
- **JSDoc**: Inline code documentation
- **MDX**: Rich documentation format

## 🤝 Contributing

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the code style guide
- Ensure all checks pass

### Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/conflux-dual-wallet/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/conflux-dual-wallet/discussions)
- **Discord**: [Join our Discord](https://discord.gg/conflux-wallet)

---

**This project structure provides a solid foundation for building a scalable, maintainable, and secure Conflux Dual Wallet System. The modular approach and comprehensive tooling ensure efficient development and deployment processes.**
