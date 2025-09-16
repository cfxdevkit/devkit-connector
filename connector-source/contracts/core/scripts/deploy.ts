import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

async function main() {
  const hre: HardhatRuntimeEnvironment = require("hardhat");
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer, admin } = await getNamedAccounts();

  console.log("🚀 Starting Core contract deployment...");
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer);
  console.log("Admin:", admin);

  // Deploy DelegationManager
  console.log("\n📦 Deploying DelegationManager...");
  const delegationManager = await deploy("DelegationManager", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: hre.network.name === "confluxCore" ? 5 : 1,
  });

  console.log(`✅ DelegationManager deployed at: ${delegationManager.address}`);

  // Verify contract on block explorer
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: delegationManager.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully");
    } catch (error) {
      console.log("❌ Verification failed:", error);
    }
  }

  // Transfer ownership to admin if different from deployer
  if (admin !== deployer) {
    console.log("\n🔄 Transferring ownership to admin...");
    const contract = await ethers.getContractAt("DelegationManager", delegationManager.address);
    await contract.transferOwnership(admin);
    console.log("✅ Ownership transferred to admin");
  }

  console.log("\n🎉 Core deployment completed successfully!");
  console.log("Contract addresses:");
  console.log(`- DelegationManager: ${delegationManager.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
