#!/bin/bash

# Demo Testing Script
echo "🚀 Starting Demo Testing Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_demo() {
    echo -e "${BLUE}[DEMO]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build packages
print_status "Building packages..."
npm run build

# Start local Hardhat node in background
print_status "Starting local Hardhat node..."
cd contracts/espace
npx hardhat node &
HARDHAT_PID=$!
cd ../..

# Wait for Hardhat to start
print_status "Waiting for Hardhat node to start..."
sleep 5

# Deploy contracts to local network
print_status "Deploying contracts to local network..."
cd contracts/espace
npx hardhat run scripts/deploy.ts --network localhost
cd ../core
npx hardhat run scripts/deploy.ts --network localhost
cd ../..

# Start server in background
print_status "Starting server..."
cd packages/server
npm run dev &
SERVER_PID=$!
cd ../..

# Wait for server to start
print_status "Waiting for server to start..."
sleep 3

# Start demo app
print_status "Starting demo app..."
cd apps/demo-app
npm run dev &
APP_PID=$!
cd ../..

print_status "Demo testing setup complete!"
echo ""
echo "🌐 Services running:"
echo "  - Hardhat Node: http://localhost:8545"
echo "  - Server API: http://localhost:3001"
echo "  - Demo App: http://localhost:3000"
echo ""
echo "📝 Available Demos:"
print_demo "  - Main Demo: http://localhost:3000"
print_demo "  - Pattern A (Server-Side): http://localhost:3000/demo/pattern-a"
print_demo "  - Pattern B (User-Delegated): http://localhost:3000/demo/pattern-b"
print_demo "  - Web Components: http://localhost:3000/web-components"
print_demo "  - Contract Testing: http://localhost:3000/contract-test"
echo ""
echo "🧪 Demo Features:"
print_demo "  - Pattern A: Server-managed wallets with centralized control"
print_demo "  - Pattern B: User-delegated wallets with configurable limits"
print_demo "  - Web Components: Framework-agnostic components"
print_demo "  - Contract Testing: Interactive contract testing and debugging"
echo ""
echo "🛑 To stop all services, run:"
echo "  kill $HARDHAT_PID $SERVER_PID $APP_PID"

# Keep script running
wait
