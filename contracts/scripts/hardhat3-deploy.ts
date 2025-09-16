import { HardhatRuntimeEnvironment } from "hardhat/types";

async function main(hre: HardhatRuntimeEnvironment) {
  console.log("🚀 Starting Hardhat 3 deployment...");
  console.log("🔍 Available hre properties:", Object.keys(hre));
  console.log("🔍 hre.ethers:", hre.ethers);

  // Get the contract factory
  const Counter = await hre.ethers.getContractFactory("Counter");
  
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

// Run the main function if this script is executed directly
import hre from "hardhat";
main(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
