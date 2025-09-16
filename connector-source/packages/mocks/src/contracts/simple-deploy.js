// Simple Contract Deployment Mock
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting SimpleDelegation deployment...");
  
  // Get the contract factory
  const SimpleDelegation = await ethers.getContractFactory("SimpleDelegation");
  
  // Deploy the contract
  console.log("📦 Deploying contract...");
  const simpleDelegation = await SimpleDelegation.deploy();
  await simpleDelegation.deployed();
  
  console.log("✅ SimpleDelegation deployed to:", simpleDelegation.address);
  console.log("🔗 Transaction hash:", simpleDelegation.deployTransaction.hash);
  
  // Verify deployment
  const owner = await simpleDelegation.owner();
  console.log("👤 Contract owner:", owner);
  
  console.log("🎉 Deployment completed successfully!");
  
  return {
    address: simpleDelegation.address,
    txHash: simpleDelegation.deployTransaction.hash,
    owner: owner
  };
}

// Run deployment if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;
