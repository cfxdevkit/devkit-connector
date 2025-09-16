#!/bin/bash

# Minimal Conflux Dual Wallet Demo - Start All Services
# This script starts all services in the correct order

set -e

echo "🚀 Starting Minimal Conflux Dual Wallet Demo"
echo "=============================================="

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

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install pnpm first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Function to start a service
start_service() {
    local service_name=$1
    local service_dir=$2
    local start_command=$3
    local port=$4
    
    print_status "Starting $service_name..."
    
    if [ -d "$service_dir" ]; then
        cd "$service_dir"
        
        # Install dependencies if node_modules doesn't exist
        if [ ! -d "node_modules" ]; then
            print_status "Installing dependencies for $service_name..."
            pnpm install
        fi
        
        # Start the service in background
        if [ -n "$port" ]; then
            print_status "Starting $service_name on port $port..."
        fi
        
        # Use nohup to run in background and redirect output
        nohup $start_command > "../logs/${service_name}.log" 2>&1 &
        local pid=$!
        echo $pid > "../logs/${service_name}.pid"
        
        # Wait a moment for the service to start
        sleep 2
        
        # Check if the process is still running
        if kill -0 $pid 2>/dev/null; then
            print_success "$service_name started successfully (PID: $pid)"
        else
            print_error "$service_name failed to start"
            return 1
        fi
        
        cd ..
    else
        print_error "Service directory $service_dir not found"
        return 1
    fi
}

# Create logs directory
mkdir -p logs

# # Clean up any existing processes
# print_status "Cleaning up existing processes..."
# pkill -f "node.*server" || true
# pkill -f "react-scripts" || true
# pkill -f "node.*node-manager" || true

# Wait a moment for processes to stop
# sleep 2

# Start services in order
print_status "Starting services..."

# 1. Start the server
start_service "Server" "server" "pnpm run dev" "3001"

# 2. Start the frontend
start_service "Frontend" "frontend" "pnpm start" "3000"

# 3. Start node manager (optional)
if [ "$1" = "--with-node" ]; then
    start_service "NodeManager" "node-manager" "pnpm run start:node" "12537"
fi

echo ""
print_success "All services started successfully!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   API Server: http://localhost:3001"
echo "   Health Check: http://localhost:3001/health"
echo ""
echo "📊 Service Status:"
echo "   Server PID: $(cat logs/server.pid 2>/dev/null || echo 'Not running')"
echo "   Frontend PID: $(cat logs/frontend.pid 2>/dev/null || echo 'Not running')"
if [ "$1" = "--with-node" ]; then
    echo "   NodeManager PID: $(cat logs/node-manager.pid 2>/dev/null || echo 'Not running')"
fi
echo ""
echo "📝 Logs are available in the logs/ directory"
echo ""
echo "🛑 To stop all services, run: ./stop-all.sh"
echo ""

# Keep the script running to show status
print_status "Press Ctrl+C to stop all services and exit"

# Function to cleanup on exit
cleanup() {
    echo ""
    print_status "Stopping all services..."
    
    # Stop services
    if [ -f "logs/server.pid" ]; then
        kill $(cat logs/server.pid) 2>/dev/null || true
        rm logs/server.pid
    fi
    
    if [ -f "logs/frontend.pid" ]; then
        kill $(cat logs/frontend.pid) 2>/dev/null || true
        rm logs/frontend.pid
    fi
    
    if [ -f "logs/node-manager.pid" ]; then
        kill $(cat logs/node-manager.pid) 2>/dev/null || true
        rm logs/node-manager.pid
    fi
    
    print_success "All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
while true; do
    sleep 1
done

