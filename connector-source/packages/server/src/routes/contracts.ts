import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ContractService } from '../services/contract-service';
import { ContractCallResult } from '../types';

const router: Router = Router();

// Initialize contract service
const contractService = new ContractService({
  espaceRpcUrl: process.env.CONFLUX_ESPACE_RPC_URL || 'http://127.0.0.1:8545',
  coreRpcUrl: process.env.CONFLUX_CORE_RPC_URL || 'http://127.0.0.1:12537',
  privateKey: process.env.PRIVATE_KEY || '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  deploymentsPath: process.env.DEPLOYMENTS_PATH || '../../tools/node-manager/deployments'
});

// Validation schemas
const createDelegationSchema = z.object({
  delegate: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address format'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number string')
});

const getDelegationSchema = z.object({
  delegator: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address format')
});

const counterOperationSchema = z.object({
  value: z.number().min(0, 'Value must be non-negative')
});

const batchOperationSchema = z.object({
  values: z.array(z.number().min(0, 'Values must be non-negative')).min(1, 'At least one value required')
});

// Contract status endpoint
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await contractService.getContractStatus();
    const networkInfo = await contractService.getNetworkInfo();
    
    res.json({
      success: true,
      data: {
        contracts: status,
        networks: networkInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// eSpace contract endpoints
router.post('/espace/create-delegation', async (req: Request, res: Response) => {
  try {
    const { delegate, limit } = createDelegationSchema.parse(req.body);
    
    const result = await contractService.callEspaceContract('createDelegation', [delegate, limit]);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        transactionHash: result.transactionHash,
        gasUsed: result.gasUsed
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

router.post('/espace/revoke-delegation', async (req: Request, res: Response) => {
  try {
    const result = await contractService.callEspaceContract('revokeDelegation', []);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        transactionHash: result.transactionHash,
        gasUsed: result.gasUsed
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/espace/get-delegation/:delegator', async (req: Request, res: Response) => {
  try {
    const { delegator } = getDelegationSchema.parse({ delegator: req.params.delegator });
    
    const result = await contractService.callEspaceContract('getDelegation', [delegator]);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

router.get('/espace/owner', async (req: Request, res: Response) => {
  try {
    const result = await contractService.callEspaceContract('owner', []);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Core contract endpoints (with mock fallback)
router.post('/core/create-delegation', async (req: Request, res: Response) => {
  try {
    const { delegate, limit } = createDelegationSchema.parse(req.body);
    
    const result = await contractService.callCoreContract('createDelegation', [delegate, limit]);
    
    res.json({
      success: true,
      data: result.data,
      transactionHash: result.transactionHash,
      gasUsed: result.gasUsed,
      mock: (result as any).mock || false
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

router.post('/core/revoke-delegation', async (req: Request, res: Response) => {
  try {
    const result = await contractService.callCoreContract('revokeDelegation', []);
    
    res.json({
      success: true,
      data: result.data,
      transactionHash: result.transactionHash,
      gasUsed: result.gasUsed,
      mock: (result as any).mock || false
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/core/get-delegation/:delegator', async (req: Request, res: Response) => {
  try {
    const { delegator } = getDelegationSchema.parse({ delegator: req.params.delegator });
    
    const result = await contractService.callCoreContract('getDelegation', [delegator]);
    
    res.json({
      success: true,
      data: result.data,
      mock: (result as any).mock || false
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

router.get('/core/owner', async (req: Request, res: Response) => {
  try {
    const result = await contractService.callCoreContract('owner', []);
    console.log('Core owner result:', JSON.stringify(result, null, 2));
    
    res.json({
      success: true,
      data: result.data,
      mock: (result as any).mock || false
    });
  } catch (error) {
    console.error('Core owner error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  try {
    const status = await contractService.getContractStatus();
    const networkInfo = await contractService.getNetworkInfo();
    
    const isHealthy = status.espace.deployed || status.core.deployed;
    
    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      status: isHealthy ? 'healthy' : 'unhealthy',
      contracts: status,
      networks: networkInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Counter contract endpoints
router.get('/counter/status', async (req: Request, res: Response) => {
  try {
    const result = await contractService.getCounterStatus();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/counter/add', async (req: Request, res: Response) => {
  try {
    const { value } = counterOperationSchema.parse(req.body);
    const result = await contractService.addToCounter(value);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/counter/subtract', async (req: Request, res: Response) => {
  try {
    const { value } = counterOperationSchema.parse(req.body);
    const result = await contractService.subtractFromCounter(value);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/counter/multiply', async (req: Request, res: Response) => {
  try {
    const { value } = counterOperationSchema.parse(req.body);
    const result = await contractService.multiplyCounter(value);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/counter/divide', async (req: Request, res: Response) => {
  try {
    const { value } = counterOperationSchema.parse(req.body);
    const result = await contractService.divideCounter(value);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/counter/reset', async (req: Request, res: Response) => {
  try {
    const result = await contractService.resetCounter();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/counter/batch-add', async (req: Request, res: Response) => {
  try {
    const { values } = batchOperationSchema.parse(req.body);
    const result = await contractService.batchAddToCounter(values);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/counter/batch-subtract', async (req: Request, res: Response) => {
  try {
    const { values } = batchOperationSchema.parse(req.body);
    const result = await contractService.batchSubtractFromCounter(values);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;