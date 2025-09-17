#!/bin/bash

# Start only the Server

echo "🖥️ Starting Conflux DevKit Server..."

cd packages/server
pnpm run dev
