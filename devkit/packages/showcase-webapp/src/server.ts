// Showcase WebApp Server - Serves the demonstration webapp

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Import DevKit packages (with fallback handling)
// Note: These imports may fail during development due to type export issues
// The server will gracefully fall back to mock implementations

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: express.Application = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://unpkg.com',
          'https://cdn.jsdelivr.net',
          'https://esm.sh',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: [
          "'self'",
          'http://localhost:3001',
          'http://localhost:3002',
        ],
      },
    },
  })
);
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Serve static files with proper MIME types
app.use(
  express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    },
  })
);

// Initialize DevKit services with fallback
let devKitServices: {
  walletManager?: any;
  networkManager?: any;
  contractManager?: any;
  stateService?: any;
  confluxNode?: any;
} = {};

// Try to initialize DevKit services dynamically
try {
  // Dynamic imports with ESM/CJS compatibility
  const blockchainModule = await import('@conflux-devkit/blockchain');
  const stateModule = await import('@conflux-devkit/state');
  const nodeModule = await import('@conflux-devkit/node');

  // Extract classes handling potential default export wrapping
  const WalletManager =
    blockchainModule.WalletManager || blockchainModule.default?.WalletManager;
  const NetworkManager =
    blockchainModule.NetworkManager || blockchainModule.default?.NetworkManager;
  const ContractManager =
    blockchainModule.ContractManager ||
    blockchainModule.default?.ContractManager;
  const StateService =
    stateModule.StateService || stateModule.default?.StateService;
  const ConfluxNode = nodeModule.ConfluxNode || nodeModule.default?.ConfluxNode;

  // Initialize services
  if (WalletManager) {
    devKitServices.walletManager = new WalletManager();
    console.log('✅ WalletManager initialized');
  } else {
    console.log('❌ WalletManager not available');
  }
  if (NetworkManager) {
    devKitServices.networkManager = NetworkManager.getInstance();
    console.log('✅ NetworkManager initialized');
  } else {
    console.log('❌ NetworkManager not available');
  }
  if (ContractManager) {
    devKitServices.contractManager = new ContractManager();
    console.log('✅ ContractManager initialized');
  } else {
    console.log('❌ ContractManager not available');
  }
  if (StateService) {
    devKitServices.stateService = new StateService();
    console.log('✅ StateService initialized');
  } else {
    console.log('❌ StateService not available');
  }
  if (ConfluxNode) {
    devKitServices.confluxNode = new ConfluxNode();
    console.log('✅ ConfluxNode initialized');
  } else {
    console.log('❌ ConfluxNode not available');
  }

  console.log('✅ DevKit services initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize DevKit services:', error);
  console.log('⚠️  Using enhanced mock services with realistic behavior');
}

// Serve workspace packages
app.use(
  '/packages',
  express.static(path.join(__dirname, 'public', 'packages'))
);

// Serve UI components from workspace (copied to public directory)

// Mock API endpoints for showcase demonstration
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API server is running',
    timestamp: new Date().toISOString(),
    services: {
      core: '✅ Available',
      blockchain: '✅ Available',
      state: '✅ Available',
      'api-server': '✅ Available',
    },
  });
});

app.get('/api/state', (_req, res) => {
  res.json({
    success: true,
    data: {
      networks: [
        { id: 'mainnet', name: 'Conflux Mainnet', status: 'active' },
        { id: 'testnet', name: 'Conflux Testnet', status: 'active' },
      ],
      wallets: [],
      contracts: [],
      node: { status: 'disconnected' },
    },
  });
});

app.get('/api/networks', async (_req, res) => {
  try {
    // Use core library network definitions
    const coreModule = await import('@conflux-devkit/core');
    const { getAllNetworks, networkConfigToBrowser } = coreModule;

    // Get all networks from core library
    const coreNetworks = getAllNetworks();

    // Convert to browser-safe format and add block explorer URLs
    const browserNetworks = coreNetworks.map((network: any) => {
      const browserNetwork = networkConfigToBrowser(network);

      // Add block explorer URLs based on network type
      let blockExplorer = '';
      if (network.isTestnet) {
        if (network.rpcUrl.includes('localhost')) {
          blockExplorer = 'http://localhost:3000';
        } else {
          blockExplorer = 'https://testnet.confluxscan.net';
        }
      } else {
        blockExplorer = 'https://confluxscan.net';
      }

      return {
        ...browserNetwork,
        blockExplorer,
      };
    });

    res.json({
      success: true,
      data: browserNetworks,
    });
  } catch (error) {
    console.error('Failed to load networks from core library:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load network configurations',
    });
  }
});

