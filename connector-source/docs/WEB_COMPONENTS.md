# Web Components Guide

This guide covers using the Conflux Dual Wallet System as web components that work in any framework or vanilla JavaScript.

## 🎯 Overview

Web components provide:
- **Framework Agnostic**: Works with React, Vue, Angular, or vanilla JS
- **Shadow DOM**: Encapsulated styling and behavior
- **Custom Events**: Rich event system for integration
- **TypeScript Support**: Full type safety
- **Theming**: Light/dark theme support
- **Responsive**: Mobile-friendly design

## 🚀 Quick Start

### 1. Install Package

```bash
npm install @conflux-wallet/web-components
```

### 2. Import and Use

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/@conflux-wallet/web-components/dist/conflux-wallet-components.umd.js"></script>
</head>
<body>
  <delegation-manager
    network="confluxEspaceTestnet"
    user-address="0x..."
    theme="light">
  </delegation-manager>
</body>
</html>
```

### 3. ES Module Usage

```javascript
import '@conflux-wallet/web-components';

// Components are auto-registered
const delegationManager = document.createElement('delegation-manager');
delegationManager.setAttribute('network', 'confluxEspaceTestnet');
delegationManager.setAttribute('user-address', '0x...');
document.body.appendChild(delegationManager);
```

## 📦 Available Components

### DelegationManager

Manages wallet delegations with full CRUD operations.

```html
<delegation-manager
  network="confluxEspaceTestnet"
  user-address="0x742d35Cc6634C0532925a3b8D0C0C4C4C4C4C4C4"
  theme="light"
  auto-refresh="true"
  refresh-interval="30000"
  debug="true">
</delegation-manager>
```

**Attributes:**
- `network` - Network to connect to
- `user-address` - Address of the user
- `theme` - Theme (light/dark)
- `auto-refresh` - Enable auto-refresh
- `refresh-interval` - Refresh interval in milliseconds
- `debug` - Enable debug logging

**Events:**
- `delegation-created` - When a delegation is created
- `delegation-revoked` - When a delegation is revoked
- `limits-updated` - When limits are updated
- `contract-error` - When an error occurs

### TransactionExecutor

Executes transactions through delegation.

```html
<transaction-executor
  network="confluxEspaceTestnet"
  delegation-id="1"
  theme="light"
  auto-sign="false"
  show-advanced="true"
  debug="true">
</transaction-executor>
```

**Attributes:**
- `network` - Network to connect to
- `delegation-id` - ID of the delegation to use
- `theme` - Theme (light/dark)
- `auto-sign` - Enable auto-signing
- `show-advanced` - Show advanced options
- `debug` - Enable debug logging

**Events:**
- `transaction-executed` - When a transaction is executed
- `execution-checked` - When execution is checked
- `form-validated` - When form validation occurs
- `contract-error` - When an error occurs

## 🔧 Framework Integration

### React

```jsx
import { useEffect, useRef } from 'react';
import '@conflux-wallet/web-components';

function MyComponent() {
  const delegationRef = useRef(null);
  
  useEffect(() => {
    if (delegationRef.current) {
      delegationRef.current.addEventListener('delegation-created', (e) => {
        console.log('Delegation created:', e.detail);
      });
    }
  }, []);
  
  return (
    <delegation-manager
      ref={delegationRef}
      network="confluxEspaceTestnet"
      user-address="0x..."
    />
  );
}
```

### Vue

```vue
<template>
  <delegation-manager
    ref="delegationManager"
    network="confluxEspaceTestnet"
    user-address="userAddress"
    @delegation-created="onDelegationCreated"
  />
</template>

<script>
export default {
  data() {
    return {
      userAddress: '0x...'
    };
  },
  methods: {
    onDelegationCreated(event) {
      console.log('Delegation created:', event.detail);
    }
  }
}
</script>
```

### Angular

```typescript
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-wallet',
  template: `
    <delegation-manager
      #delegationManager
      network="confluxEspaceTestnet"
      user-address="userAddress">
    </delegation-manager>
  `
})
export class WalletComponent implements AfterViewInit {
  @ViewChild('delegationManager') delegationManager!: ElementRef;
  userAddress = '0x...';

  ngAfterViewInit() {
    this.delegationManager.nativeElement.addEventListener('delegation-created', (e: any) => {
      console.log('Delegation created:', e.detail);
    });
  }
}
```

### Vanilla JavaScript

```javascript
// Create component programmatically
const delegationManager = document.createElement('delegation-manager');
delegationManager.setAttribute('network', 'confluxEspaceTestnet');
delegationManager.setAttribute('user-address', '0x...');

