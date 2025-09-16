#!/bin/bash

# Conflux Dual Wallet Demo - DevContainer Setup Script
# This script sets up the development environment inside the devcontainer

set -e

echo "🚀 Setting up Conflux Dual Wallet Demo DevContainer..."
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "server" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

# Install pnpm globally if not already installed
if ! command -v pnpm &> /dev/null; then
    print_status "Installing pnpm globally..."
    npm install -g pnpm
    print_success "pnpm installed successfully"
else
    print_status "pnpm is already installed"
fi

# Install dependencies for all components
print_status "Installing dependencies for all components..."

# Install root dependencies first
if [ -f "package.json" ]; then
    print_status "Installing root dependencies..."
    pnpm install
    print_success "Root dependencies installed"
fi

# Server dependencies
if [ -d "server" ]; then
    print_status "Installing server dependencies..."
    cd server
    pnpm install
    cd ..
    print_success "Server dependencies installed"
fi

# Demo app dependencies
if [ -d "connector-source/apps/demo-app" ]; then
    print_status "Installing demo app dependencies..."
    cd connector-source/apps/demo-app
    pnpm install
    cd ../../..
    print_success "Demo app dependencies installed"
fi

# Conflux local node dependencies
if [ -d "packages/conflux-local-node" ]; then
    print_status "Installing conflux-local-node dependencies..."
    cd packages/conflux-local-node
    pnpm install
    cd ../..
    print_success "Conflux local node dependencies installed"
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p deployment/deployments
mkdir -p packages/conflux-local-node/data
print_success "Directories created"

# Set up Git configuration (if not already set)
if [ -z "$(git config --global user.name)" ]; then
    print_status "Setting up Git configuration..."
    git config --global user.name "DevContainer User"
    git config --global user.email "devcontainer@example.com"
    print_success "Git configuration set"
fi

# Install OpenSSL 3.0 and development tools
print_status "Installing OpenSSL 3.0 and development tools..."
sudo apt-get update
sudo apt-get install -y libssl3 libssl-dev openssl
npm install -g @types/node typescript ts-node nodemon concurrently
print_success "OpenSSL 3.0 and additional tools installed"

# Create a workspace configuration file
print_status "Creating workspace configuration..."
cat > .vscode/settings.json << EOF
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.sol": "solidity"
  },
  "solidity.defaultCompiler": "remote",
  "solidity.compileUsingRemoteVersion": "v0.8.19",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/logs": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/logs": true
  }
}
EOF

# Create a workspace tasks configuration
print_status "Creating workspace tasks..."
mkdir -p .vscode
cat > .vscode/tasks.json << EOF
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start All Services",
      "type": "shell",
      "command": "./start-all.sh",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "problemMatcher": []
    },
    {
      "label": "Stop All Services",
      "type": "shell",
      "command": "./stop-all.sh",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "problemMatcher": []
    },
    {
      "label": "Start Server Only",
      "type": "shell",
      "command": "cd server && pnpm run dev",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "problemMatcher": []
    },
    {
      "label": "Start Frontend Only",
      "type": "shell",
      "command": "cd frontend && pnpm start",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "problemMatcher": []
    },
    {
      "label": "Deploy Contracts",
      "type": "shell",
      "command": "cd deployment && pnpm run deploy",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "problemMatcher": []
    },
    {
      "label": "Test API",
      "type": "shell",
      "command": "curl http://localhost:3001/health",
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "problemMatcher": []
    }
  ]
}
EOF

