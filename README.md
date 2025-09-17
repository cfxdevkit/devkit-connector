# Conflux Monorepo
<img width="1403" height="882" alt="image" src="https://github.com/user-attachments/assets/4958b6f6-884c-457b-bf3f-7cbca44e0639" />

A monorepo containing tools and libraries for Conflux blockchain development.

## Structure

```
conflux-monorepo/
├── packages/
│   └── conflux-local-node/     # Local Conflux node management
├── apps/
│   └── example-usage/          # Example application using the library
└── utils/                      # Shared utilities and tools
```

## Packages

### @conflux-local/node

A standalone package for running a local Conflux node using `@xcfx/node` for development and testing.

**Features:**

- Easy setup and configuration
- Dual space support (Core and EVM/eSpace)
- Ephemeral execution for testing
- Contract deployment tools
- Wallet management (mnemonic and private key modes)
- CLI interface
- TypeScript support
- Silent mode for CI/CD

**Usage:**

```bash
# As a workspace dependency
pnpm add @conflux-local/node@workspace:*

# Or install from npm (when published)
pnpm add @conflux-local/node
```

**Quick Start:**

```bash
# Start a local node
pnpm conflux-node start

# Run in development mode
pnpm conflux-node dev

# View wallet information
pnpm conflux-node wallets
```

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm run test

# Clean build artifacts
pnpm run clean
```

### Working with the Monorepo

```bash
# Add a dependency to a specific package
pnpm add <package> --filter @conflux-local/node

# Run a command in a specific package
pnpm run build --filter @conflux-local/node

# Run a command in all packages
pnpm run build --recursive
```

### Example Usage

See the `apps/example-usage` directory for examples of how to use the `@conflux-local/node` package as a library.

## Docker Support

The `conflux-local-node` package includes Docker support for easy deployment:

```bash
# Build the Docker image
docker build -t conflux-local-node packages/conflux-local-node/

# Run the container
docker run -it --rm -p 12537:12537 -p 8545:8545 conflux-local-node
```

## License

MIT
