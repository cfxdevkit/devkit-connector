#!/bin/bash

# Web Components Testing Script
echo "🚀 Starting Web Components Testing Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build web components
print_status "Building web components..."
cd packages/web-components
npm install
npm run build
cd ../..

# Build demo app
print_status "Building demo app..."
cd apps/demo-app
npm install
npm run build
cd ../..

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

print_status "Web components testing setup complete!"
echo ""
echo "🌐 Services running:"
echo "  - Hardhat Node: http://localhost:8545"
echo "  - Server API: http://localhost:3001"
echo "  - Demo App: http://localhost:3000"
echo ""
echo "📝 Test the web components at: http://localhost:3000/web-components"
echo ""
echo "🧪 Web Components Available:"
echo "  - <delegation-manager> - Manage wallet delegations"
echo "  - <transaction-executor> - Execute transactions through delegation"
echo ""
echo "🛑 To stop all services, run:"
echo "  kill $HARDHAT_PID $SERVER_PID $APP_PID"

# Keep script running
wait
