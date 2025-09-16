# Conflux Local Node

A standalone package for running a local Conflux node using `@xcfx/node` for development and testing. This package provides a clean, easy-to-use interface for starting, managing, and interacting with a local Conflux blockchain.

## Features

- **Easy Setup**: Simple installation and configuration
- **Dual Space Support**: Both Core and EVM (eSpace) support
- **Ephemeral Execution**: Run scripts with temporary nodes
- **Contract Deployment**: Deploy and test contracts easily
- **Wallet Management**: Automatic wallet generation and funding
- **Two Wallet Modes**: Mnemonic (multiple wallets) or Private Key (single wallet)
- **CLI Interface**: Command-line tools for all operations
- **TypeScript Support**: Full TypeScript definitions included
- **Silent Mode**: Run operations without verbose output

## Monorepo Usage

This package is part of a monorepo and can be used as a workspace dependency:

```bash
# In your package.json
{
  "dependencies": {
    "@conflux-local/node": "workspace:*"
  }
}
```

## Installation

### Quick Start with Dev Container (Recommended)

1. **Open in VS Code:**

   ```bash
   code conflux-local-node.code-workspace
   ```

2. **Reopen in Dev Container:**
   - Press `Ctrl+Shift+P`
   - Select "Dev Containers: Reopen in Container"
   - Wait for the container to build and start

3. **Start developing:**
   ```bash
   npm run build
   npm run dev
   ```

### Manual Installation

```bash
npm install conflux-local-node
# or
yarn add conflux-local-node
# or
pnpm add conflux-local-node
```

## Quick Start

### 1. Start a Local Node

```bash
# Start node in development mode (with default mnemonic wallets)
npx conflux-local-node dev

# Start node with custom ports
npx conflux-local-node start --port 12537 --eth-port 8545

# Start in silent mode
npx conflux-local-node start --silent

# Start with custom mnemonic
npx conflux-local-node start --mnemonic "your twelve word mnemonic phrase here"

# Start with private key (single wallet mode)
npx conflux-local-node start --wallet-mode privatekey --private-key "0x1234..."

# Start with custom wallet count
npx conflux-local-node start --wallet-count 20

# Start without auto-funding wallets
npx conflux-local-node start --no-fund
```

### 2. Deploy Contracts

```bash
# Deploy to both Core and EVM spaces
npx conflux-local-node deploy

# Deploy only to EVM space
npx conflux-local-node deploy --network espace

# Deploy only to Core space
npx conflux-local-node deploy --network core
```

### 3. Run Tests

```bash
# Test both networks
npx conflux-local-node test

# Test only EVM space
npx conflux-local-node test --network espace
```

### 4. Manage Wallets

```bash
# Show wallet information
npx conflux-local-node wallets

# Show wallets in JSON format
npx conflux-local-node wallets --format json

# Check node status (includes wallet info)
npx conflux-local-node status
```

### 5. Execute Scripts

```bash
# Execute a script with ephemeral node
npx conflux-local-node exec --script my-script.js

# Execute with custom ports and save output
npx conflux-local-node exec --script my-script.js --output result.json
```

## Wallet Management

The Conflux Local Node supports two wallet modes for different development scenarios:

### Mnemonic Mode (Default)

Generates multiple wallets from a mnemonic phrase:

```bash
# Use default test mnemonic (10 wallets)
npx conflux-local-node start

# Use custom mnemonic
npx conflux-local-node start --mnemonic "your twelve word mnemonic phrase here"

# Generate more wallets
npx conflux-local-node start --wallet-count 20

# Use environment variable
export HARDHAT_VAR_DEPLOYER_MNEMONIC="your twelve word mnemonic phrase here"
npx conflux-local-node start
```

**Features:**

- Generates 10 wallets by default (configurable)
- First wallet (index 0) is the mining destination
- All wallets are automatically funded
- Can create additional wallets at runtime
- Compatible with Hardhat and other tools

### Private Key Mode

Uses a single private key for all operations:

```bash
# Start with private key
npx conflux-local-node start --wallet-mode privatekey --private-key "0x1234..."

# The private key wallet becomes the mining destination
```

**Features:**

- Single wallet for all operations
- Wallet is the mining destination
- Automatically funded
- Useful for testing with specific accounts

### Wallet Information

```bash
# Show all wallets
npx conflux-local-node wallets

# Show in JSON format
npx conflux-local-node wallets --format json
```

**Output includes:**

- Wallet mode (mnemonic/privatekey)
- Mining address
- All wallet addresses and balances
- Private keys (for development)

## Programmatic Usage

### Basic Node Management

