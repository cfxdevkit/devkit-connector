# Use the same base as the main Dockerfile for consistency
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
    git \
    curl \
    vim \
    nano \
    htop \
    && rm -rf /var/lib/apt/lists/*

# Install global development tools
RUN npm install -g \
    typescript \
    ts-node \
    nodemon \
    @types/node

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

# Set environment variables for native bindings
ENV LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu

# Create data directories
RUN mkdir -p /usr/src/app/data /usr/src/app/deployments

# Expose ports for Conflux node
EXPOSE 12537 8545

# Default command for development
CMD ["npm", "run", "dev"]