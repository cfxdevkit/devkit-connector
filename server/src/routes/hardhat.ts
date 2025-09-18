import { Router, Request, Response } from "express";
import HardhatService from "../services/hardhat-service";
import { HREDeploymentService } from "../services/hre-deployment-service";

const router: Router = Router();
const hardhatService = new HardhatService();
const hreService = new HREDeploymentService(process.cwd());

interface IgnitionModule {
  name: string;
  path: string;
  description: string;
  contracts: string[];
}

interface DeploymentResult {
  success: boolean;
  module: string;
  contracts: Array<{
    name: string;
    address: string;
    transactionHash: string;
  }>;
  error?: string;
}

// Get available Ignition modules
router.get("/modules", async (req: Request, res: Response) => {
  try {
    const modules = await hreService.getModules();

    res.json({
      success: true,
      data: modules,
    });
  } catch (error) {
    console.error("Error getting Ignition modules:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get Ignition modules",
    });
  }
});

// Deploy a specific Ignition module
router.post("/deploy", async (req: Request, res: Response) => {
  try {
    const { module, network = "confluxESpaceLocal" } = req.body;

    if (!module) {
      return res.status(400).json({
        success: false,
        error: "Module name is required",
      });
    }

    console.log(
      `🚀 Deploying Ignition module: ${module} to network: ${network}`
    );

    // Deploy using HRE service (library approach with reset support)
    const deploymentResult = await hreService.deployModule(module, network);

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
  } catch (error: any) {
    console.error("Deployment error:", error);

    res.status(500).json({
      success: false,
      error: `Deployment failed: ${error.message}`,
    });
  }
});

// Get deployment status/history
router.get("/deployments", async (req: Request, res: Response) => {
  try {
    const deployments = await hardhatService.getDeployments();

    res.json({
      success: true,
      data: deployments,
    });
  } catch (error) {
    console.error("Error getting deployments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get deployment history",
    });
  }
});

// Compile contracts
router.post("/compile", async (req: Request, res: Response) => {
  try {
    console.log("🔨 Compiling contracts using HRE...");

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
  } catch (error: any) {
    console.error("Compilation error:", error);
    res.status(500).json({
      success: false,
      error: `Compilation failed: ${error.message}`,
    });
  }
});

export default router;
