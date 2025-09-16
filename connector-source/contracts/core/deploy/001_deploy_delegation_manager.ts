import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployDelegationManager: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer, admin } = await getNamedAccounts();

  log("Deploying DelegationManager...");
  log("Network:", network.name);
  log("Deployer:", deployer);
  log("Admin:", admin);

  const delegationManager = await deploy("DelegationManager", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.name === "confluxCore" ? 5 : 1,
  });

  log(`DelegationManager deployed at: ${delegationManager.address}`);

  // Verify contract on block explorer
  if (network.name !== "hardhat" && network.name !== "localhost") {
    log("Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: delegationManager.address,
        constructorArguments: [],
      });
      log("Contract verified successfully");
    } catch (error) {
      log("Verification failed:", error);
    }
  }

  // Transfer ownership to admin if different from deployer
  if (admin !== deployer) {
    log("Transferring ownership to admin...");
    const contract = await ethers.getContractAt("DelegationManager", delegationManager.address);
    await contract.transferOwnership(admin);
    log("Ownership transferred to admin");
  }

  return true;
};

deployDelegationManager.tags = ["DelegationManager", "all"];
deployDelegationManager.dependencies = [];

export default deployDelegationManager;