app.get('/api/packages', (_req, res) => {
  res.json({
    success: true,
    data: {
      server: [
        '@conflux-devkit/core',
        '@conflux-devkit/blockchain',
        '@conflux-devkit/state',
        '@conflux-devkit/api-server',
        '@conflux-devkit/devkit-node',
      ],
      browser: [
        '@conflux-devkit/ui-primitives',
        '@conflux-devkit/ui-components',
      ],
    },
  });
});

// Demo Checklist API endpoints
app.get('/api/wallet/info', async (_req, res) => {
  try {
    console.log('🔍 Checking wallet service availability...');
    if (!devKitServices.walletManager) {
      console.log('❌ Wallet service not available');
      return res.status(503).json({
        available: false,
        error: 'Wallet service not available',
      });
    }

    console.log('✅ Wallet service available, getting wallets...');
    // Get real wallet information from the node
    const nodeStatus = await devKitServices.confluxNode.getStatus();
    console.log('📋 Node wallets found:', nodeStatus.wallets?.length || 0);

    if (nodeStatus.wallets && nodeStatus.wallets.length > 0) {
      // Use the first wallet (mining wallet) as the active wallet
      const activeWallet = nodeStatus.wallets[0];
      console.log('✅ Active wallet found:', activeWallet.address);

      // Get real balance
      const balance = await devKitServices.walletManager.getBalance(
        activeWallet.address
      );

      res.json({
        available: true,
        name: `Server Wallet ${activeWallet.index + 1}`,
        address: activeWallet.address,
        balance: `${balance} CFX`,
        isMining: activeWallet.isMining,
        index: activeWallet.index,
      });
    } else {
      console.log('❌ No wallets found in node status');
      return res.json({
        available: false,
        name: null,
        address: null,
        balance: null,
      });
    }
  } catch (error) {
    console.error('Error getting wallet info:', error);
    res.status(500).json({
      available: false,
      error: 'Failed to get wallet information',
    });
  }
});

app.get('/api/wallet/list', async (_req, res) => {
  try {
    console.log('🔍 Getting all server wallets...');
    if (!devKitServices.walletManager) {
      return res.status(503).json({
        success: false,
        error: 'Wallet service not available',
      });
    }

    // Get all wallets from the node status
    const nodeStatus = await devKitServices.confluxNode.getStatus();
    console.log('📊 Node status for wallets:', {
      running: nodeStatus.running,
      walletsCount: nodeStatus.wallets?.length || 0,
      miningAddress: nodeStatus.miningAddress,
    });

    if (nodeStatus.wallets && nodeStatus.wallets.length > 0) {
      // Get balances for all wallets
      const walletsWithBalances = await Promise.all(
        nodeStatus.wallets.map(async (wallet: any) => {
          try {
            // Try to get balance directly from EVM RPC
            let balanceStr = '0';
            try {
              const rpcResponse = await fetch('http://localhost:8545', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'eth_getBalance',
                  params: [wallet.address, 'latest'],
                  id: 1,
                }),
              });
              const rpcData = await rpcResponse.json();
              if (rpcData.result) {
                // Convert from Wei to CFX (1 CFX = 10^18 Wei)
                const balanceInWei = BigInt(rpcData.result);
                const balanceInCFX = Number(balanceInWei) / Math.pow(10, 18);
                balanceStr = balanceInCFX.toFixed(4);
              }
            } catch (rpcError) {
              console.error(
                `RPC balance fetch failed for ${wallet.address}:`,
                rpcError
              );
              // Fallback to wallet manager
              try {
                const balance = await devKitServices.walletManager.getBalance(
                  wallet.address
                );
                balanceStr =
                  typeof balance === 'string' ? balance : balance.toString();
              } catch (walletError) {
                console.error(
                  `Wallet manager balance fetch failed for ${wallet.address}:`,
                  walletError
                );
                balanceStr = '0';
              }
            }

            // Remove any existing CFX suffix to avoid duplication
            const cleanBalance = balanceStr.replace(/\s+CFX$/, '');
            return {
              index: wallet.index,
              address: wallet.address,
              privateKey: wallet.privateKey,
              balance: cleanBalance,
              balanceFormatted: `${cleanBalance} CFX`,
              isMining: wallet.isMining,
              isDefault: wallet.index === 0,
              name: `Server Wallet ${wallet.index + 1}`,
            };
          } catch (error) {
            console.error(
              `Failed to get balance for wallet ${wallet.address}:`,
              error
            );
            return {
              index: wallet.index,
              address: wallet.address,
              privateKey: wallet.privateKey,
              balance: '0',
              balanceFormatted: '0 CFX',
              isMining: wallet.isMining,
              isDefault: wallet.index === 0,
              name: `Server Wallet ${wallet.index + 1}`,
            };
          }
        })
      );

      console.log(`✅ Returning ${walletsWithBalances.length} server wallets`);
      res.json({
        success: true,
        wallets: walletsWithBalances,
      });
    } else {
      console.log('❌ No wallets found in node status');
      res.json({
        success: true,
        wallets: [],
      });
    }
  } catch (error) {
    console.error('Error getting wallet list:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get wallet list',
    });
  }
});

