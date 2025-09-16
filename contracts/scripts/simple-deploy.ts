import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting simple deployment...");

  // Get the contract factory
  const Counter = await ethers.getContractFactory("Counter");

  // Deploy the contract
  console.log("📦 Deploying Counter contract...");
  const counter = await Counter.deploy();

  // Wait for deployment to complete
  await counter.waitForDeployment();

  const counterAddress = await counter.getAddress();
  console.log("✅ Counter deployed to:", counterAddress);

  // Test the contract
  console.log("🧪 Testing contract...");
  const count = await counter.getCount();
  console.log("📊 Initial count:", count.toString());

  // Save deployment info
  const deploymentInfo = {
    network: "confluxESpaceLocal",
    contract: "Counter",
    address: counterAddress,
    txHash: counter.deploymentTransaction()?.hash || "unknown",
    gasUsed: "0",
    timestamp: new Date().toISOString(),
    mock: false,
  };

  console.log("💾 Deployment info:", JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

// Run the deployment
main()
  .then(() => {
    console.log("🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

