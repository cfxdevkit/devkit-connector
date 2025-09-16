#!/bin/bash

# Conflux Dual Wallet System - Development Script
set -e

echo "🚀 Starting Conflux Dual Wallet System development environment..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp env.example .env.local
    echo "📝 Please edit .env.local with your configuration"
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

# Start development server
echo "🔨 Starting development server..."
pnpm dev
