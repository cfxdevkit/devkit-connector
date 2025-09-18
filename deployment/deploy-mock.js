const fs = require("fs-extra");
const path = require("path");

// Create mock deployments
const deployments = [
  {
    network: "localEspace",
    contract: "DelegationManager",
    address: "0x" + Math.random().toString(16).substr(2, 40),
    txHash: "0x" + Math.random().toString(16).substr(2, 64),
    gasUsed: "150000",
    timestamp: new Date().toISOString(),
    mock: true,
  },
  {
    network: "localEspace",
    contract: "Counter",
    address: "0x" + Math.random().toString(16).substr(2, 40),
    txHash: "0x" + Math.random().toString(16).substr(2, 64),
    gasUsed: "100000",
    timestamp: new Date().toISOString(),
    mock: true,
  },
];

async function deploy() {
  console.log("🚀 Creating mock contract deployments...");

  const deploymentsDir = path.join(__dirname, "deployments");
  await fs.ensureDir(deploymentsDir);

  // Save individual deployment files
  for (const deployment of deployments) {
    const filePath = path.join(
      deploymentsDir,
      `${deployment.contract.toLowerCase()}.json`
    );
    await fs.writeJson(filePath, deployment, { spaces: 2 });
    console.log(`✅ ${deployment.contract}: ${deployment.address}`);
  }

  // Save combined deployments
  const combinedFile = path.join(deploymentsDir, "all-deployments.json");
  await fs.writeJson(combinedFile, deployments, { spaces: 2 });

  console.log("🎉 Mock deployments created successfully!");
  console.log("📁 Deployments saved to:", deploymentsDir);
}

deploy().catch(console.error);









