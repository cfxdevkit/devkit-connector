# @conflux-devkit/ui-components

> **Web Components for Conflux DevKit applications**

[![npm version](https://img.shields.io/npm/v/@conflux-devkit/ui-components)](https://www.npmjs.com/package/@conflux-devkit/ui-components)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🎯 Overview

The UI components package provides production-ready Web Components built with Lit for Conflux DevKit applications. These components are framework-agnostic and can be used in any web application, providing a consistent UI experience across different frameworks.

## ✨ Features

- **🧩 Web Components**: Framework-agnostic components built with Lit
- **💼 Wallet Components**: Wallet display, creation, and management
- **📦 Contract Components**: Contract interaction and deployment
- **🌐 Network Components**: Network selection and status display
- **🖥️ Node Components**: Node status and control
- **🎨 Theming**: Built-in theming and customization
- **📱 Responsive**: Mobile-first responsive design
- **♿ Accessibility**: WCAG compliant components

## 📦 Installation

```bash
pnpm add @conflux-devkit/ui-components
# or
npm install @conflux-devkit/ui-components
# or
yarn add @conflux-devkit/ui-components
```

## 🚀 Quick Start

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      type="module"
      src="https://unpkg.com/@conflux-devkit/ui-components/dist/index.js"
    ></script>
  </head>
  <body>
    <!-- Wallet Card -->
    <conflux-wallet-card
      address="0x1234567890abcdef..."
      balance="1.5"
      balance-formatted="1.5 CFX"
      is-mining="false"
    ></conflux-wallet-card>

    <!-- Contract Card -->
    <conflux-contract-card
      name="MyToken"
      address="0x5678901234abcdef..."
      chain-type="evm"
      network-id="2030"
      methods='{"read":["totalSupply"],"write":["transfer"],"events":["Transfer"]}'
    ></conflux-contract-card>

    <!-- Node Status -->
    <conflux-node-status
      running="true"
      chain-id="2029"
      evm-chain-id="2030"
      block-number="12345"
      peer-count="5"
    ></conflux-node-status>

    <!-- Network Selector -->
    <conflux-network-selector
      current-network="2030"
      available-networks='[{"name":"Conflux Mainnet EVM","chainId":"2030"}]'
    ></conflux-network-selector>
  </body>
</html>
```

## 📚 Component Reference

### Wallet Components

#### `<conflux-wallet-card>`

Displays wallet information with balance and actions.

**Attributes:**

- `address` (string): Wallet address
- `balance` (string): Wallet balance
- `balance-formatted` (string): Formatted balance
- `is-mining` (boolean): Whether wallet is mining
- `theme` (string): Theme variant ('light' | 'dark')

**Events:**

- `refresh-balance`: Fired when refresh button is clicked
- `send-transaction`: Fired when send button is clicked

**Example:**

```html
<conflux-wallet-card
  address="0x1234567890abcdef..."
  balance="1000000000000000000"
  balance-formatted="1.0 CFX"
  is-mining="false"
  theme="light"
></conflux-wallet-card>
```

#### `<conflux-wallet-list>`

Displays a list of wallets with management options.

**Attributes:**

- `wallets` (string): JSON string of wallet array
- `active-wallet` (string): Address of active wallet
- `theme` (string): Theme variant

**Events:**

- `wallet-selected`: Fired when a wallet is selected
- `wallet-created`: Fired when create wallet is clicked
- `wallet-imported`: Fired when import wallet is clicked

**Example:**

```html
<conflux-wallet-list
  wallets='[{"address":"0x1234...","balance":"1.0 CFX"}]'
  active-wallet="0x1234..."
  theme="light"
></conflux-wallet-list>
```

### Contract Components

#### `<conflux-contract-card>`

Displays contract information with interaction capabilities.

**Attributes:**

- `name` (string): Contract name
- `address` (string): Contract address
- `chain-type` (string): Chain type ('core' | 'evm')
- `network-id` (string): Network ID
- `methods` (string): JSON string of available methods
- `capabilities` (string): JSON string of contract capabilities
- `theme` (string): Theme variant

**Events:**

- `method-called`: Fired when a method is called
- `transaction-sent`: Fired when a transaction is sent
- `event-subscribed`: Fired when subscribing to events

**Example:**

```html
<conflux-contract-card
  name="MyToken"
  address="0x5678901234abcdef..."
  chain-type="evm"
  network-id="2030"
  methods='{"read":["totalSupply"],"write":["transfer"],"events":["Transfer"]}'
  capabilities='{"read":true,"write":true,"events":true}'
  theme="light"
></conflux-contract-card>
```

#### `<conflux-contract-list>`

Displays a list of contracts with management options.

**Attributes:**

- `contracts` (string): JSON string of contract array
- `active-contract` (string): Address of active contract
- `theme` (string): Theme variant

**Events:**

- `contract-selected`: Fired when a contract is selected
- `contract-deployed`: Fired when deploy contract is clicked
- `contract-imported`: Fired when import contract is clicked

**Example:**

```html
<conflux-contract-list
  contracts='[{"name":"MyToken","address":"0x5678..."}]'
  active-contract="0x5678..."
  theme="light"
></conflux-contract-list>
```

### Network Components

#### `<conflux-network-selector>`

Network selection dropdown with status indicators.

**Attributes:**

- `current-network` (string): Current network ID
- `available-networks` (string): JSON string of available networks
- `is-switching` (boolean): Whether network is switching
- `theme` (string): Theme variant

**Events:**

- `network-changed`: Fired when network is changed
- `network-switch-started`: Fired when network switch starts
- `network-switch-completed`: Fired when network switch completes

**Example:**

```html
<conflux-network-selector
  current-network="2030"
  available-networks='[{"name":"Conflux Mainnet EVM","chainId":"2030"}]'
  is-switching="false"
  theme="light"
></conflux-network-selector>
```

#### `<conflux-network-status>`

Displays current network status and information.

**Attributes:**

- `network` (string): JSON string of network configuration
- `is-connected` (boolean): Whether connected to network
- `connection-error` (string): Connection error message
- `theme` (string): Theme variant

**Events:**

- `connect-clicked`: Fired when connect button is clicked
- `disconnect-clicked`: Fired when disconnect button is clicked

**Example:**

```html
<conflux-network-status
  network='{"name":"Conflux Mainnet EVM","chainId":"2030"}'
  is-connected="true"
  theme="light"
></conflux-network-status>
```

### Node Components

#### `<conflux-node-status>`

Displays node status and control options.

**Attributes:**

- `running` (boolean): Whether node is running
- `chain-id` (string): Chain ID
- `evm-chain-id` (string): EVM Chain ID
- `block-number` (string): Current block number
- `peer-count` (string): Number of peers
- `uptime` (string): Node uptime
- `theme` (string): Theme variant

**Events:**

- `start-clicked`: Fired when start button is clicked
- `stop-clicked`: Fired when stop button is clicked
- `restart-clicked`: Fired when restart button is clicked

**Example:**

```html
<conflux-node-status
  running="true"
  chain-id="2029"
  evm-chain-id="2030"
  block-number="12345"
  peer-count="5"
  uptime="3600"
  theme="light"
></conflux-node-status>
```

#### `<conflux-node-control>`

Node control panel with start/stop/restart options.

**Attributes:**

- `is-running` (boolean): Whether node is running
- `is-starting` (boolean): Whether node is starting
- `is-stopping` (boolean): Whether node is stopping
- `error` (string): Error message
- `theme` (string): Theme variant

**Events:**

- `node-start`: Fired when start is requested
- `node-stop`: Fired when stop is requested
- `node-restart`: Fired when restart is requested

**Example:**

```html
<conflux-node-control
  is-running="true"
  is-starting="false"
  is-stopping="false"
  theme="light"
></conflux-node-control>
```

## 🧪 Examples

### React Integration

```typescript
import React, { useEffect, useRef } from 'react';

function WalletComponent() {
  const walletCardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleRefreshBalance = (event: CustomEvent) => {
      console.log('Refresh balance for:', event.detail.address);
      // Handle refresh logic
    };

    const handleSendTransaction = (event: CustomEvent) => {
      console.log('Send transaction:', event.detail);
      // Handle send transaction logic
    };

    const element = walletCardRef.current;
    if (element) {
      element.addEventListener('refresh-balance', handleRefreshBalance);
      element.addEventListener('send-transaction', handleSendTransaction);

      return () => {
        element.removeEventListener('refresh-balance', handleRefreshBalance);
        element.removeEventListener('send-transaction', handleSendTransaction);
      };
    }
  }, []);

  return (
    <conflux-wallet-card
      ref={walletCardRef}
      address="0x1234567890abcdef..."
      balance="1000000000000000000"
      balance-formatted="1.0 CFX"
      is-mining="false"
      theme="light"
    />
  );
}
```

### Vue Integration

```vue
<template>
  <conflux-contract-card
    :name="contract.name"
    :address="contract.address"
    :chain-type="contract.chainType"
    :network-id="contract.networkId"
    :methods="JSON.stringify(contract.methods)"
    :capabilities="JSON.stringify(contract.capabilities)"
    theme="light"
    @method-called="handleMethodCalled"
    @transaction-sent="handleTransactionSent"
  />