```typescript
import { ConfluxNode, NodeManager } from "conflux-local-node";

// Using NodeManager for persistent nodes
const nodeManager = new NodeManager();

// Start node with mnemonic wallets (default)
await nodeManager.start({
  corePort: 12537,
  evmPort: 8545,
  blockInterval: 1000,
  walletMode: "mnemonic",
  walletCount: 10,
  fundWallets: true,
});

// Start node with private key
await nodeManager.start({
  corePort: 12537,
  evmPort: 8545,
  walletMode: "privatekey",
  privateKey: "0x1234...",
  fundWallets: true,
});

// Get status (includes wallet info)
const status = await nodeManager.getStatus();
console.log("Node status:", status);
console.log("Wallets:", status.wallets);

// Stop node
await nodeManager.stop();
```

### Wallet Management

```typescript
import { ConfluxNode, WalletManager } from "conflux-local-node";

const node = new ConfluxNode();

// Start node with wallet configuration
await node.start({
  walletMode: "mnemonic",
  mnemonic: "test test test test test test test test test test test junk",
  walletCount: 5,
  fundWallets: true,
});

// Get wallet manager
const walletManager = node.getWalletManager();

// Get all wallets
const wallets = node.getWallets();
console.log(`Total wallets: ${wallets.length}`);

// Get mining wallet
const miningWallet = node.getMiningWallet();
console.log(`Mining address: ${miningWallet?.address}`);

// Get wallet by address
const wallet = node.getWalletByAddress("0x...");
console.log(`Found wallet: ${wallet?.address}`);

// Create new wallet (mnemonic mode only)
if (walletManager?.getWalletMode() === "mnemonic") {
  const newWallet = walletManager.createNewWallet();
  console.log(`New wallet: ${newWallet.address}`);
}

// Export wallet data
const exportData = walletManager?.exportWallets();
console.log("Wallet export:", exportData);
```

### Ephemeral Execution

```typescript
import { ConfluxNode, ConfluxOperations } from "conflux-local-node";

const node = new ConfluxNode();

// Execute a script with temporary node
const result = await node.executeScript(
  async (node) => {
    const evmClient = node.getEvmClient();
    const blockNumber = await evmClient.getBlockNumber();

    return {
      blockNumber,
      timestamp: new Date().toISOString(),
    };
  },
  {
    corePort: 12537,
    evmPort: 8545,
    silent: true,
  }
);

console.log("Execution result:", result);
```

### Contract Operations

```typescript
import { ConfluxOperations } from "conflux-local-node";

// Deploy a contract
const deployResult = await ConfluxOperations.deployContract(
  contractCode,
  abi,
  constructorArgs,
  { evmPort: 8545, silent: true }
);

if (deployResult.success) {
  console.log("Contract deployed at:", deployResult.data?.address);
}

// Call a contract method
const callResult = await ConfluxOperations.callContractMethod(
  contractAddress,
  abi,
  "getValue",
  [],
  { evmPort: 8545, silent: true }
);

console.log("Method result:", callResult.data);
```

## CLI Commands

### `start`

Start a local Conflux node

```bash
npx conflux-local-node start [options]

Options:
  -p, --port <port>        RPC port for Core space (default: 12537)
  -e, --eth-port <port>    RPC port for EVM space (default: 8545)
  -i, --interval <ms>      Block generation interval in ms (default: 1000)
  -s, --silent            Run in silent mode
```

### `dev`

Start development environment with auto-reload

```bash
npx conflux-local-node dev [options]

Options:
  -p, --port <port>        RPC port for Core space (default: 12537)
  -e, --eth-port <port>    RPC port for EVM space (default: 8545)
  -i, --interval <ms>      Block generation interval in ms (default: 1000)
```

### `stop`

Stop the local Conflux node

```bash
npx conflux-local-node stop
```

### `deploy`

Deploy contracts to local node

```bash
npx conflux-local-node deploy [options]

Options:
  -n, --network <network>  Network to deploy to (espace|core|both) (default: both)
  -p, --port <port>        RPC port for Core space (default: 12537)
  -e, --eth-port <port>    RPC port for EVM space (default: 8545)
```

### `test`

Run contract tests against local node

```bash
npx conflux-local-node test [options]

Options:
  -n, --network <network>  Network to test (espace|core|both) (default: both)
  -p, --port <port>        RPC port for Core space (default: 12537)
  -e, --eth-port <port>    RPC port for EVM space (default: 8545)
```

### `exec`

Execute a script with ephemeral node

```bash
npx conflux-local-node exec [options]

Options:
  -s, --script <file>      Script file to execute (required)
  -c, --core-port <port>   Core RPC port (default: 12537)
  -e, --evm-port <port>    EVM RPC port (default: 8545)
  -i, --interval <ms>      Block interval in ms (default: 1000)
  -o, --output <file>      Output file for results
```

### `deploy-contract`

Deploy a single contract with ephemeral node

