# Contract Deployment Guide

This guide covers deploying smart contracts for both Conflux eSpace and Core networks using separate Hardhat configurations.

## 📁 Directory Structure

```
contracts/
├── espace/                    # eSpace (EVM-compatible) contracts
│   ├── contracts/            # Solidity contracts
│   ├── deploy/               # Deployment scripts
│   ├── scripts/              # Utility scripts
│   ├── test/                 # Test suites
│   ├── hardhat.config.ts     # eSpace Hardhat config
│   └── package.json          # eSpace dependencies
├── core/                     # Core (native) contracts
│   ├── contracts/            # Solidity contracts
│   ├── deploy/               # Deployment scripts
│   ├── scripts/              # Utility scripts
│   ├── test/                 # Test suites
│   ├── hardhat.config.ts     # Core Hardhat config
│   └── package.json          # Core dependencies
└── shared/                   # Shared utilities
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install eSpace dependencies
cd contracts/espace
npm install

# Install Core dependencies
cd ../core
npm install
```

### 2. Configure Environment

Copy the example environment files and configure them:

```bash
# eSpace configuration
cd contracts/espace
cp env.example .env
# Edit .env with your values

# Core configuration
cd ../core
cp env.example .env
# Edit .env with your values
```

### 3. Compile Contracts

```bash
# Compile eSpace contracts
cd contracts/espace
npm run compile

# Compile Core contracts
cd ../core
npm run compile
```

### 4. Run Tests

```bash
# Test eSpace contracts
cd contracts/espace
npm test

# Test Core contracts
cd ../core
npm test
```

## 🌐 Network Configuration

### eSpace Networks

- **Mainnet**: `confluxEspace` (Chain ID: 1030)
- **Testnet**: `confluxEspaceTestnet` (Chain ID: 71)

### Core Networks

- **Mainnet**: `confluxCore` (Chain ID: 1029)
- **Testnet**: `confluxCoreTestnet` (Chain ID: 1)

## 📦 Deployment Commands

### eSpace Deployment

```bash
cd contracts/espace

# Deploy to testnet
npm run deploy:testnet

# Deploy to mainnet
npm run deploy:mainnet

# Deploy locally
npm run deploy:local

# Deploy all networks
npm run deploy:all
```

### Core Deployment

```bash
cd contracts/core

# Deploy to testnet
npm run deploy:testnet

# Deploy to mainnet
npm run deploy:mainnet

# Deploy locally
npm run deploy:local

# Deploy all networks
npm run deploy:all
```

## 🔍 Contract Verification

### eSpace Verification

```bash
cd contracts/espace

# Verify testnet contracts
npm run verify:testnet

# Verify mainnet contracts
npm run verify:mainnet

# Verify all networks
npm run verify:all
```

### Core Verification

```bash
cd contracts/core

# Verify testnet contracts
npm run verify:testnet

# Verify mainnet contracts
npm run verify:mainnet

# Verify all networks
npm run verify:all
```

## 🧪 Testing

### Run Tests

```bash
# eSpace tests
cd contracts/espace
npm test

# Core tests
cd contracts/core
npm test
```

### Coverage Reports

```bash
# eSpace coverage
cd contracts/espace
npm run test:coverage

# Core coverage
cd contracts/core
npm run test:coverage
```

### Gas Reports

```bash
# eSpace gas report
cd contracts/espace
npm run gas-report

# Core gas report
cd contracts/core
npm run gas-report
```

## 🔧 Development

### Local Development

```bash
# Start local node
npx hardhat node

# Deploy to local network
npm run deploy:local
```

### Contract Interaction

```bash
# Open Hardhat console
npx hardhat console --network confluxEspaceTestnet

# Example usage
const DelegationManager = await ethers.getContractFactory("DelegationManager");
const delegationManager = await DelegationManager.attach("CONTRACT_ADDRESS");
```

## 📊 Monitoring

### Gas Usage

```bash
# Generate gas report
REPORT_GAS=true npm test
```

### Contract Size

```bash
# Check contract size
npm run size
```

## 🚨 Troubleshooting

### Common Issues

1. **RPC Connection Failed**
   - Check your RPC URL in `.env`
   - Ensure you have sufficient CFX for gas

2. **Verification Failed**
   - Check your API key
   - Ensure contract is deployed and confirmed

3. **Transaction Failed**
   - Check gas limits
   - Ensure sufficient balance
   - Verify network configuration

### Debug Commands

```bash
# Check network configuration
npx hardhat console --network confluxEspaceTestnet

# Verify deployment
npx hardhat verify --network confluxEspaceTestnet CONTRACT_ADDRESS

# Check gas estimates
npx hardhat test --gas-report
```

## 🔐 Security

### Best Practices

1. **Private Key Security**
   - Never commit private keys to version control
   - Use hardware wallets for mainnet deployments
   - Consider using multi-sig for production

2. **Contract Verification**
   - Always verify contracts on block explorers
   - Test thoroughly on testnets first
   - Use formal verification tools

3. **Access Control**
   - Implement proper access controls
   - Use role-based permissions
   - Consider timelock mechanisms

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Conflux Documentation](https://docs.confluxnetwork.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Solidity Documentation](https://docs.soliditylang.org/)

## 🤝 Support

For issues and questions:
- Check the troubleshooting section
- Review the test cases
- Consult the documentation
- Open an issue in the repository