</template>

<script>
export default {
  data() {
    return {
      contract: {
        name: 'MyToken',
        address: '0x5678901234abcdef...',
        chainType: 'evm',
        networkId: '2030',
        methods: {
          read: ['totalSupply'],
          write: ['transfer'],
          events: ['Transfer'],
        },
        capabilities: {
          read: true,
          write: true,
          events: true,
        },
      },
    };
  },
  methods: {
    handleMethodCalled(event) {
      console.log('Method called:', event.detail);
    },
    handleTransactionSent(event) {
      console.log('Transaction sent:', event.detail);
    },
  },
};
</script>
```

### Angular Integration

```typescript
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-wallet',
  template: `
    <conflux-wallet-card
      #walletCard
      [address]="wallet.address"
      [balance]="wallet.balance"
      [balance-formatted]="wallet.balanceFormatted"
      [is-mining]="wallet.isMining"
      theme="light"
    ></conflux-wallet-card>
  `,
})
export class WalletComponent implements AfterViewInit {
  @ViewChild('walletCard') walletCard!: ElementRef;

  wallet = {
    address: '0x1234567890abcdef...',
    balance: '1000000000000000000',
    balanceFormatted: '1.0 CFX',
    isMining: false,
  };

  ngAfterViewInit() {
    this.walletCard.nativeElement.addEventListener(
      'refresh-balance',
      (event: CustomEvent) => {
        console.log('Refresh balance for:', event.detail.address);
      }
    );
  }
}
```

### Vanilla JavaScript

```javascript
// Create wallet card
const walletCard = document.createElement('conflux-wallet-card');
walletCard.setAttribute('address', '0x1234567890abcdef...');
walletCard.setAttribute('balance', '1000000000000000000');
walletCard.setAttribute('balance-formatted', '1.0 CFX');
walletCard.setAttribute('is-mining', 'false');
walletCard.setAttribute('theme', 'light');