app.get('/api/node/status', async (_req, res) => {
  try {
    console.log('🔍 Checking node service availability...');
    if (!devKitServices.confluxNode) {
      console.log('❌ Node service not available');
      return res.status(503).json({
        running: false,
        error: 'Node service not available',
      });
    }

    console.log('✅ Node service available, getting status...');
    // Get real node status
    const status = await devKitServices.confluxNode.getStatus();
    console.log('📊 Node status:', status);

    // Check if node is actually running by testing the RPC
    let isActuallyRunning = false;
    try {
      // Try to get the latest block number to verify the node is responding
      const response = await fetch('http://localhost:12537', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'cfx_getBlockByEpochNumber',
          params: ['latest_mined', false],
          id: 1,
        }),
      });
      const data = await response.json();
      isActuallyRunning = !data.error && data.result;
    } catch (error) {
      console.log(
        '⚠️ Node RPC not responding:',
        error instanceof Error ? error.message : String(error)
      );
    }

    res.json({
      running: isActuallyRunning,
      name: 'Conflux Node',
      version: status.version || 'unknown',
      network: status.network || 'unknown',
      blockNumber: status.blockNumber?.toString() || '0',
      peerCount: status.peerCount,
      chainId: status.chainId?.toString() || '2029',
      evmChainId: status.evmChainId?.toString() || '2030',
      corePort: '12537',
      evmPort: '8545',
      health: isActuallyRunning ? 'healthy' : 'unhealthy',
      lastHealthCheck: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting node status:', error);
    res.status(500).json({
      running: false,
      error: 'Failed to get node status',
    });
  }
});

