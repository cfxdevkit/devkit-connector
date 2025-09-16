# Conflux Node Wrapper

A silent wrapper around `@xcfx/node` that provides clean execution flows for both complete operations and ephemeral script execution.

## Features

- **Silent Operation**: Suppresses all `@xcfx/node` log output
- **Ephemeral Execution**: Start node, execute script, clean shutdown
- **Complete Flows**: Run complex multi-step operations
- **Clean Shutdown**: Always ensures proper cleanup
- **Error Handling**: Comprehensive error handling and reporting

## Installation

```bash
cd tools/node-manager
pnpm install
pnpm run build
```

## Usage

### 1. Execute Scripts

Run a JavaScript/TypeScript script with an ephemeral node:

```bash
# Using pnpm (from project root)
pnpm run wrapper:exec -- --script examples/simple-test.js

# Direct usage
cd tools/node-manager
node dist/cli-wrapper.js exec --script examples/simple-test.js
```

### 2. Deploy Contracts

Deploy a single contract with ephemeral node:

```bash
# Deploy a contract
pnpm run wrapper:deploy -- --contract examples/SimpleStorage.sol --name "MyContract"

# With output file
pnpm run wrapper:deploy -- --contract examples/SimpleStorage.sol --output deployment.json
```

### 3. Call Contract Methods

Call a method on a deployed contract:

```bash
# Call a method
pnpm run wrapper:call -- --address 0x123... --method "getValue"

# With parameters
pnpm run wrapper:call -- --address 0x123... --method "setValue" --params '[42]'
```

### 4. Run Complete Flows

Execute a complete deployment flow:

```bash
# Run flow from config file
pnpm run wrapper:flow -- --flow examples/flow-config.json --output results.json
```

### 5. Test Wrapper

Test the wrapper functionality:

```bash
pnpm run wrapper:test
```

## Script Format

Scripts should export a default function that receives the node wrapper:

```javascript
export default async function myScript(node) {
  // Access EVM client
  const evmClient = node.getEvmClient();
  
  // Access Core client
  const coreClient = node.getCoreClient();
  
  // Get node status
  const status = await node.getStatus();
  
  // Your logic here
  return { result: 'success' };
}
```

## Flow Configuration

Flow files are JSON configurations that define multiple contracts to deploy:

```json
{
  "name": "My Deployment Flow",
  "contracts": [
    {
      "name": "Contract1",
      "code": "contract Contract1 { ... }",
      "abi": [...],
      "args": []
    }
  ]
}
```

## API Reference

### ConfluxNodeWrapper

Main wrapper class for managing ephemeral nodes.

#### Methods

- `executeScript(script, config)` - Execute a single script
- `executeCompleteFlow(flow, config)` - Execute a complete flow
- `getStatus()` - Get current node status
- `getCoreClient()` - Get Core space client
- `getEvmClient()` - Get EVM space client

### ConfluxOperations

Utility class with common operations.

#### Methods

- `deployContract(code, abi, args, config)` - Deploy a contract
- `callContractMethod(address, abi, method, args, config)` - Call contract method
- `sendTransaction(to, value, data, config)` - Send transaction
- `getBlockInfo(blockNumber, config)` - Get block information
- `runCompleteDeploymentFlow(contracts, config)` - Run complete flow

## Configuration Options

```typescript
interface NodeConfig {
  corePort?: number;        // Core RPC port (default: 12537)
  evmPort?: number;         // EVM RPC port (default: 8545)
  blockInterval?: number;   // Block generation interval (default: 1000ms)
  chainId?: number;         // Core chain ID (default: 1111)
  evmChainId?: number;      // EVM chain ID (default: 2222)
  dataDir?: string;         // Data directory (default: '.conflux-dev')
  silent?: boolean;         // Silent mode (default: false)
}
```

## Examples

### Simple Contract Deployment

```javascript
// examples/simple-deploy.js
export default async function deploySimpleContract(node) {
  const { ethers } = await import('ethers');
  
  const contractCode = `
    contract SimpleStorage {
        uint256 private value;
        
        function setValue(uint256 _value) public {
            value = _value;
        }
        
        function getValue() public view returns (uint256) {
            return value;
        }
    }
  `;

  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const wallet = new ethers.Wallet('0x...', provider);
  
  const factory = new ethers.ContractFactory(abi, contractCode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  
  return {
    address: await contract.getAddress(),
    txHash: contract.deploymentTransaction()?.hash
  };
}
```

### Complete Delegation Flow

```javascript
// examples/delegation-flow.js
export default async function delegationFlow(node) {
  // Deploy delegation contract
  // Create delegation
  // Test delegation
  // Revoke delegation
  // Return results
}
```

## Error Handling

The wrapper provides comprehensive error handling:

- **Timeout Errors**: Node fails to start within timeout
- **Execution Errors**: Script execution fails
- **Cleanup Errors**: Shutdown fails (logged but not thrown)
- **Network Errors**: RPC connection issues

All errors are captured and returned in the `ExecutionResult`:

```typescript
interface ExecutionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
}
```

## Best Practices

1. **Always use try-catch** in your scripts
2. **Return meaningful data** from your scripts
3. **Use silent mode** for automated operations
4. **Handle errors gracefully** in your scripts
5. **Keep scripts focused** on single operations
6. **Use flow configs** for complex multi-step operations

## Troubleshooting

### Node Fails to Start
- Check if ports are available
- Increase timeout in configuration
- Check `@xcfx/node` installation

### Script Execution Fails
- Verify script exports a function
- Check script syntax
- Ensure proper error handling

### Cleanup Issues
- Wrapper handles cleanup automatically
- Check for hanging processes
- Restart if needed

## Integration

The wrapper integrates with the main project:

- **Package Scripts**: Available via `pnpm run wrapper:*`
- **Orchestrator**: Can be used in orchestrator scripts
- **CI/CD**: Suitable for automated testing
- **Development**: Perfect for local testing