# Create a launch configuration for debugging
print_status "Creating launch configuration..."
cat > .vscode/launch.json << EOF
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "\${workspaceFolder}/server/src/index.ts",
      "cwd": "\${workspaceFolder}/server",
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development",
        "ESPACE_RPC_URL": "http://localhost:12537",
        "CORE_RPC_URL": "http://localhost:12539",
        "PRIVATE_KEY": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "DEPLOYMENTS_PATH": "../deployment/deployments"
      },
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    },
    {
      "name": "Debug Node Manager",
      "type": "node",
      "request": "launch",
      "program": "\${workspaceFolder}/node-manager/src/index.ts",
      "cwd": "\${workspaceFolder}/node-manager",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["start"],
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
EOF

# Create a comprehensive README for the devcontainer
print_status "Creating devcontainer README..."
cat > .devcontainer/README.md << EOF
# DevContainer for Conflux Dual Wallet Demo

This devcontainer provides a complete development environment for the Conflux Dual Wallet Demo.

## 🚀 Quick Start

1. Open this project in VS Code
2. When prompted, click "Reopen in Container"
3. Wait for the setup to complete
4. Run \`./start-all.sh\` to start all services

## 🛠️ What's Included

- **Node.js 20** with TypeScript support
- **pnpm** package manager
- **Docker-in-Docker** for containerized services
- **Git** and **GitHub CLI** for version control
- **VS Code extensions** for TypeScript, React, Solidity, and more
- **Pre-configured ports** for all services
- **Environment variables** set up for development

## 📦 Pre-installed Extensions

- TypeScript and JavaScript support
- React and React Native snippets
- Solidity language support
- Prettier code formatter
- ESLint
- Docker support
- Git and GitHub integration
- Markdown support

## 🔧 Available Commands

- \`./start-all.sh\` - Start all services
- \`./stop-all.sh\` - Stop all services
- \`cd server && pnpm run dev\` - Start server only
- \`cd frontend && pnpm start\` - Start frontend only
- \`cd deployment && pnpm run deploy\` - Deploy contracts

## 🌐 Ports

- **3000** - Frontend (React)
- **3001** - API Server
- **12537** - Conflux eSpace RPC
- **12539** - Conflux Core RPC

## 🐛 Debugging

Use the VS Code debugger with the pre-configured launch configurations:
- "Debug Server" - Debug the Express.js server
- "Debug Node Manager" - Debug the node manager

## 📁 Project Structure

\`\`\`
minimal/
├── .devcontainer/     # DevContainer configuration
├── server/            # Express.js API server
├── contracts/         # Smart contracts
├── deployment/        # Deployment scripts
├── node-manager/      # Node wrapper
├── frontend/          # React frontend
└── logs/             # Application logs
\`\`\`

## 🔧 Customization

To customize the devcontainer:

1. Edit \`.devcontainer/devcontainer.json\` for container settings
2. Edit \`.devcontainer/setup.sh\` for setup commands
3. Edit \`.vscode/settings.json\` for VS Code settings
4. Edit \`.vscode/tasks.json\` for build tasks
5. Edit \`.vscode/launch.json\` for debug configurations

## 🆘 Troubleshooting

### Container won't start
- Check Docker is running
- Ensure ports 3000, 3001, 12537, 12539 are available
- Check VS Code Dev Containers extension is installed

### Services won't start
- Check logs in \`logs/\` directory
- Verify all dependencies are installed
- Check port availability

### Build errors
- Run \`pnpm install\` in each component directory
- Check TypeScript configuration
- Verify Node.js version compatibility

## 📚 Documentation

- [Main README](../README.md) - Project overview
- [Integration Test Guide](../INTEGRATION_TEST.md) - Testing instructions
- [VS Code Dev Containers](https://code.visualstudio.com/docs/remote/containers) - DevContainer documentation
EOF

print_success "DevContainer setup completed successfully!"
echo ""
echo "🎉 DevContainer is ready!"
echo ""
echo "📋 Next steps:"
echo "1. Reopen in Container (if not already done)"
echo "2. Run: ./start-all.sh"
echo "3. Open: http://localhost:3000"
echo ""
echo "📚 Documentation: .devcontainer/README.md"
echo "🔧 VS Code tasks available in Command Palette (Ctrl+Shift+P)"
echo ""

