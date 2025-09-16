# Conflux Dual Wallet System - Technical Architecture

## Monorepo Structure Overview

This document defines the technical architecture for the Conflux Dual Wallet System using Turborepo for optimal development experience and build performance.

## Repository Structure

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
│   ├── config/                    # Configuration management
│   └── testing/                   # Testing utilities
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
├── docs/                          # Documentation
│   ├── api/                       # API documentation
│   ├── guides/                    # User guides
│   └── architecture/              # Architecture docs
└── scripts/                       # Build and deployment scripts
```

## Package Dependencies

### Core Dependencies
- **TypeScript**: 5.2+ for type safety
- **Turborepo**: 1.10+ for monorepo management
- **Node.js**: 18+ LTS
- **pnpm**: 8+ for package management

### Blockchain Dependencies
- **viem**: 1.18+ for eSpace chain
- **js-conflux-sdk**: 2.2+ for Core chain
- **wagmi**: 1.4+ for Web3 integration
- **ethers**: 6.8+ for additional utilities

### Database & Infrastructure
- **PostgreSQL**: 14+ for primary database
- **Redis**: 6+ for caching
- **Docker**: 20+ for containerization
- **Kubernetes**: 1.25+ for orchestration

## Package Architecture

### 1. Core Package (`packages/core`)
**Purpose**: Core delegation engine and shared business logic

**Dependencies**: `types`, `utils`, `config`
**Exports**: Core services, delegation engine, rule engine

**Key Files**:
- `src/delegation-engine.ts` - Main delegation logic
- `src/rule-engine.ts` - Auto-approval rules
- `src/address-utils.ts` - Address conversion utilities
- `src/validation.ts` - Input validation

### 2. Server Package (`packages/server`)
**Purpose**: Backend services and API layer

**Dependencies**: `core`, `database`, `types`, `utils`
**Exports**: API routes, services, middleware

**Key Files**:
- `src/services/` - Business logic services
- `src/api/` - API route handlers
- `src/middleware/` - Express middleware
- `src/adapters/` - Chain adapters

### 3. Client Package (`packages/client`)
**Purpose**: Client SDK and React hooks

**Dependencies**: `core`, `types`, `utils`, `wagmi-connector`
**Exports**: React hooks, components, utilities

**Key Files**:
- `src/hooks/` - React hooks
- `src/components/` - UI components
- `src/providers/` - Context providers
- `src/utils/` - Client utilities

### 4. Database Package (`packages/database`)
**Purpose**: Database schemas, migrations, and ORM

**Dependencies**: `types`
**Exports**: Database models, migrations, queries

**Key Files**:
- `src/schema/` - Database schemas
- `src/migrations/` - Migration files
- `src/models/` - ORM models
- `src/queries/` - Query builders

### 5. Types Package (`packages/types`)
**Purpose**: Shared TypeScript type definitions

**Dependencies**: None
**Exports**: All type definitions

**Key Files**:
- `src/wallet.ts` - Wallet types
- `src/delegation.ts` - Delegation types
- `src/chains.ts` - Chain types
- `src/api.ts` - API types

### 6. Wagmi Connector Package (`packages/wagmi-connector`)
**Purpose**: Wagmi integration and code generation

**Dependencies**: `core`, `types`, `client`
**Exports**: Wagmi connector, generated hooks

**Key Files**:
- `src/connector.ts` - Custom Wagmi connector
- `src/codegen/` - Code generation
- `src/hooks/` - Generated hooks

## Application Architecture

### 1. Demo App (`apps/demo-app`)
**Purpose**: Demonstration application showcasing all features

**Tech Stack**: Next.js 14, React 18, Tailwind CSS
**Dependencies**: `client`, `wagmi-connector`, `types`

### 2. Admin Dashboard (`apps/admin-dashboard`)
**Purpose**: Management interface for monitoring and configuration

**Tech Stack**: Next.js 14, React 18, Tailwind CSS
**Dependencies**: `client`, `server`, `types`

### 3. Docs Site (`apps/docs`)
**Purpose**: Documentation website

**Tech Stack**: Next.js 14, MDX, Tailwind CSS
**Dependencies**: `types`

## Infrastructure Architecture

### Docker Configuration
- **Multi-stage builds** for optimized images
- **Development containers** for consistent environments
- **Production images** with security hardening

### Kubernetes Deployment
- **Microservices architecture** with separate deployments
- **Horizontal Pod Autoscaling** for scalability
- **Service mesh** for inter-service communication

### Database Architecture
- **Primary database**: PostgreSQL with read replicas
- **Caching layer**: Redis cluster
- **Backup strategy**: Automated daily backups

## Development Workflow

### Local Development
1. **Setup**: `pnpm install` installs all dependencies
2. **Development**: `pnpm dev` starts all services
3. **Testing**: `pnpm test` runs all test suites
4. **Building**: `pnpm build` builds all packages

### CI/CD Pipeline
1. **Linting**: ESLint and Prettier checks
2. **Type Checking**: TypeScript compilation
3. **Testing**: Unit and integration tests
4. **Building**: Package builds and Docker images
5. **Deployment**: Automated deployment to environments

## Security Architecture

### Multi-Layer Security
1. **Network Security**: VPC, security groups, WAF
2. **Application Security**: JWT, rate limiting, input validation
3. **Data Security**: Encryption at rest and in transit
4. **Infrastructure Security**: Container scanning, vulnerability management

### Compliance
- **Audit Trails**: Complete operation logging
- **Data Retention**: Configurable retention policies
- **Privacy**: GDPR compliance features

## Monitoring & Observability

### Metrics
- **Application Metrics**: Response times, error rates
- **Business Metrics**: Transaction volumes, user activity
- **Infrastructure Metrics**: CPU, memory, disk usage

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Log Aggregation**: Centralized log collection
- **Log Analysis**: Real-time log analysis and alerting

### Alerting
- **Real-time Alerts**: Critical error notifications
- **Performance Alerts**: SLA breach notifications
- **Security Alerts**: Suspicious activity detection

## Scalability Considerations

### Horizontal Scaling
- **Stateless Services**: All services are stateless
- **Load Balancing**: Multiple instances behind load balancers
- **Database Scaling**: Read replicas and connection pooling

### Performance Optimization
- **Caching Strategy**: Multi-level caching
- **CDN**: Static asset delivery
- **Database Optimization**: Query optimization and indexing

## Deployment Strategy

### Environments
1. **Development**: Local development environment
2. **Staging**: Pre-production testing environment
3. **Production**: Live production environment

### Deployment Process
1. **Code Review**: Pull request review process
2. **Testing**: Automated testing in CI/CD
3. **Staging**: Deploy to staging for validation
4. **Production**: Blue-green deployment to production

This technical architecture provides a solid foundation for building a scalable, maintainable, and secure Conflux Dual Wallet System.
