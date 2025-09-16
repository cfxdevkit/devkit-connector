# Development Guide

This guide covers how to develop with the Conflux Local Node package using various development environments.

## Quick Start

### Using VS Code Dev Container (Recommended)

1. **Open in Dev Container:**

   ```bash
   # Open the workspace in VS Code
   code conflux-local-node.code-workspace

   # Or open the folder and use Command Palette:
   # Ctrl+Shift+P -> "Dev Containers: Reopen in Container"
   ```

2. **The devcontainer will automatically:**

   - Build the Docker image with all dependencies
   - Install platform-specific native bindings
   - Set up the development environment
   - Forward ports 12537 (Core) and 8545 (EVM)

3. **Start developing:**

   ```bash
   # Build the project
   npm run build

   # Start development mode
   npm run dev

   # Or use VS Code tasks (Ctrl+Shift+P -> "Tasks: Run Task")
   ```

### Using Docker Compose

1. **Start the development environment:**

   ```bash
   docker-compose up conflux-dev
   ```

2. **In another terminal, start the Conflux node:**
   ```bash
   docker-compose up conflux-node
   ```

### Local Development

1. **Prerequisites:**

   ```bash
   # Install system dependencies (Ubuntu/Debian)
   sudo apt-get install -y build-essential pkg-config libssl-dev libssl3 python3

   # Or use Docker for consistent environment
   docker run -it --rm -v $(pwd):/workspace -w /workspace node:20-bookworm bash
   ```

2. **Setup:**

   ```bash
   # Install dependencies
   npm install

   # Install platform-specific native bindings
   npm run install:platform

   # Build the project
   npm run build
   ```

## Development Workflow

### 1. Making Changes

1. **Edit source files** in `src/`
2. **Build the project:**

   ```bash
   npm run build
   # Or use VS Code task: Ctrl+Shift+P -> "Tasks: Run Task" -> "Build"
   ```

3. **Test your changes:**
   ```bash
   npm test
   # Or use VS Code task: Ctrl+Shift+P -> "Tasks: Run Task" -> "Test"
   ```

### 2. Running the Node

#### Development Mode (with auto-reload)

```bash
npm run dev
# Or: node dist/cli.js dev
```

#### Production Mode

```bash
npm start
# Or: node dist/cli.js start
```

#### With Custom Ports

```bash
node dist/cli.js start --port 12537 --eth-port 8545
```

### 3. Testing

#### Run All Tests

```bash
npm test
```

#### Run Specific Test

```bash
node dist/cli.js exec --script examples/simple-test.js
```

#### Debug Tests

Use VS Code debug configurations:

- "Debug Test" - Run the main test suite
- "Debug Example Script" - Run example scripts
- "Debug Contract Deployment" - Test contract deployment

### 4. Docker Development

#### Build and Test

```bash
# Build the Docker image
docker build -t conflux-local-node .

# Test the image
docker run --rm conflux-local-node node dist/cli.js --help
```

#### Development with Docker Compose

```bash
# Start all services
docker-compose up

# Start only the development container
docker-compose up conflux-dev

# Start only the Conflux node
docker-compose up conflux-node
```

## Project Structure

```
conflux-local-node/
├── .devcontainer/          # Dev container configuration
├── .vscode/               # VS Code configuration
├── examples/              # Example scripts
├── scripts/               # Build and utility scripts
├── src/                   # Source code
│   ├── ConfluxNode.ts     # Core node class
│   ├── NodeManager.ts     # Persistent node manager
│   ├── ConfluxOperations.ts # Utility operations
│   ├── ContractDeployer.ts # Contract deployment
│   ├── TestRunner.ts      # Test utilities
│   ├── cli.ts             # CLI interface
│   ├── index.ts           # Main exports
│   └── types.ts           # Type definitions
├── dist/                  # Compiled output
├── data/                  # Node data (created at runtime)
├── deployments/           # Contract deployments (created at runtime)
├── Dockerfile             # Main Docker image
├── docker-compose.yml     # Docker Compose configuration
└── package.json           # Package configuration
```

## Available Scripts

### NPM Scripts

- `npm run build` - Build the TypeScript project
- `npm run dev` - Start development mode with ts-node
- `npm start` - Start the compiled application
- `npm test` - Run tests
- `npm run clean` - Clean build artifacts
- `npm run type-check` - Type check without building
- `npm run install:platform` - Install platform-specific dependencies

### CLI Commands

- `node dist/cli.js start` - Start Conflux node
- `node dist/cli.js dev` - Development mode
- `node dist/cli.js stop` - Stop node
- `node dist/cli.js deploy` - Deploy contracts
- `node dist/cli.js test` - Run tests
- `node dist/cli.js exec --script <file>` - Execute script
- `node dist/cli.js status` - Check node status
- `node dist/cli.js reset` - Reset node data

## Debugging

### VS Code Debug Configurations

1. **Debug CLI** - Debug the main CLI application
2. **Debug Test** - Debug the test suite
3. **Debug Example Script** - Debug example scripts
4. **Debug Contract Deployment** - Debug contract deployment
5. **Debug Start Node** - Debug node startup

### Debugging Tips

1. **Set breakpoints** in VS Code by clicking in the gutter
2. **Use the Debug Console** to inspect variables
3. **Step through code** using F10 (step over) and F11 (step into)
4. **Inspect call stack** in the Debug panel

### Common Issues

1. **Native binding errors:**

   ```bash
   # Reinstall platform dependencies
   npm run install:platform
   ```

2. **Build errors:**

   ```bash
   # Clean and rebuild
   npm run clean
   npm run build
   ```

3. **Port conflicts:**
   ```bash
   # Use different ports
   node dist/cli.js start --port 12538 --eth-port 8546
   ```

## Contributing

### Code Style

- Use TypeScript with strict mode
- Follow Prettier formatting
- Use ESLint for linting
- Write JSDoc comments for public APIs

### Testing

- Write tests for new features
- Test both success and error cases
- Use the example scripts as integration tests

### Documentation

- Update README.md for user-facing changes
- Update DEVELOPMENT.md for development changes
- Add JSDoc comments for new APIs

## Environment Variables

- `NODE_ENV` - Environment (development/production)
- `CORE_PORT` - Core RPC port (default: 12537)
- `EVM_PORT` - EVM RPC port (default: 8545)
- `BLOCK_INTERVAL` - Block generation interval (default: 1000)
- `DATA_DIR` - Data directory (default: .conflux-dev)
- `LD_LIBRARY_PATH` - Library path for native bindings

## Troubleshooting

### Dev Container Issues

1. **Container won't start:**

   - Check Docker is running
   - Rebuild the container: Ctrl+Shift+P -> "Dev Containers: Rebuild Container"

2. **Port forwarding issues:**

   - Check ports 12537 and 8545 are available
   - Use different ports in devcontainer.json

3. **Native binding issues:**
   - Ensure the devcontainer Dockerfile includes all dependencies
   - Check the setup script runs successfully

### Docker Issues

1. **Build fails:**

   ```bash
   # Clean build
   docker build --no-cache -t conflux-local-node .
   ```

2. **Container exits immediately:**

   - Check the command in Dockerfile
   - Use `docker run -it conflux-local-node bash` to debug

3. **Permission issues:**
   - Check file permissions
   - Use `--user` flag if needed

### Local Development Issues

1. **OpenSSL version issues:**

   - Use Docker for consistent environment
   - Install OpenSSL 3.0 on your system

2. **Native binding issues:**

   - Run `npm run install:platform`
   - Check system dependencies are installed

3. **TypeScript errors:**
   - Run `npm run type-check`
   - Check tsconfig.json configuration
