import path from "path";
import fs from "fs-extra";
import { spawn, ChildProcess } from "child_process";

export interface HREModule {
  name: string;
  module: any;
}

export interface HREDeploymentResult {
  success: boolean;
  module: string;
  contracts: Array<{
    name: string;
    address: string;
    transactionHash?: string;
  }>;
  error?: string;
}

export class HREDeploymentService {
  private contractsDir: string;

  constructor(contractsDir: string) {
    this.contractsDir = contractsDir;
  }

  // Deploy using HRE library approach via dedicated script
  async deployModule(
    moduleName: string,
    network: string = "confluxESpaceLocal"
  ): Promise<HREDeploymentResult> {
    try {
      console.log(
        `🚀 Deploying ${moduleName} using HRE library approach to network: ${network}`
      );

      // Determine if we're in development mode
      const isDevelopment =
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV === "dev" ||
        !process.env.NODE_ENV ||
        network === "confluxESpaceLocal" ||
        network === "hardhat";

      console.log(`📦 Using HRE library deployment for ${moduleName}`);
      console.log(`🔧 Network: ${network}, Development: ${isDevelopment}`);

      // Execute the HRE deployment script
      const result = await this.executeHREDeployScript(
        moduleName,
        network,
        isDevelopment
      );

      if (result.success) {
        // Parse the deployment result from the output
        const deploymentData = this.parseDeploymentOutput(result.output);

        return {
          success: true,
          module: moduleName,
          contracts: [
            {
              name: moduleName,
              address:
                deploymentData.address ||
                "0x0000000000000000000000000000000000000000",
              transactionHash: deploymentData.transactionHash || "N/A",
            },
          ],
        };
      } else {
        throw new Error(result.error || "Deployment failed");
      }
    } catch (error: any) {
      console.error("❌ HRE deployment error:", error);
      return {
        success: false,
        module: moduleName,
        contracts: [],
        error: error.message || error.toString() || "Unknown deployment error",
      };
    }
  }

  // Execute the HRE deployment script
  private async executeHREDeployScript(
    moduleName: string,
    network: string,
    isDevelopment: boolean
  ): Promise<{ success: boolean; output: string; error?: string }> {
    return new Promise((resolve) => {
      const scriptPath = path.join(
        this.contractsDir,
        "scripts",
        "hre-deploy.ts"
      );
      const args = [
        "ts-node",
        scriptPath,
        moduleName,
        network,
        isDevelopment.toString(),
      ];

      console.log(`🔧 Executing: ${args.join(" ")}`);

      const childProcess: ChildProcess = spawn("npx", args, {
        cwd: this.contractsDir,
        stdio: "pipe",
        shell: true,
      });

      let output = "";
      let errorOutput = "";

      childProcess.stdout?.on("data", (data: Buffer) => {
        const text = data.toString();
        output += text;
        console.log(text.trim());
      });

      childProcess.stderr?.on("data", (data: Buffer) => {
        const text = data.toString();
        errorOutput += text;
        console.error(text.trim());
      });

      childProcess.on("close", (code: number | null) => {
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          resolve({
            success: false,
            output,
            error: errorOutput || `Process exited with code ${code}`,
          });
        }
      });

      childProcess.on("error", (error: Error) => {
        resolve({
          success: false,
          output,
          error: error.message,
        });
      });
    });
  }

  // Parse deployment output to extract contract address
  private parseDeploymentOutput(output: string): {
    address?: string;
    transactionHash?: string;
    deployedAt?: string;
  } {
    try {
      // Look for DEPLOYMENT_RESULT line in the output
      const lines = output.split("\n");
      const resultLine = lines.find((line) =>
        line.includes("DEPLOYMENT_RESULT:")
      );

      if (resultLine) {
        const jsonStr = resultLine.split("DEPLOYMENT_RESULT:")[1];
        return JSON.parse(jsonStr);
      }

      return {};
    } catch (error) {
      console.warn("Failed to parse deployment output:", error);
      return {};
    }
  }

  // Get available modules
  async getModules(): Promise<HREModule[]> {
    try {
      const modulesDir = path.join(this.contractsDir, "ignition", "modules");
      const files = await fs.readdir(modulesDir);

      const modules: HREModule[] = [];

      for (const file of files) {
        if (file.endsWith(".ts")) {
          const moduleName = file.replace(".ts", "");
          try {
            const modulePath = path.join(modulesDir, file);
            const module = await import(modulePath);
            modules.push({
              name: moduleName,
              module: module.default,
            });
          } catch (error) {
            console.warn(`Failed to load module ${moduleName}:`, error);
          }
        }
      }

      return modules;
    } catch (error) {
      console.error("Error getting HRE modules:", error);
      throw error;
    }
  }
}
