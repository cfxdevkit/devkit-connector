# Installation Guide

## System Requirements

This package requires specific system dependencies to work properly with `@xcfx/node`.

### Ubuntu/Debian

```bash
# Install build tools and OpenSSL 3.0
sudo apt-get update
sudo apt-get install -y build-essential pkg-config

# Install OpenSSL 3.0 (required for @xcfx/node native bindings)
sudo apt-get install -y libssl-dev libssl3 libcrypto3

# If OpenSSL 3.0 is not available in your distribution, you can install it from source:
# wget https://www.openssl.org/source/openssl-3.0.12.tar.gz
# tar -xzf openssl-3.0.12.tar.gz
# cd openssl-3.0.12
# ./config --prefix=/usr/local/openssl3
# make -j$(nproc)
# sudo make install
# sudo ldconfig
```

### CentOS/RHEL/Fedora

```bash
# Install build tools
sudo yum groupinstall -y "Development Tools"
sudo yum install -y pkgconfig openssl-devel

# For OpenSSL 3.0 on older systems:
sudo yum install -y openssl3-devel openssl3-libs
```

### macOS

```bash
# Install using Homebrew
brew install openssl@3 pkg-config

# Set environment variables
export PKG_CONFIG_PATH="/usr/local/opt/openssl@3/lib/pkgconfig"
export LDFLAGS="-L/usr/local/opt/openssl@3/lib"
export CPPFLAGS="-I/usr/local/opt/openssl@3/include"
```

## Package Installation

After installing system dependencies:

```bash
# Install the package
npm install conflux-local-node

# Or install with platform-specific native bindings
npm install conflux-local-node @xcfx/node-linux-x64-gnu
```

## Verification

Test the installation:

```bash
# Test the package
npx conflux-local-node test

# Or run a simple test
node -e "const { ConfluxNode } = require('conflux-local-node'); console.log('Package loaded successfully');"
```

## Troubleshooting

### OpenSSL Version Issues

If you get OpenSSL version errors:

1. Check your OpenSSL version:
   ```bash
   openssl version
   ```

2. If you have OpenSSL 1.1 but need 3.0, install OpenSSL 3.0:
   ```bash
   # Ubuntu 22.04+ has OpenSSL 3.0 by default
   sudo apt-get install -y libssl3 libcrypto3
   ```

3. For older systems, you may need to compile from source or use a different approach.

### Native Binding Issues

If native bindings fail to load:

1. Ensure you have the correct platform-specific package:
   ```bash
   npm install @xcfx/node-linux-x64-gnu  # For Linux x64
   npm install @xcfx/node-darwin-x64     # For macOS x64
   npm install @xcfx/node-darwin-arm64   # For macOS ARM64
   npm install @xcfx/node-win32-x64-msvc # For Windows x64
   ```

2. Check that the native binding file exists:
   ```bash
   find node_modules -name "*.node" | grep xcfx
   ```

3. Verify system libraries are available:
   ```bash
   ldd node_modules/@xcfx/node-linux-x64-gnu/node.linux-x64-gnu.node
   ```

### Alternative: Docker Usage

If you're having trouble with native dependencies, you can use Docker:

```dockerfile
FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache \
    build-base \
    openssl-dev \
    openssl3 \
    pkgconfig

# Install the package
RUN npm install -g conflux-local-node

CMD ["conflux-local-node", "--help"]
```

## Development Setup

For development:

```bash
# Clone the repository
git clone <repository-url>
cd conflux-local-node

# Install dependencies
npm install

# Install platform-specific native bindings
npm install @xcfx/node-linux-x64-gnu

# Build the project
npm run build

# Run tests
npm test
```

## Notes

- The `@xcfx/node` package requires native bindings that are platform-specific
- OpenSSL 3.0 is required for the native bindings to work properly
- Some older Linux distributions may not have OpenSSL 3.0 available in their repositories
- Consider using Docker for consistent environments across different systems
