import hre from "hardhat";

async function main() {
  console.log("🚀 Starting Hardhat Ignition deployment...");

  // Get the ignition instance
  const ignition = await hre.ignition;
  
  if (!ignition) {
    throw new Error("Ignition not available. Make sure the plugin is properly loaded.");
  }

  console.log("✅ Ignition plugin loaded successfully");

  // Deploy Counter contract
  console.log("📦 Deploying Counter contract...");
  const counterModule = await ignition.loadModule("./ignition/modules/Counter.ts");
  const counterResult = await ignition.deploy(counterModule, {
    parameters: {},
  });

  console.log(`✅ Counter deployed at: ${counterResult.counter.address}`);

  // Deploy DelegationManager contract
  console.log("📦 Deploying DelegationManager contract...");
  const delegationModule = await ignition.loadModule("./ignition/modules/DelegationManager.ts");
  const delegationResult = await ignition.deploy(delegationModule, {
    parameters: {},
  });

  console.log(`✅ DelegationManager deployed at: ${delegationResult.delegationManager.address}`);

  // Update deployment files
  const fs = await import("fs-extra");
  const path = await import("path");

  const counterDeployment = {
    address: counterResult.counter.address,
    mock: false,
    timestamp: new Date().toISOString(),
  };

  const delegationDeployment = {
    address: delegationResult.delegationManager.address,
    mock: false,
    timestamp: new Date().toISOString(),
  };

  // Write Counter deployment
  await fs.writeJson(
    path.join(__dirname, "../deployment/deployments/counter.json"),
    counterDeployment,
    { spaces: 2 }
  );

  // Write DelegationManager deployment
  await fs.writeJson(
    path.join(__dirname, "../deployment/deployments/delegation.json"),
    delegationDeployment,
    { spaces: 2 }
  );

  console.log("📝 Deployment files updated");
  console.log("🎉 Deployment completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

