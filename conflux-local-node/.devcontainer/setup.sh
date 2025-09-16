#!/bin/bash

# Setup script for Conflux Local Node devcontainer
echo "🔧 Setting up Conflux Local Node development environment..."

# Install platform-specific dependencies
echo "📦 Installing platform-specific dependencies..."
npm run install:platform

# Build the project
echo "🏗️  Building the project..."
npm run build

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data deployments logs

# Set up git hooks (if in a git repository)
if [ -d ".git" ]; then
    echo "🔗 Setting up git hooks..."
    # Add any git hooks here if needed
fi

# Install additional development tools
echo "🛠️  Installing additional development tools..."
npm install -D @types/jest jest ts-jest

# Create a sample .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📄 Creating sample .env file..."
    cat > .env << EOF
# Conflux Local Node Configuration
NODE_ENV=development
CORE_PORT=12537
EVM_PORT=8545
BLOCK_INTERVAL=1000
DATA_DIR=.conflux-dev
EOF
fi

echo "✅ Development environment setup complete!"
echo ""
echo "🚀 Available commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build the project"
echo "  npm test             - Run tests"
echo "  npm run start        - Start Conflux node"
echo "  docker-compose up    - Start with docker-compose"
echo ""
echo "📚 Documentation:"
echo "  - README.md          - Main documentation"
echo "  - SETUP.md           - Setup guide"
echo "  - INSTALLATION.md    - Installation instructions"
