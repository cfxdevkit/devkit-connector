// Simple Deployment Script for Conflux Core
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting SimpleDelegationCore deployment to Conflux Core...");
  
  // Get the contract factory
  const SimpleDelegationCore = await ethers.getContractFactory("SimpleDelegationCore");
  
  // Deploy the contract
  console.log("📦 Deploying contract to Core...");
  const simpleDelegation = await SimpleDelegationCore.deploy();
  await simpleDelegation.deployed();
  
  console.log("✅ SimpleDelegationCore deployed to:", simpleDelegation.address);
  console.log("🔗 Transaction hash:", simpleDelegation.deployTransaction.hash);
  console.log("⛽ Gas used:", simpleDelegation.deployTransaction.gasLimit.toString());
  
  // Verify deployment
  const owner = await simpleDelegation.owner();
  const totalDelegations = await simpleDelegation.totalDelegations();
  
  console.log("👤 Contract owner:", owner);
  console.log("📊 Total delegations:", totalDelegations.toString());
  
  // Save deployment info
  const deploymentInfo = {
    network: "conflux-core",
    contract: "SimpleDelegationCore",
    address: simpleDelegation.address,
    txHash: simpleDelegation.deployTransaction.hash,
    gasUsed: simpleDelegation.deployTransaction.gasLimit.toString(),
    owner: owner,
    timestamp: new Date().toISOString()
  };
  
  const fs = require('fs');
  const path = require('path');
  const deployDir = path.join(__dirname, '..', '..', '..', 'deployments');
  
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }
  
  const deployFile = path.join(deployDir, 'core-deployment.json');
  fs.writeFileSync(deployFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("📄 Deployment info saved to:", deployFile);
  console.log("🎉 Core deployment completed successfully!");
  
  return deploymentInfo;
}

// Run deployment if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Core deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;
