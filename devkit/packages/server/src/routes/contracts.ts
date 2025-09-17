import { type Request, type Response, Router } from 'express';
import { z } from 'zod';
import { ContractService } from '../services/contract-service';

const router: Router = Router();

// Initialize contract service (EVM space only)
const contractService = new ContractService({
  espaceRpcUrl: process.env.ESPACE_RPC_URL || 'http://localhost:8545',
  coreRpcUrl: 'http://localhost:12537', // Not used - Core space not implemented
  privateKey:
    process.env.PRIVATE_KEY ||
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  deploymentsPath: process.env.DEPLOYMENTS_PATH || '../deployment',
});

// Validation schemas
const createDelegationSchema = z.object({
  delegate: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address format'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number string'),
});

const counterOperationSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide', 'reset']),
  value: z.number().optional(),
});

const batchOperationSchema = z.object({
  operation: z.enum(['batchAdd', 'batchSubtract']),
  values: z.array(z.number()),
});

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'minimal-contract-server',
  });
});

// Contract status
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await contractService.getContractStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Network info
router.get('/network', async (_req: Request, res: Response) => {
  try {
    const networkInfo = await contractService.getNetworkInfo();
    res.json({ success: true, data: networkInfo });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DelegationManager methods
router.get('/owner', async (_req: Request, res: Response) => {
  try {
    const result = await contractService.callEspaceContract('owner');
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/paused', async (_req: Request, res: Response) => {
  try {
    const result = await contractService.callEspaceContract('paused');
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/createDelegation', async (req: Request, res: Response) => {
  try {
    const { delegate, limit } = createDelegationSchema.parse(req.body);
    const result = await contractService.callEspaceContract(
      'createDelegation',
      [delegate, limit]
    );
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
});

router.post('/revokeDelegation', async (_req: Request, res: Response) => {
  try {
    const result = await contractService.callEspaceContract('revokeDelegation');
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/getDelegation/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const result = await contractService.callEspaceContract('getDelegation', [
      address,
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get current user's delegation status
router.get('/delegation/status', async (_req: Request, res: Response) => {
  try {
    // Get the current wallet address from the contract service
    const walletAddress = contractService.getWalletAddress();
    const result = await contractService.callEspaceContract('getDelegation', [
      walletAddress,
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create delegation (alias for createDelegation)
router.post('/delegation/create', async (req: Request, res: Response) => {
  try {
    const { delegate, limit } = createDelegationSchema.parse(req.body);
    const result = await contractService.callEspaceContract(
      'createDelegation',
      [delegate, limit]
    );
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
});

// Counter contract methods
router.get('/counter/status', async (_req: Request, res: Response) => {
  try {
    const status = await contractService.getCounterStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/counter/operation', async (req: Request, res: Response) => {
  try {
    const { operation, value, values } = req.body;

    if (operation === 'batchAdd' || operation === 'batchSubtract') {
      const validated = batchOperationSchema.parse({ operation, values });
      const result = await contractService.performCounterOperation(
        validated.operation,
        undefined,
        validated.values
      );
      res.json(result);
    } else {
      const validated = counterOperationSchema.parse({ operation, value });
      const result = await contractService.performCounterOperation(
        validated.operation,
        validated.value
      );
      res.json(result);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
});

export default router;
