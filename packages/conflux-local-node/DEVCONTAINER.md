# DevContainer Setup for Conflux Local Node

This document describes the complete devcontainer setup for developing with the Conflux Local Node package.

## Overview

The devcontainer provides a fully configured development environment with:

- ✅ All system dependencies for @xcfx/node
- ✅ Platform-specific native bindings
- ✅ VS Code extensions and settings
- ✅ Debug configurations
- ✅ Pre-configured tasks
- ✅ Port forwarding for Conflux node
- ✅ Development tools and utilities

## Quick Start

### 1. Open in VS Code

```bash
# Open the workspace
code conflux-local-node.code-workspace

# Or open the folder
code .
```

### 2. Reopen in Container

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Select "Dev Containers: Reopen in Container"
3. Wait for the container to build and start

### 3. Start Developing

```bash
# Build the project
npm run build

# Start development mode
npm run dev

# Or use VS Code tasks (Ctrl+Shift+P -> "Tasks: Run Task")
```

## DevContainer Features

### Pre-installed Tools

- **Node.js 20** with Bookworm (OpenSSL 3.0)
- **TypeScript** and **ts-node** for development
- **Build tools**: build-essential, pkg-config, libssl-dev
- **Development tools**: git, curl, vim, nano, htop
- **Native bindings**: @xcfx/node-linux-x64-gnu

### VS Code Configuration

#### Extensions

- TypeScript support
- Prettier formatting
- ESLint linting
- Docker support
- JSON/YAML support
- Path intellisense

#### Settings

- Auto-format on save
- TypeScript import preferences
- File exclusions for clean workspace
- NPM script explorer

#### Tasks

- **Build** - Compile TypeScript
- **Dev** - Start development mode
- **Test** - Run tests
- **Start Node** - Start Conflux node
- **Docker Build** - Build Docker image
- **Docker Compose Up** - Start with docker-compose
- **Install Platform Deps** - Install native bindings

#### Debug Configurations

- **Debug CLI** - Debug main CLI application
- **Debug Test** - Debug test suite
- **Debug Example Script** - Debug example scripts
- **Debug Contract Deployment** - Debug contract deployment
- **Debug Start Node** - Debug node startup

### Port Forwarding

- **12537** - Conflux Core RPC port
- **8545** - Conflux EVM RPC port
- **3000** - Optional web interface port

### Volume Mounts

- **Source code** - Live editing with hot reload
- **Data directory** - Persistent node data
- **Deployments** - Contract deployment artifacts

## Development Workflow

### 1. Making Changes

1. Edit source files in `src/`
2. Use VS Code tasks to build: `Ctrl+Shift+P` -> "Tasks: Run Task" -> "Build"
3. Test changes with: `Ctrl+Shift+P` -> "Tasks: Run Task" -> "Test"

### 2. Running the Node

#### Development Mode

```bash
npm run dev
# Or use VS Code task: "Dev"
```

#### Production Mode

```bash
npm start
# Or use VS Code task: "Start Node"
```

#### Debug Mode

- Set breakpoints in VS Code
- Use debug configurations from the Debug panel
- Press F5 to start debugging

### 3. Testing

#### Run All Tests

```bash
npm test
# Or use VS Code task: "Test"
```

#### Debug Tests

- Use "Debug Test" configuration
- Set breakpoints in test files
- Step through code with F10/F11

#### Run Example Scripts

```bash
node dist/cli.js exec --script examples/simple-test.js
# Or use "Debug Example Script" configuration
```

### 4. Docker Development

#### Build and Test

```bash
# Build the main image
docker build -t conflux-local-node .

# Build the dev image
docker build -f .devcontainer/Dockerfile -t conflux-local-node-dev .

# Test the images
docker run --rm conflux-local-node node dist/cli.js --help
docker run --rm conflux-local-node-dev node dist/cli.js --help
```

#### Docker Compose

```bash
# Start development environment
docker-compose up conflux-dev

# Start Conflux node
docker-compose up conflux-node

# Start all services
docker-compose up
```

## File Structure

```
.devcontainer/
├── devcontainer.json      # Dev container configuration
├── Dockerfile             # Development Docker image
├── docker-compose.yml     # Multi-service setup
└── setup.sh              # Post-create setup script

.vscode/
├── settings.json          # VS Code settings
├── tasks.json            # VS Code tasks
└── launch.json           # Debug configurations

conflux-local-node.code-workspace  # VS Code workspace
```

