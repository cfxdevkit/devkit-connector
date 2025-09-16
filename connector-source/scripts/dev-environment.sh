#!/bin/bash

# Conflux Dual Wallet Development Environment Setup
# This script sets up a complete local development environment using @xcfx/node

set -e

echo "🚀 Setting up Conflux Dual Wallet Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_status "🔍 Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "❌ Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        print_error "❌ pnpm is not installed. Please install pnpm first."
        exit 1
    fi
    
    print_success "✅ Dependencies check passed"
}

# Install dependencies
install_dependencies() {
    print_status "📦 Installing dependencies..."
    
    # Install root dependencies
    pnpm install
    
    # Install node manager dependencies
    cd tools/node-manager
    pnpm install
    cd ../..
    
    # Install contract dependencies
    cd contracts/espace
    pnpm install
    cd ../core
    pnpm install
    cd ../..
    
    print_success "✅ Dependencies installed"
}

# Build the project
build_project() {
    print_status "🔨 Building project..."
    
    # Build node manager
    cd tools/node-manager
    pnpm run build
    cd ../..
    
    # Build contracts
    cd contracts/espace
    pnpm run compile
    cd ../core
    pnpm run compile
    cd ../..
    
    print_success "✅ Project built successfully"
}

# Start local Conflux node
start_node() {
    print_status "🚀 Starting local Conflux node..."
    
    cd tools/node-manager
    pnpm run start &
    NODE_PID=$!
    cd ../..
    
    # Wait for node to start
    sleep 5
    
    print_success "✅ Local Conflux node started (PID: $NODE_PID)"
    echo $NODE_PID > .node.pid
}

# Deploy contracts to local node
deploy_contracts() {
    print_status "📦 Deploying contracts to local node..."
    
    cd tools/node-manager
    pnpm run deploy-contracts
    cd ../..
    
    print_success "✅ Contracts deployed to local node"
}

# Run tests against local node
run_tests() {
    print_status "🧪 Running tests against local node..."
    
    cd tools/node-manager
    pnpm run test-contracts
    cd ../..
    
    print_success "✅ Tests completed"
}

# Main execution
main() {
    case "${1:-all}" in
        "check")
            check_dependencies
            ;;
        "install")
            check_dependencies
            install_dependencies
            ;;
        "build")
            check_dependencies
            install_dependencies
            build_project
            ;;
        "start")
            start_node
            ;;
        "deploy")
            deploy_contracts
            ;;
        "test")
            run_tests
            ;;
        "stop")
            if [ -f .node.pid ]; then
                NODE_PID=$(cat .node.pid)
                print_status "🛑 Stopping local Conflux node (PID: $NODE_PID)..."
                kill $NODE_PID 2>/dev/null || true
                rm .node.pid
                print_success "✅ Local Conflux node stopped"
            else
                print_warning "⚠️  No local node PID file found"
            fi
            ;;
        "reset")
            if [ -f .node.pid ]; then
                NODE_PID=$(cat .node.pid)
                kill $NODE_PID 2>/dev/null || true
                rm .node.pid
            fi
            print_status "🔄 Resetting development environment..."
            rm -rf .conflux-dev
            print_success "✅ Development environment reset"
            ;;
        "all")
            check_dependencies
            install_dependencies
            build_project
            start_node
            sleep 3
            deploy_contracts
            run_tests
            print_success "🎉 Development environment setup complete!"
            print_status "🔗 Core RPC: http://127.0.0.1:12537"
            print_status "🔗 EVM RPC: http://127.0.0.1:8545"
            print_status "📊 Node status: pnpm run node:status"
            print_status "🛑 Stop node: pnpm run node:stop"
            ;;
        *)
            echo "Usage: $0 {check|install|build|start|deploy|test|stop|reset|all}"
            echo ""
            echo "Commands:"
            echo "  check   - Check if required dependencies are installed"
            echo "  install - Install all project dependencies"
            echo "  build   - Build the project"
            echo "  start   - Start local Conflux node"
            echo "  deploy  - Deploy contracts to local node"
            echo "  test    - Run tests against local node"
            echo "  stop    - Stop local Conflux node"
            echo "  reset   - Reset development environment"
            echo "  all     - Run complete setup (default)"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
