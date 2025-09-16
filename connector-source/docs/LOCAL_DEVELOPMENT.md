# Local Development with @xcfx/node

This guide explains how to set up and use the local Conflux development environment using `@xcfx/node` for both Conflux eSpace and Core networks.

## 🚀 Quick Start

### Option 1: Complete Setup (Recommended)
```bash
# Set up everything at once
pnpm run dev:setup
```

### Option 2: Step by Step
```bash
# 1. Install dependencies
pnpm install

# 2. Start local Conflux node
pnpm run node:start

# 3. Deploy contracts
pnpm run contracts:deploy:local

# 4. Run tests
pnpm run contracts:test:local
```

## 🔧 Available Commands

### Node Management
```bash
# Start local Conflux node
pnpm run node:start

# Stop local Conflux node
pnpm run node:stop

# Start development mode (with auto-reload)
pnpm run node:dev

# Check node status
pnpm run node:status

# Reset node data
pnpm run node:reset
```

### Contract Operations
```bash
# Deploy contracts to local node
pnpm run contracts:deploy:local

# Test contracts against local node
pnpm run contracts:test:local

# Deploy to eSpace only
cd contracts/espace && pnpm run deploy:local

# Deploy to Core only
cd contracts/core && pnpm run deploy:local
```

### Development Environment
```bash
# Complete setup
pnpm run dev:setup

# Start development environment
pnpm run dev:start

# Stop development environment
pnpm run dev:stop

# Reset development environment
pnpm run dev:reset

# Deploy contracts
pnpm run dev:deploy

# Run tests
pnpm run dev:test
```

## 🌐 Network Configuration

### Local Conflux Node
- **Core RPC**: `http://127.0.0.1:12537`
- **EVM RPC**: `http://127.0.0.1:8545`
- **Core Chain ID**: `1111`
- **EVM Chain ID**: `2222`

### Test Accounts
The local node comes with pre-funded test accounts:
- Account 1: `0x...` (Private key: `0x0123456789abcdef...`)
- Account 2: `0x...` (Private key: `0x1234567890abcdef...`)

## 📁 Project Structure

```
tools/node-manager/          # @xcfx/node integration
├── src/
│   ├── NodeManager.ts      # Node lifecycle management
│   ├── ContractDeployer.ts # Contract deployment
│   ├── TestRunner.ts       # Test execution
│   └── index.ts           # CLI interface
├── package.json
└── tsconfig.json

contracts/
├── espace/                 # eSpace contracts
│   ├── hardhat.config.ts  # Includes localEspace network
│   └── package.json       # Includes local deployment scripts
└── core/                  # Core contracts
    ├── hardhat.config.ts  # Includes localCore network
    └── package.json       # Includes local deployment scripts

scripts/
└── dev-environment.sh     # Development environment setup
```

## 🐳 Docker Development

### Using Docker Compose
```bash
# Start complete development environment
docker-compose -f docker-compose.dev-local.yml up

# Start specific services
docker-compose -f docker-compose.dev-local.yml up conflux-node

# Stop all services
docker-compose -f docker-compose.dev-local.yml down
```

### Services
- **conflux-node**: Local Conflux node with both Core and EVM support
- **contract-deployer**: Automatically deploys contracts
- **test-runner**: Runs contract tests
- **dev-dashboard**: Development dashboard at http://localhost:3000

## 🔍 Troubleshooting

### Common Issues

#### Node Won't Start
```bash
# Check if ports are available
lsof -i :12537
lsof -i :8545

# Reset node data
pnpm run node:reset
```

#### Contract Deployment Fails
```bash
# Check node status
pnpm run node:status

# Verify network connectivity
curl http://127.0.0.1:12537
curl http://127.0.0.1:8545
```

#### Tests Fail
```bash
# Check if contracts are deployed
ls deployments/

# Re-deploy contracts
pnpm run contracts:deploy:local
```

### Logs and Debugging

#### Node Logs
```bash
# View node logs
cd tools/node-manager
pnpm run dev  # Shows real-time logs
```

#### Contract Logs
```bash
# View deployment logs
cd contracts/espace
pnpm run deploy:local

# View test logs
pnpm run test:local
```

## 🚀 Advanced Usage

### Custom Configuration

#### Node Configuration
Create a custom config file:
```toml
# config.toml
[network]
port = 12537
eth_port = 8545

[dev]
block_interval_ms = 1000
```

Use with:
```bash
pnpm run node:start -- --config config.toml
```

#### Contract Configuration
Update Hardhat configs for custom networks:
```typescript
// contracts/espace/hardhat.config.ts
networks: {
  customEspace: {
    url: "http://127.0.0.1:8545",
    chainId: 2222,
    accounts: ["0x..."],
  }
}
```

### Integration with IDEs

#### VS Code
Add to `.vscode/settings.json`:
```json
{
  "hardhat.solidity.defaultCompiler": "0.8.19",
  "hardhat.solidity.remappings": {
    "@openzeppelin/": "node_modules/@openzeppelin/"
  }
}
```

#### Hardhat VS Code Extension
Install the Hardhat VS Code extension for:
- Solidity syntax highlighting
- Contract compilation
- Test debugging
- Deployment verification

## 📊 Monitoring and Metrics

### Node Status
```bash
# Get detailed node status
pnpm run node:status
```

### Contract Addresses
Deployed contract addresses are saved to:
- `deployments/local-deployments.json`

### Test Results
Test results are saved to:
- `test-results/test-report.json`

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/local-test.yml
name: Local Conflux Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm run dev:setup
      - run: pnpm run contracts:test:local
```

## 🎯 Best Practices

1. **Always use the development script** for consistent setup
2. **Reset the environment** when switching between branches
3. **Check node status** before running tests
4. **Use separate accounts** for different test scenarios
5. **Monitor gas usage** during development
6. **Keep contracts simple** for local testing
7. **Use proper error handling** in deployment scripts

## 📚 Additional Resources

- [@xcfx/node Documentation](https://www.npmjs.com/package/@xcfx/node)
- [Conflux Documentation](https://docs.confluxnetwork.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [js-conflux-sdk Documentation](https://github.com/Conflux-Chain/js-conflux-sdk)
