import { HardhatRuntimeEnvironment } from "hardhat/types";
import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs-extra";
import path from "path";

async function main(hre: HardhatRuntimeEnvironment) {
  console.log("🚀 Starting Viem deployment...");

  // Get network configuration
  const network = hre.network.name || "confluxESpaceLocal";
  console.log("🔍 Network name:", network);
  console.log("🔍 Available networks:", Object.keys(hre.config.networks));

  const networkConfig = hre.config.networks[network];

  if (!networkConfig) {
    throw new Error(`Invalid network configuration for ${network}`);
  }

  const rpcUrl = "http://localhost:8545"; // Use the actual URL directly
  const chainId = networkConfig.chainId;

  console.log("🔗 Network:", network);
  console.log("🔗 RPC URL:", rpcUrl);
  console.log("🔗 Chain ID:", chainId);

  // Get the private key from the mnemonic
  const mnemonic =
    process.env.DEPLOYER_MNEMONIC ||
    "test test test test test test test test test test test junk";
  const { ethers } = await import("ethers");
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  const privateKey = wallet.privateKey;
  const deployerAddress = wallet.address;

  console.log("👤 Deployer address:", deployerAddress);

  // Create Viem clients
  const account = privateKeyToAccount(`0x${privateKey.slice(2)}`);

  const publicClient = createPublicClient({
    transport: http(rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    transport: http(rpcUrl),
  });

  // Check connection
  try {
    const clientChainId = await publicClient.getChainId();
    console.log("✅ Connected to chain, Chain ID:", clientChainId);
  } catch (error) {
    console.error("❌ Failed to connect to network:", error);
    process.exit(1);
  }

  // Get contract artifact
  const contractArtifact = await hre.artifacts.readArtifact("Counter");
  const bytecode = contractArtifact.bytecode;
  const abi = contractArtifact.abi;

  console.log("📦 Contract bytecode length:", bytecode.length);

  // Deploy contract
  console.log("🚀 Deploying Counter contract...");

  try {
    const hash = await walletClient.deployContract({
      abi: abi,
      bytecode: bytecode as `0x${string}`,
      args: [],
    });

    console.log("⏳ Transaction hash:", hash);

    // Wait for deployment
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("✅ Counter deployed to:", receipt.contractAddress);

    // Test the contract
    if (receipt.contractAddress) {
      console.log("🧪 Testing contract...");

      const count = await publicClient.readContract({
        address: receipt.contractAddress,
        abi: abi,
        functionName: "getCount",
      });

      console.log("📊 Initial count:", count.toString());

      // Save deployment info
      const deploymentInfo = {
        network: network,
        contract: "Counter",
        address: receipt.contractAddress,
        txHash: hash,
        gasUsed: receipt.gasUsed?.toString() || "0",
        timestamp: new Date().toISOString(),
        mock: false,
      };

      // Save to file
      const filePath = path.join("../deployment/deployments", "counter.json");
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeJson(filePath, deploymentInfo, { spaces: 2 });

      console.log("💾 Deployment saved to:", filePath);
      console.log("🎉 Deployment completed successfully!");

      return deploymentInfo;
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Run the main function if this script is executed directly
import hre from "hardhat";
main(hre).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
vi;
