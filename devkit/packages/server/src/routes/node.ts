import { type Request, type Response, Router } from 'express';
import {
  ConfluxNodeManager,
  type NodeStatus,
} from '../services/conflux-node-manager';

const router: Router = Router();

// Store node manager instance
let nodeManager: ConfluxNodeManager | null = null;

// Global reference setter
export const setGlobalNodeManager = (manager: ConfluxNodeManager | null) => {
  nodeManager = manager;
};

// Node control functions
const startNode = async (): Promise<{
  success: boolean;
  message: string;
  logs?: string[];
}> => {
  try {
    if (nodeManager?.isRunning()) {
      return { success: false, message: 'Node is already running' };
    }

    // Create new node manager instance
    nodeManager = new ConfluxNodeManager({
      devBlockIntervalMs: 1000,
      jsonrpcHttpPort: 12537,
      jsonrpcHttpEthPort: 8545,
      log: true,
      logLevel: 'info',
    });

    // Start the node
    const status = await nodeManager.start();

    // Set global reference for wallet service
    setGlobalNodeManager(nodeManager);
    (global as Record<string, unknown>).globalNodeManager = nodeManager;

    return {
      success: true,
      message: 'Node started successfully',
      logs: status.logs.slice(-10),
    };
  } catch (error) {
    console.error('Failed to start node:', error);
    return {
      success: false,
      message: `Failed to start node: ${error}`,
    };
  }
};

const stopNode = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    if (!nodeManager || !nodeManager.isRunning()) {
      return { success: false, message: 'Node is not running' };
    }

    await nodeManager.stop();
    return { success: true, message: 'Node stopped successfully' };
  } catch (error) {
    console.error('Failed to stop node:', error);
    return {
      success: false,
      message: `Failed to stop node: ${error}`,
    };
  }
};

const restartNode = async (): Promise<{
  success: boolean;
  message: string;
  logs?: string[];
}> => {
  try {
    if (!nodeManager) {
      // If no node manager exists, start a new one
      return await startNode();
    }

    const status = await nodeManager.restart();
    return {
      success: true,
      message: 'Node restarted successfully',
      logs: status.logs.slice(-10),
    };
  } catch (error) {
    console.error('Failed to restart node:', error);
    return {
      success: false,
      message: `Failed to restart node: ${error}`,
    };
  }
};

const getNodeStatus = async (): Promise<{
  success: boolean;
  data: NodeStatus;
}> => {
  try {
    if (!nodeManager) {
      return {
        success: true,
        data: {
          running: false,
          healthy: false,
          uptime: 'Stopped',
          chainId: null,
          processId: null,
          logs: [],
        },
      };
    }

    const status = nodeManager.getStatus();
    return {
      success: true,
      data: status,
    };
  } catch (error) {
    console.error('Failed to get node status:', error);
    return {
      success: true,
      data: {
        running: false,
        healthy: false,
        uptime: 'Stopped',
        chainId: null,
        processId: null,
        logs: [],
        error: `Failed to get status: ${error}`,
      },
    };
  }
};

const getNodeLogs = async (
  limit: number = 100
): Promise<{
  success: boolean;
  data: { logs: string[] };
}> => {
  try {
    if (!nodeManager) {
      return {
        success: true,
        data: { logs: [] },
      };
    }

    const logs = nodeManager.getLogs(limit);
    return {
      success: true,
      data: { logs },
    };
  } catch (error) {
    console.error('Failed to get node logs:', error);
    return {
      success: false,
      data: { logs: [] },
    };
  }
};

// Routes
router.post('/start', async (_req: Request, res: Response) => {
  try {
    const result = await startNode();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error}`,
    });
  }
});

router.post('/stop', async (_req: Request, res: Response) => {
  try {
    const result = await stopNode();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error}`,
    });
  }
});

router.post('/restart', async (_req: Request, res: Response) => {
  try {
    const result = await restartNode();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error}`,
    });
  }
});

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const result = await getNodeStatus();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error}`,
    });
  }
});

router.get('/logs', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const result = await getNodeLogs(limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error}`,
    });
  }
});

// Wallet management endpoints
router.get('/wallets', async (_req: Request, res: Response) => {
  try {
    if (!nodeManager) {
      return res.json({
        success: true,
        data: { wallets: [] },
      });
    }

    const wallets = nodeManager.getWallets();
    res.json({
      success: true,
      data: { wallets },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to get wallets: ${error}`,
    });
  }
});

router.get('/mining-wallet', async (_req: Request, res: Response) => {
  try {
    if (!nodeManager) {
      return res.json({
        success: true,
        data: { wallet: null },
      });
    }

    const miningWallet = nodeManager.getMiningWallet();
    res.json({
      success: true,
      data: { wallet: miningWallet },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to get mining wallet: ${error}`,
    });
  }
});

// Health check endpoint
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const status = await getNodeStatus();
    res.json({
      success: true,
      status: status.data.running ? 'healthy' : 'stopped',
      data: status.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'error',
      message: `Health check failed: ${error}`,
    });
  }
});

export default router;
