#!/bin/bash

# Conflux Dual Wallet System - Build Script
set -e

echo "🔨 Building Conflux Dual Wallet System..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
pnpm clean

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Type checking
echo "🔍 Running type checks..."
pnpm type-check

# Linting
echo "🔧 Running linter..."
pnpm lint

# Building packages
echo "🏗️ Building packages..."
pnpm build

# Running tests
echo "🧪 Running tests..."
pnpm test

echo "✅ Build completed successfully!"
echo ""
echo "📦 Built packages:"
echo "- @conflux-wallet/types"
echo "- @conflux-wallet/core"
echo "- @conflux-wallet/database"
echo "- @conflux-wallet/server"
echo "- @conflux-wallet/client"
echo "- @conflux-wallet/wagmi-connector"
echo "- @conflux-wallet/utils"
echo "- @conflux-wallet/config"
echo "- @conflux-wallet/testing"
echo ""
echo "🚀 Ready for deployment!"