## Configuration Details

### devcontainer.json

```json
{
  "name": "Conflux Local Node Development",
  "build": {
    "dockerfile": "Dockerfile",
    "context": ".."
  },
  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [...],
      "settings": {...}
    }
  },
  "forwardPorts": [12537, 8545],
  "postCreateCommand": "bash .devcontainer/setup.sh",
  "remoteUser": "node",
  "workspaceFolder": "/usr/src/app",
  "mounts": [...],
  "containerEnv": {
    "NODE_ENV": "development"
  }
}
```

### Dockerfile

```dockerfile
FROM node:20-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential pkg-config libssl-dev libssl3 \
    python3 make g++ git curl vim nano htop

# Install global dev tools
RUN npm install -g typescript ts-node nodemon @types/node

# Copy and install dependencies
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy source and install native bindings
COPY . .
RUN npm install @xcfx/node-linux-x64-gnu@0.6.0

# Build and setup
RUN npm run build
RUN mkdir -p /usr/src/app/data /usr/src/app/deployments

# Expose ports
EXPOSE 12537 8545

# Default command
CMD ["npm", "run", "dev"]
```

## Troubleshooting

### Container Won't Start

1. **Check Docker is running**
2. **Rebuild the container:**
   - `Ctrl+Shift+P` -> "Dev Containers: Rebuild Container"
3. **Check logs:**
   - `Ctrl+Shift+P` -> "Dev Containers: Show Container Log"

### Port Conflicts

1. **Check if ports are available:**

   ```bash
   netstat -tulpn | grep -E ':(12537|8545)'
   ```

2. **Use different ports:**
   - Modify `devcontainer.json` `forwardPorts`
   - Update CLI commands with `--port` and `--eth-port`

### Native Binding Issues

1. **Reinstall platform dependencies:**

   ```bash
   npm run install:platform
   ```

2. **Check system dependencies:**

   ```bash
   # In the container
   ldd --version
   openssl version
   ```

3. **Verify native binding:**
   ```bash
   # Check if .node file exists
   find node_modules -name "*.node" -path "*/@xcfx/node/*"
   ```

### Build Errors

1. **Clean and rebuild:**

   ```bash
   npm run clean
   npm run build
   ```

2. **Check TypeScript errors:**

   ```bash
   npm run type-check
   ```

3. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run install:platform
   ```

### Debug Issues

1. **Check debug configuration:**

   - Verify program path in `launch.json`
   - Check arguments are correct
   - Ensure source maps are generated

2. **Set breakpoints correctly:**

   - Use source files, not compiled files
   - Check breakpoints are in executable code

3. **Check console output:**
   - Look for error messages
   - Verify environment variables

## Advanced Usage

### Custom Development Scripts

Add custom scripts to `package.json`:

```json
{
  "scripts": {
    "dev:watch": "nodemon --exec ts-node src/cli.ts",
    "dev:debug": "node --inspect-brk dist/cli.js dev",
    "test:watch": "nodemon --exec npm test"
  }
}
```

### Custom VS Code Tasks

Add tasks to `.vscode/tasks.json`:

```json
{
  "label": "Custom Task",
  "type": "shell",
  "command": "your-command",
  "group": "build",
  "presentation": {
    "echo": true,
    "reveal": "always"
  }
}
```

### Environment Variables

Set environment variables in `devcontainer.json`:

```json
{
  "containerEnv": {
    "NODE_ENV": "development",
    "CORE_PORT": "12537",
    "EVM_PORT": "8545",
    "DEBUG": "conflux:*"
  }
}
```

## Best Practices

1. **Use VS Code tasks** instead of terminal commands
2. **Set breakpoints** in source files, not compiled files
3. **Use the integrated terminal** for better integration
4. **Commit devcontainer files** to version control
5. **Document custom configurations** in this file
6. **Test the devcontainer** on different machines
7. **Keep dependencies updated** regularly
8. **Use the workspace file** for consistent settings

## Support

For devcontainer-specific issues:

1. Check this documentation
2. Review VS Code Dev Containers documentation
3. Check Docker logs and container status
4. Verify all configuration files are correct
5. Test with a minimal devcontainer setup
