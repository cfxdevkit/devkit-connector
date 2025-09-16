#!/bin/bash

# Minimal Conflux Dual Wallet Demo - Stop All Services
# This script stops all running services

set -e

echo "🛑 Stopping Minimal Conflux Dual Wallet Demo"
echo "============================================="

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

# Function to stop a service
stop_service() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        print_status "Stopping $service_name (PID: $pid)..."
        
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            sleep 2
            
            # Force kill if still running
            if kill -0 $pid 2>/dev/null; then
                print_warning "Force stopping $service_name..."
                kill -9 $pid 2>/dev/null || true
            fi
            
            print_success "$service_name stopped"
        else
            print_warning "$service_name was not running"
        fi
        
        rm -f "$pid_file"
    else
        print_warning "No PID file found for $service_name"
    fi
}

# Stop all services
print_status "Stopping all services..."

stop_service "Server"
stop_service "Frontend"
stop_service "NodeManager"

# Also kill any remaining processes
print_status "Cleaning up remaining processes..."
pkill -f "node.*server" || true
pkill -f "react-scripts" || true
pkill -f "node.*node-manager" || true

# Clean up log files
print_status "Cleaning up log files..."
rm -f logs/*.pid

print_success "All services stopped successfully!"
echo ""
echo "📝 Log files are preserved in the logs/ directory"
echo "🔄 To start services again, run: ./start-all.sh"