```bash
npx conflux-local-node deploy-contract [options]

Options:
  -c, --contract <file>    Contract file (Solidity) (required)
  -a, --abi <file>         ABI file (JSON)
  -n, --name <name>        Contract name (default: Contract)
  -p, --core-port <port>   Core RPC port (default: 12537)
  -e, --evm-port <port>    EVM RPC port (default: 8545)
  -o, --output <file>      Output file for deployment info
```

### `status`

Check node status

```bash
npx conflux-local-node status
```

### `reset`

Reset local node data

```bash
npx conflux-local-node reset
```

## Configuration

### Node Configuration

```typescript
interface NodeConfig {
  corePort?: number; // Core RPC port (default: 12537)
  evmPort?: number; // EVM RPC port (default: 8545)
  blockInterval?: number; // Block generation interval (default: 1000ms)
  chainId?: number; // Core chain ID (default: 1111)
  evmChainId?: number; // EVM chain ID (default: 2222)
  dataDir?: string; // Data directory (default: '.conflux-dev')
  silent?: boolean; // Silent mode (default: false)
}
```

### Script Format

Scripts should export a default function that receives the node instance:

```javascript
// my-script.js
export default async function myScript(node) {
  // Access EVM client
  const evmClient = node.getEvmClient();

  // Access Core client
  const coreClient = node.getCoreClient();

  // Get node status
  const status = await node.getStatus();

  // Your logic here
  return { result: "success" };
}
```

## Examples

### Simple Contract Deployment

```javascript
// deploy-example.js
export default async function deployExample(node) {
  const { ethers } = await import("ethers");

  const contractCode = `
    contract SimpleStorage {
        uint256 private value;
        
        function setValue(uint256 _value) public {
            value = _value;
        }
        
        function getValue() public view returns (uint256) {
            return value;
        }
    }
  `;

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const wallet = new ethers.Wallet("0x...", provider);

  const factory = new ethers.ContractFactory(abi, contractCode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  return {
    address: await contract.getAddress(),
    txHash: contract.deploymentTransaction()?.hash,
  };
}
```

### Complete Development Workflow

```bash
# 1. Start development node
npx conflux-local-node dev

# 2. In another terminal, deploy contracts
npx conflux-local-node deploy

# 3. Run tests
npx conflux-local-node test

# 4. Execute custom script
npx conflux-local-node exec --script my-script.js

# 5. Stop node (Ctrl+C in dev mode)
```

## Development

### Using VS Code Dev Container

The project includes a complete devcontainer setup for seamless development:

1. **Open the workspace:**

   ```bash
   code conflux-local-node.code-workspace
   ```

2. **Reopen in container:**
   - Press `Ctrl+Shift+P`
   - Select "Dev Containers: Reopen in Container"

3. **The devcontainer provides:**
   - Pre-configured environment with all dependencies
   - Native bindings for @xcfx/node
   - Port forwarding (12537, 8545)
   - VS Code extensions and settings
   - Debug configurations
   - Pre-configured tasks

### Development Commands

```bash
# Build the project
npm run build

# Start development mode
npm run dev

# Run tests
npm test

# Install platform dependencies
npm run install:platform
```

For detailed development information, see [DEVELOPMENT.md](DEVELOPMENT.md).

## API Reference

### ConfluxNode

Main class for managing ephemeral nodes.

#### Methods

- `start(config)` - Start the node
- `stop()` - Stop the node
- `executeScript(script, config)` - Execute a script with ephemeral node
- `executeCompleteFlow(flow, config)` - Execute a complete flow
- `getStatus()` - Get current node status
- `getCoreClient()` - Get Core space client
- `getEvmClient()` - Get EVM space client

### NodeManager

Class for managing persistent nodes.

#### Methods

- `start(config)` - Start persistent node
- `stop()` - Stop persistent node
- `startDev(config)` - Start development mode
- `getStatus()` - Get node status
- `reset()` - Reset node data
- `getCoreClient()` - Get Core space client
- `getEvmClient()` - Get EVM space client

### ConfluxOperations

Utility class with common operations.

#### Methods

- `deployContract(code, abi, args, config)` - Deploy a contract
- `callContractMethod(address, abi, method, args, config)` - Call contract method
- `sendTransaction(to, value, data, config)` - Send transaction
- `getBlockInfo(blockNumber, config)` - Get block information
- `runCompleteDeploymentFlow(contracts, config)` - Run complete flow

## Troubleshooting

### Node Fails to Start

- Check if ports are available
- Increase timeout in configuration
- Check `@xcfx/node` installation

### Script Execution Fails

- Verify script exports a function
- Check script syntax
- Ensure proper error handling

### Contract Deployment Fails

- Verify contract code is valid Solidity
- Check ABI matches contract interface
- Ensure sufficient gas for deployment

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
