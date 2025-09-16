# Conflux Local Node Setup Guide

## Quick Start with Docker (Recommended)

The easiest way to get started is using Docker, which handles all the native dependencies automatically.

### 1. Using Docker Compose

```bash
# Clone and build
git clone <repository-url>
cd conflux-local-node

# Start the node
docker-compose up conflux-node

# Or start in background
docker-compose up -d conflux-node
```

### 2. Using Docker directly

```bash
# Build the image
docker build -t conflux-local-node .

# Run the node
docker run -p 12537:12537 -p 8545:8545 conflux-local-node

# Run with custom ports
docker run -p 12538:12537 -p 8546:8545 conflux-local-node node dist/cli.js start --port 12537 --eth-port 8545
```

## Local Installation

### Prerequisites

- Node.js 18+
- OpenSSL 3.0+ (for native bindings)
- Build tools (gcc, make, python)

### Ubuntu/Debian Setup

```bash
# Install system dependencies
sudo apt-get update
sudo apt-get install -y build-essential pkg-config libssl-dev libssl3 libcrypto3 python3

# Install the package
npm install conflux-local-node

# Install platform-specific native bindings
npm run install:platform
```

### macOS Setup

```bash
# Install OpenSSL 3.0 via Homebrew
brew install openssl@3 pkg-config

# Set environment variables
export PKG_CONFIG_PATH="/usr/local/opt/openssl@3/lib/pkgconfig"
export LDFLAGS="-L/usr/local/opt/openssl@3/lib"
export CPPFLAGS="-I/usr/local/opt/openssl@3/include"

# Install the package
npm install conflux-local-node
npm run install:platform
```

### Windows Setup

```bash
# Install Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/

# Install the package
npm install conflux-local-node
npm run install:platform
```

## Usage

### Command Line Interface

```bash
# Start development node
npx conflux-local-node dev

# Start with custom ports
npx conflux-local-node start --port 12537 --eth-port 8545

# Deploy contracts
npx conflux-local-node deploy

# Run tests
npx conflux-local-node test

# Execute a script
npx conflux-local-node exec --script my-script.js
```

### Programmatic Usage

```javascript
const { ConfluxNode, NodeManager } = require("conflux-local-node");

// Using NodeManager for persistent nodes
const nodeManager = new NodeManager();

// Start node
await nodeManager.start({
  corePort: 12537,
  evmPort: 8545,
  blockInterval: 1000,
});

// Get status
const status = await nodeManager.getStatus();
console.log("Node status:", status);

// Stop node
await nodeManager.stop();
```

## Troubleshooting

### OpenSSL Version Issues

If you get OpenSSL version errors:

1. **Check your OpenSSL version:**

   ```bash
   openssl version
   ```

2. **For Ubuntu 20.04 and older:**

   ```bash
   # Install OpenSSL 3.0 from source or use Docker
   sudo apt-get install -y software-properties-common
   sudo add-apt-repository ppa:deadsnakes/ppa
   sudo apt-get update
   sudo apt-get install -y openssl3 libssl3 libcrypto3
   ```

3. **For CentOS/RHEL:**
   ```bash
   sudo yum install -y openssl3-devel openssl3-libs
   ```

### Native Binding Issues

If native bindings fail to load:

1. **Check platform-specific package:**

   ```bash
   npm list | grep xcfx
   ```

2. **Reinstall platform dependencies:**

   ```bash
   npm run install:platform
   ```

3. **Check system libraries:**
   ```bash
   ldd node_modules/@xcfx/node-linux-x64-gnu/node.linux-x64-gnu.node
   ```

### Docker Issues

If Docker build fails:

1. **Check Dockerfile:**

   ```bash
   docker build --no-cache -t conflux-local-node .
   ```

2. **Check system dependencies in container:**
   ```bash
   docker run --rm conflux-local-node openssl version
   ```

## Development

### Building from Source

```bash
# Clone repository
git clone <repository-url>
cd conflux-local-node

# Install dependencies
npm install

# Install platform-specific dependencies
npm run install:platform

# Build
npm run build

# Test
npm test
```

### Adding New Features

1. Create feature branch
2. Make changes
3. Update tests
4. Build and test
5. Submit pull request

## API Reference

### ConfluxNode

Main class for ephemeral node operations.

```javascript
const node = new ConfluxNode();

// Execute script with temporary node
const result = await node.executeScript(
  async (node) => {
    const evmClient = node.getEvmClient();
    const blockNumber = await evmClient.getBlockNumber();
    return { blockNumber };
  },
  { silent: true }
);
```

### NodeManager

Class for persistent node management.

```javascript
const manager = new NodeManager();

// Start persistent node
await manager.start({ corePort: 12537, evmPort: 8545 });

// Get status
const status = await manager.getStatus();

// Stop node
await manager.stop();
```

### ConfluxOperations

Utility class for common operations.

```javascript
const { ConfluxOperations } = require("conflux-local-node");

// Deploy contract
const result = await ConfluxOperations.deployContract(
  contractCode,
  abi,
  constructorArgs,
  { evmPort: 8545, silent: true }
);
```

## Examples

See the `examples/` directory for more usage examples:

- `examples/simple-test.js` - Basic node testing
- `examples/contract-deployment.js` - Contract deployment example
- `examples/script-execution.js` - Script execution example

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Search existing issues
3. Create a new issue with:
   - Operating system and version
   - Node.js version
   - Error messages
   - Steps to reproduce