// Listen for events
delegationManager.addEventListener('delegation-created', (e) => {
  console.log('Delegation created:', e.detail);
});

// Add to DOM
document.body.appendChild(delegationManager);
```

## 🎨 Styling and Theming

### CSS Custom Properties

Components support CSS custom properties for theming:

```css
delegation-manager {
  --primary-color: #3b82f6;
  --secondary-color: #6b7280;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  --background-color: #ffffff;
  --text-color: #111827;
  --border-color: #e5e7eb;
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

/* Dark theme */
delegation-manager[theme="dark"] {
  --background-color: #1f2937;
  --text-color: #f9fafb;
  --border-color: #374151;
}
```

### Custom Styling

You can style components using CSS:

```css
delegation-manager {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

delegation-manager .delegation-item {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 1rem;
}
```

## 📡 Event System

### Event Types

**Delegation Manager Events:**
- `delegation-created` - Delegation created successfully
- `delegation-revoked` - Delegation revoked
- `limits-updated` - Delegation limits updated
- `contract-error` - Contract operation failed

**Transaction Executor Events:**
- `transaction-executed` - Transaction executed successfully
- `execution-checked` - Execution feasibility checked
- `form-validated` - Form validation completed
- `contract-error` - Contract operation failed

### Event Details

Events include detailed information in the `detail` property:

```javascript
delegationManager.addEventListener('delegation-created', (event) => {
  console.log('Delegation ID:', event.detail.delegationId);
  console.log('Delegate:', event.detail.delegate);
  console.log('Daily Limit:', event.detail.dailyLimit);
});
```

## 🔧 Configuration

### Network Configuration

Supported networks:
- `confluxEspace` - Conflux eSpace Mainnet
- `confluxEspaceTestnet` - Conflux eSpace Testnet
- `confluxCore` - Conflux Core Mainnet
- `confluxCoreTestnet` - Conflux Core Testnet
- `hardhat` - Local Hardhat node
- `localhost` - Local development

### RPC Configuration

```html
<delegation-manager
  network="confluxEspaceTestnet"
  rpc-url="https://custom-rpc-url.com">
</delegation-manager>
```

## 🧪 Testing

### Unit Testing

```javascript
import { DelegationManagerComponent } from '@conflux-wallet/web-components';

describe('DelegationManagerComponent', () => {
  let component;

  beforeEach(() => {
    component = new DelegationManagerComponent();
    document.body.appendChild(component);
  });

  afterEach(() => {
    document.body.removeChild(component);
  });

  it('should create delegation', async () => {
    const event = new CustomEvent('delegation-created', {
      detail: { delegationId: 1 }
    });
    
    component.dispatchEvent(event);
    // Test assertions
  });
});
```

### Integration Testing

```javascript
// Test with real contract interaction
const component = document.createElement('delegation-manager');
component.setAttribute('network', 'hardhat');
component.setAttribute('user-address', '0x...');

document.body.appendChild(component);

// Wait for component to initialize
await new Promise(resolve => setTimeout(resolve, 1000));

// Test component functionality
const delegations = component.getDelegations();
expect(delegations).toBeDefined();
```

## 📦 Build Configuration

### Rollup Configuration

```javascript
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/conflux-wallet-components.umd.js',
    format: 'umd',
    name: 'ConfluxWalletComponents'
  },
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    typescript()
  ]
};
```

### Webpack Configuration

```javascript
module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'conflux-wallet-components.js',
    library: 'ConfluxWalletComponents',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  }
};
```

## 🚨 Troubleshooting

### Common Issues

1. **Component Not Rendering**
   - Check if components are properly imported
   - Verify custom element registration
   - Check browser console for errors

2. **Events Not Firing**
   - Ensure event listeners are attached after component creation
   - Check event names are correct
   - Verify component is connected to DOM

3. **Styling Issues**
   - Check CSS custom properties
   - Verify theme attribute
   - Ensure proper CSS specificity

4. **Contract Errors**
   - Verify network configuration
   - Check RPC URL accessibility
   - Ensure proper private key setup

### Debug Mode

Enable debug mode for detailed logging:

```html
<delegation-manager debug="true">
</delegation-manager>
```

## 📚 Additional Resources

- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry)
- [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [Conflux Documentation](https://docs.confluxnetwork.org/)

## 🤝 Support

For issues and questions:
- Check the troubleshooting section
- Review the examples
- Open an issue in the repository
- Consult the API documentation
