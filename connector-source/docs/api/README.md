# API Documentation

This directory contains comprehensive API documentation for the Conflux Dual Wallet System.

## Table of Contents

- [Authentication](./authentication.md)
- [Wallet Management](./wallet-management.md)
- [Delegation System](./delegation-system.md)
- [Chain Operations](./chain-operations.md)
- [Security](./security.md)
- [Webhooks](./webhooks.md)
- [Error Handling](./error-handling.md)

## Quick Start

The API is RESTful and follows standard HTTP conventions. All endpoints return JSON responses.

### Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

### Authentication

Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Rate Limiting

API requests are rate-limited to prevent abuse:
- **General endpoints**: 100 requests per 15 minutes
- **Wallet operations**: 50 requests per 15 minutes
- **Delegation operations**: 20 requests per 15 minutes

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "message": "Operation completed successfully"
}
```

## SDK Usage

The system provides SDKs for easy integration:

### JavaScript/TypeScript

```typescript
import { ConfluxWallet } from '@conflux-wallet/client';

const wallet = new ConfluxWallet({
  serverUrl: 'https://your-domain.com/api',
  mode: 'user-delegated'
});

// Create delegation session
const session = await wallet.delegateWallet({
  sessionDuration: 60,
  allowedOperations: ['sign_transaction', 'sign_message']
});

// Send transaction
const txHash = await wallet.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b8D4B17dd07E2b9e84',
  value: '1000000000000000000'
});
```

### React Hooks

```typescript
import { useConfluxWallet } from '@conflux-wallet/client';

function MyComponent() {
  const { 
    mode, 
    addresses, 
    sendTransaction, 
    delegateWallet 
  } = useConfluxWallet();

  return (
    <div>
      <p>Mode: {mode}</p>
      <p>eSpace Address: {addresses?.eSpace}</p>
      <p>Core Address: {addresses?.core}</p>
    </div>
  );
}
```

## Examples

See the [examples directory](../examples/) for complete implementation examples.
