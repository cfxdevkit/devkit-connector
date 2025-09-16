#!/bin/bash

# Conflux Dual Wallet System - Setup Script
set -e

echo "🚀 Setting up Conflux Dual Wallet System..."

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ LTS"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@8.10.0
fi

echo "✅ pnpm $(pnpm -v) detected"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker"
    exit 1
fi

echo "✅ Docker $(docker --version) detected"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose"
    exit 1
fi

echo "✅ Docker Compose $(docker-compose --version) detected"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Set up environment
echo "⚙️ Setting up environment..."
if [ ! -f .env.local ]; then
    cp env.example .env.local
    echo "📝 Created .env.local from template"
    echo "⚠️  Please edit .env.local with your configuration"
else
    echo "✅ .env.local already exists"
fi

# Start database and Redis
echo "🗄️ Starting database and Redis..."
pnpm docker:up

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run database migrations
echo "🗃️ Running database migrations..."
pnpm db:migrate

# Seed database
echo "🌱 Seeding database..."
pnpm db:seed

# Build packages
echo "🔨 Building packages..."
pnpm build

echo "✅ Setup complete!"
echo ""
echo "🎉 Conflux Dual Wallet System is ready!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your configuration"
echo "2. Run 'pnpm dev' to start the development server"
echo "3. Visit http://localhost:3000 to see the demo app"
echo ""
echo "Useful commands:"
echo "- pnpm dev          # Start development server"
echo "- pnpm test         # Run tests"
echo "- pnpm docker:logs  # View logs"
echo "- pnpm docker:down  # Stop services"
echo ""
echo "Happy coding! 🚀"