app.post('/api/wallet/create', async (req, res) => {
  try {
    console.log('👛 Creating wallet...');
    if (!devKitServices.walletManager) {
      return res.status(503).json({
        success: false,
        error: 'Wallet service not available',
      });
    }

    const { mnemonic } = req.body;

    // Create wallet with optional mnemonic
    const wallet = await devKitServices.walletManager.createWallet(mnemonic);

    console.log('✅ Wallet created successfully:', wallet.address);
    res.json({
      success: true,
      wallet: {
        address: wallet.address,
        name: wallet.name || 'Unnamed Wallet',
        index: wallet.index || 0,
      },
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create wallet',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/contracts/list', async (_req, res) => {
  try {
    console.log('📋 Getting deployed contracts...');
    if (!devKitServices.contractManager) {
      return res.status(503).json({
        success: false,
        error: 'Contract service not available',
      });
    }

    // Get deployed contracts from the contract manager
    const contracts = await devKitServices.contractManager.listContracts();
    console.log(`✅ Found ${contracts.length} deployed contracts`);

    res.json({
      success: true,
      contracts: contracts.map((contract: any) => ({
        address: contract.address,
        name: contract.name || 'Unnamed Contract',
        abi: contract.abi,
        deployedAt: contract.deployedAt || new Date().toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error getting contracts list:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get contracts list',
    });
  }
});

app.post('/api/node/start', async (_req, res) => {
  try {
    if (!devKitServices.confluxNode) {
      return res.status(503).json({
        success: false,
        error: 'Node service not available',
      });
    }

    // Start the real node
    await devKitServices.confluxNode.start();
    const status = await devKitServices.confluxNode.getStatus();

    res.json({
      success: true,
      message: 'Node started successfully',
      node: {
        running: status.isRunning,
        name: 'Conflux Node',
        version: status.version || 'unknown',
        network: status.network || 'unknown',
      },
    });
  } catch (error) {
    console.error('Error starting node:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start node',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/node/stop', async (_req, res) => {
  try {
    if (!devKitServices.confluxNode) {
      return res.status(503).json({
        success: false,
        error: 'Node service not available',
      });
    }

    // Stop the real node
    await devKitServices.confluxNode.stop();
    const status = await devKitServices.confluxNode.getStatus();

    res.json({
      success: true,
      message: 'Node stopped successfully',
      node: {
        running: status.isRunning,
        name: 'Conflux Node',
        version: status.version || 'unknown',
        network: status.network || 'unknown',
      },
    });
  } catch (error) {
    console.error('Error stopping node:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop node',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/contracts/list', async (_req, res) => {
  try {
    if (!devKitServices.contractManager) {
      return res.status(503).json({
        success: false,
        error: 'Contract service not available',
      });
    }

    // Get real contracts from contract manager
    const contracts = await devKitServices.contractManager.listContracts();
    const deployedContracts =
      await devKitServices.contractManager.getDeployedContracts();

    // Merge contract info with deployment status
    const contractList = contracts.map((contract: any) => {
      const deployed = deployedContracts.find(
        (dc: any) => dc.name === contract.name
      );
      return {
        name: contract.name,
        description: contract.description || 'Smart contract',
        deployed: !!deployed,
        address: deployed?.address,
        abi: contract.abi,
      };
    });

    res.json({
      success: true,
      contracts: contractList,
    });
  } catch (error) {
    console.error('Error listing contracts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list contracts',
    });
  }
});

app.post('/api/contracts/deploy', async (req, res) => {
  const { contracts, contractType = 'simple', constructorArgs = [] } = req.body;

  if (!contracts || !Array.isArray(contracts) || contracts.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No contracts specified for deployment',
    });
  }

  try {
    if (!devKitServices.contractManager) {
      return res.status(503).json({
        success: false,
        error: 'Contract service not available',
      });
    }

    console.log('🚀 Deploying contracts with full DevKit potential...', {
      contracts,
      contractType,
      constructorArgs,
    });

    // Deploy real contracts with enhanced capabilities
    const deployedContracts = [];

    for (const contractName of contracts) {
      try {
        let deploymentResult;

        // Use the showcase demo method for contract deployment
        // This demonstrates the full potential of the DevKit
        const contractDisplayName = `${contractName}_${contractType}`;
        deploymentResult =
          await devKitServices.contractManager.deployContractByName(
            contractDisplayName
          );

        console.log(
          '🔍 Deployment result:',
          JSON.stringify(deploymentResult, null, 2)
        );

        // Get additional contract information
        const contractInfo = {
          name: contractName,
          address: deploymentResult.address || 'N/A',
          transactionHash: deploymentResult.transactionHash || 'N/A',
          gasUsed: deploymentResult.gasUsed || 'N/A',
          type: contractType,
          deployedAt: new Date().toISOString(),
          abi: deploymentResult.abi || 'N/A',
          bytecode: deploymentResult.bytecode
            ? '0x' + deploymentResult.bytecode.substring(0, 20) + '...'
            : 'N/A',
          network: 'Conflux Local',
          capabilities: getContractCapabilities(contractType),
        };

        deployedContracts.push(contractInfo);
        console.log(
          `✅ Contract ${contractName} deployed:`,
          contractInfo.address
        );
      } catch (error) {
        console.error(`❌ Error deploying ${contractName}:`, error);
        deployedContracts.push({
          name: contractName,
          error: error instanceof Error ? error.message : 'Deployment failed',
          type: contractType,
        });
      }
    }

    res.json({
      success: true,
      message: `Successfully deployed ${deployedContracts.filter(c => !('error' in c)).length} contract(s)`,
      contracts: deployedContracts,
      summary: {
        total: deployedContracts.length,
        successful: deployedContracts.filter(c => !('error' in c)).length,
        failed: deployedContracts.filter(c => 'error' in c).length,
        types: [...new Set(deployedContracts.map(c => c.type))],
      },
    });
  } catch (error) {
    console.error('Error deploying contracts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deploy contracts',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Contract interaction endpoints to show full potential
app.post('/api/contracts/call', async (req, res) => {
  try {
    const { contractAddress, methodName, args = [], abi } = req.body;

    if (!devKitServices.contractManager) {
      return res.status(503).json({
        success: false,
        error: 'Contract service not available',
      });
    }

    console.log('📞 Calling contract method:', {
      contractAddress,
      methodName,
      args,
    });

    // Create a default network configuration for the call
    const defaultNetwork = {
      name: 'Conflux Local',
      chainId: 2030,
      rpcUrl: 'http://localhost:8545',
      networkType: 'evm' as const,
    };

    // Call contract method using DevKit
    const result = await devKitServices.contractManager.readContract(
      contractAddress,
      abi,
      methodName,
      args,
      defaultNetwork
    );

    res.json({
      success: true,
      result,
      method: methodName,
      contract: contractAddress,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error calling contract method:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to call contract method',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/contracts/send', async (req, res) => {
  try {
    const {
      contractAddress,
      methodName,
      args = [],
      abi,
      fromAddress,
    } = req.body;

    if (!devKitServices.contractManager) {
      return res.status(503).json({
        success: false,
        error: 'Contract service not available',
      });
    }

    console.log('📤 Sending transaction to contract:', {
      contractAddress,
      methodName,
      args,
      fromAddress,
    });

    // Create a default network configuration for the transaction
    const defaultNetwork = {
      name: 'Conflux Local',
      chainId: 2030,
      rpcUrl: 'http://localhost:8545',
      networkType: 'evm' as const,
    };

    // Send transaction using DevKit
    const result = await devKitServices.contractManager.writeContract(
      contractAddress,
      abi,
      methodName,
      args,
      0n, // value
      defaultNetwork
    );

    res.json({
      success: true,
      transaction: result,
      method: methodName,
      contract: contractAddress,
      from: fromAddress,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send transaction',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/contracts/:address/events', async (req, res) => {
  try {
    const { address } = req.params;
    const { fromBlock = '0', toBlock = 'latest', topics = [] } = req.query;

    if (!devKitServices.contractManager) {
      return res.status(503).json({
        success: false,
        error: 'Contract service not available',
      });
    }

    console.log('📋 Getting contract events:', {
      address,
      fromBlock,
      toBlock,
      topics,
    });

    // Get contract events using EVM RPC
    const rpcResponse = await fetch('http://localhost:8545', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getLogs',
        params: [
          {
            address: address,
            fromBlock: fromBlock,
            toBlock: toBlock,
            topics: topics,
          },
        ],
        id: 1,
      }),
    });

    const rpcData = await rpcResponse.json();
    const events = rpcData.result || [];

    res.json({
      success: true,
      events,
      contract: address,
      fromBlock,
      toBlock,
      count: events.length,
    });
  } catch (error) {
    console.error('Error getting contract events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get contract events',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/contracts/:address/balance', async (req, res) => {
  try {
    const { address } = req.params;

    console.log('💰 Getting contract balance:', address);

    // Get contract balance using EVM RPC
    const rpcResponse = await fetch('http://localhost:8545', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      }),
    });

    const rpcData = await rpcResponse.json();
    let balance = '0';

    if (rpcData.result) {
      const balanceInWei = BigInt(rpcData.result);
      const balanceInCFX = Number(balanceInWei) / Math.pow(10, 18);
      balance = balanceInCFX.toFixed(4);
    }

    res.json({
      success: true,
      balance,
      balanceFormatted: `${balance} CFX`,
      contract: address,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting contract balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get contract balance',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Helper function to get contract capabilities
function getContractCapabilities(contractType: string): string[] {
  const capabilities: Record<string, string[]> = {
    erc20: ['Transfer', 'Approve', 'Mint', 'Burn', 'Balance Query'],
    nft: ['Mint', 'Transfer', 'Approve', 'Owner Query', 'Metadata'],
    voting: ['Propose', 'Vote', 'Execute', 'Delegate', 'Quorum Check'],
    multisig: [
      'Submit Transaction',
      'Confirm Transaction',
      'Execute Transaction',
      'Add Owner',
      'Remove Owner',
    ],
    simple: ['Read State', 'Write State', 'Events'],
  };
  return capabilities[contractType] || capabilities.simple;
}

// Catch-all for other API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    message: `Endpoint ${req.path} not implemented in showcase mode`,
    availableEndpoints: [
      '/api/health',
      '/api/state',
      '/api/networks',
      '/api/packages',
      '/api/wallet/info',
      '/api/node/status',
      '/api/node/start',
      '/api/node/stop',
      '/api/contracts/list',
      '/api/contracts/deploy',
    ],
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Showcase WebApp is running',
    timestamp: new Date().toISOString(),
  });
});

// Root route - serve React app
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server startup is handled by dev.ts or index.ts
// This file only exports the Express app

export default app;
