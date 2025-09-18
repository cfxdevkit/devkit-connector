import hre from "hardhat";
import CounterModule from "../ignition/modules/Counter";
import DelegationManagerModule from "../ignition/modules/DelegationManager";

interface DeployOptions {
  moduleName: string;
  network: string;
  isDevelopment: boolean;
}

async function deployModule(options: DeployOptions) {
  const { moduleName, network, isDevelopment } = options;

  console.log(`🚀 Deploying ${moduleName} using HRE library approach...`);
  console.log(`🔧 Network: ${network}, Development: ${isDevelopment}`);

  // Access ignition through the proper API
  const ignition = await (hre as any).ignition;
  if (!ignition) {
    throw new Error("Ignition not available");
  }

  const moduleMap = {
    Counter: CounterModule,
    DelegationManager: DelegationManagerModule,
  };

  const module = moduleMap[moduleName as keyof typeof moduleMap];
  if (!module) {
    throw new Error(`No module found for ${moduleName}`);
  }

  const deployOptions: any = {
    parameters: {},
  };

  // Add reset option for development deployments
  if (isDevelopment) {
    deployOptions.reset = true;
    console.log("🔄 Using reset option for development deployment");
  }

  console.log(`🚀 Deploying ${moduleName} with options:`, deployOptions);

  const result = await ignition.deploy(module, deployOptions);
  const contractKey = moduleName.toLowerCase();
  const deployedContract = result[contractKey];

  if (!deployedContract) {
    throw new Error(`Contract ${moduleName} not found in result`);
  }

  const address = deployedContract.address;
  console.log(`✅ ${moduleName} deployed at: ${address}`);

  // Output result in a parseable format
  console.log(
    `DEPLOYMENT_RESULT:${JSON.stringify({
      moduleName,
      address,
      network,
      deployedAt: new Date().toISOString(),
    })}`
  );

  return {
    moduleName,
    address,
    network,
    deployedAt: new Date().toISOString(),
  };
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error(
      "Usage: ts-node hre-deploy.ts <moduleName> <network> <isDevelopment>"
    );
    process.exit(1);
  }

  const [moduleName, network, isDevelopmentStr] = args;
  const isDevelopment = isDevelopmentStr === "true";

  try {
    await deployModule({ moduleName, network, isDevelopment });
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

// Export for programmatic use
export { deployModule };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
