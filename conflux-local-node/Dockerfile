# Use Node.js 20 with Debian Bookworm for OpenSSL 3.0 support
FROM node:20-bookworm

# Set working directory
WORKDIR /usr/src/app

# Install system dependencies required for @xcfx/node
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    libssl3 \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies (without postinstall script)
RUN npm install --ignore-scripts

# Copy application code
COPY . .

# Install platform-specific native bindings
RUN npm install @xcfx/node-linux-x64-gnu@0.6.0

# Build the application
RUN npm run build

# Expose ports for Conflux node
EXPOSE 12537 8545

# Set environment variables for native bindings
ENV LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu

# Default command
CMD ["node", "dist/cli.js", "dev"]
