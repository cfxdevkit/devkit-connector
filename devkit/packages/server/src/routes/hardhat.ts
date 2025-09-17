import { type Request, type Response, Router } from 'express';
import HardhatService from '../services/hardhat-service';

const router: Router = Router();
const hardhatService = new HardhatService();

// Get available Ignition modules
router.get('/modules', async (_req: Request, res: Response) => {
  try {
    const modules = await hardhatService.getModules();

    res.json({
      success: true,
      data: modules,
    });
  } catch (error) {
    console.error('Error getting Ignition modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Ignition modules',
    });
  }
});

// Deploy a specific Ignition module
router.post('/deploy', async (req: Request, res: Response) => {
  try {
    const { module, network = 'confluxESpaceLocal' } = req.body;

    if (!module) {
      return res.status(400).json({
        success: false,
        error: 'Module name is required',
      });
    }

    console.log(
      `🚀 Deploying Ignition module: ${module} to network: ${network}`
    );

    // Deploy using Hardhat service
    const deploymentResult = await hardhatService.deployModule(module, network);

    if (deploymentResult.success) {
      res.json({
        success: true,
        data: deploymentResult,
        message: `Successfully deployed ${module} module`,
      });
    } else {
      res.status(500).json({
        success: false,
        error: `Deployment failed: ${deploymentResult.error}`,
        data: deploymentResult,
      });
    }
  } catch (error: unknown) {
    console.error('Deployment error:', error);

    res.status(500).json({
      success: false,
      error: `Deployment failed: ${(error as Error).message}`,
    });
  }
});

// Get deployment status/history
router.get('/deployments', async (_req: Request, res: Response) => {
  try {
    const deployments = await hardhatService.getDeployments();

    res.json({
      success: true,
      data: deployments,
    });
  } catch (error) {
    console.error('Error getting deployments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get deployment history',
    });
  }
});

// Compile contracts
router.post('/compile', async (_req: Request, res: Response) => {
  try {
    console.log('🔨 Compiling contracts using HRE...');

    const result = await hardhatService.compileContracts();

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.message,
      });
    }
  } catch (error: unknown) {
    console.error('Compilation error:', error);
    res.status(500).json({
      success: false,
      error: `Compilation failed: ${(error as Error).message}`,
    });
  }
});

export default router;