// Add event listeners
walletCard.addEventListener('refresh-balance', event => {
  console.log('Refresh balance for:', event.detail.address);
  // Handle refresh logic
});

walletCard.addEventListener('send-transaction', event => {
  console.log('Send transaction:', event.detail);
  // Handle send transaction logic
});

// Add to DOM
document.body.appendChild(walletCard);
```

## 🎨 Theming

### CSS Custom Properties

```css
:root {
  --conflux-primary-color: #007bff;
  --conflux-secondary-color: #6c757d;
  --conflux-success-color: #28a745;
  --conflux-danger-color: #dc3545;
  --conflux-warning-color: #ffc107;
  --conflux-info-color: #17a2b8;
  --conflux-light-color: #f8f9fa;
  --conflux-dark-color: #343a40;
  --conflux-border-radius: 0.375rem;
  --conflux-box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  --conflux-font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

### Dark Theme

```css
[data-theme='dark'] {
  --conflux-primary-color: #0d6efd;
  --conflux-secondary-color: #6c757d;
  --conflux-success-color: #198754;
  --conflux-danger-color: #dc3545;
  --conflux-warning-color: #ffc107;
  --conflux-info-color: #0dcaf0;
  --conflux-light-color: #212529;
  --conflux-dark-color: #f8f9fa;
  --conflux-bg-color: #212529;
  --conflux-text-color: #f8f9fa;
}
```

## 🔧 Configuration

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Build Configuration

```typescript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
```

## 🔗 Dependencies

- **lit**: Web Components library
- **@conflux-devkit/core**: Core types and utilities

## 📊 Bundle Size

- **Minified**: ~30KB
- **Gzipped**: ~10KB
- **Tree-shakeable**: Import only what you need

## ♿ Accessibility

- **WCAG 2.1 AA**: Components meet accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Color Contrast**: Meets contrast ratio requirements

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

---

**Part of the Conflux DevKit ecosystem** 🚀
