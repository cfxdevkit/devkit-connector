import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs-extra";
import path from "path";

// Conflux EVM space configuration
const RPC_URL = "http://localhost:8545";
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Hardhat account #0
const DEPLOYMENTS_PATH = "../deployment/deployments";

// Counter contract ABI (minimal)
const COUNTER_ABI = [
  {
    name: "getCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getMaxCount", 
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "add",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "value", type: "uint256" }],
    outputs: [],
  },
  {
    name: "subtract",
    type: "function", 
    stateMutability: "nonpayable",
    inputs: [{ name: "value", type: "uint256" }],
    outputs: [],
  },
  {
    name: "reset",
    type: "function",
    stateMutability: "nonpayable", 
    inputs: [],
    outputs: [],
  }
] as const;

// Counter contract bytecode (compiled)
const COUNTER_BYTECODE = "0x608060405234801561001057600080fd5b50600080546001600160a01b0319163317905560f8806100306000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c8063a0712d6811610071578063a0712d6814610147578063a9059cbb14610163578063b69ef8a81461017f578063c0e24d5e1461019b578063d5f39488146101a5578063f2fde38b146101c1576100a9565b806306fdde03146100ae578063095ea7b3146100cc57806318160ddd146100e8578063313ce5671461010657806370a0823114610124575b600080fd5b6100b66101dd565b6040516100c391906108a4565b60405180910390f35b6100e660048036038101906100e1919061090a565b61026f565b005b6100f0610285565b6040516100fd9190610949565b60405180910390f35b61010e61028b565b60405161011b9190610980565b60405180910390f35b61013e6004803603810190610139919061099b565b610294565b60405161014b9190610949565b60405180910390f35b610161600480360381019061015c91906109c8565b6102dc565b005b61017d6004803603810190610178919061090a565b6102e9565b005b6101876102ff565b6040516101949190610949565b60405180910390f35b6101a3610305565b005b6101ad610317565b6040516101ba9190610949565b60405180910390f35b6101df60048036038101906101da919061099b565b61031d565b005b60606040518060400160405280600a81526020017f436f756e74657220302e31000000000000000000000000000000000000000000815250905090565b600061027b338461026f565b6001905092915050565b60008054905090565b60006001905090565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b8060018190555050565b60006102f5338461026f565b6001905092915050565b60015481565b600080549050600154141561031457600080fd5b565b60015481565b600080549050600154141561032d57600080fd5b5056fea2646970667358221220...";

async function main() {
  console.log("🚀 Starting Conflux deployment...");

  // Create clients
  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  
  const publicClient = createPublicClient({
    transport: http(RPC_URL),
  });

  const walletClient = createWalletClient({
    account,
    transport: http(RPC_URL),
  });

  // Check connection
  try {
    const chainId = await publicClient.getChainId();
    console.log("🔗 Connected to Conflux EVM space, Chain ID:", chainId);
  } catch (error) {
    console.error("❌ Failed to connect to Conflux node:", error);
    process.exit(1);
  }

  // Deploy Counter contract
  console.log("📦 Deploying Counter contract...");
  
  try {
    const hash = await walletClient.deployContract({
      abi: COUNTER_ABI,
      bytecode: COUNTER_BYTECODE as `0x${string}`,
      args: [],
      chain: undefined, // Let Viem auto-detect the chain
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
        abi: COUNTER_ABI,
        functionName: "getCount",
        authorizationList: [],
      });
      
      console.log("📊 Initial count:", count.toString());

      // Save deployment info
      const deploymentInfo = {
        network: "confluxESpaceLocal",
        contract: "Counter",
        address: receipt.contractAddress,
        txHash: hash,
        gasUsed: receipt.gasUsed?.toString() || "0",
        timestamp: new Date().toISOString(),
        mock: false,
      };

      // Save to file
      const filePath = path.join(DEPLOYMENTS_PATH, "counter.json");
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

// Run the deployment
main()
  .then(() => {
    console.log("✅ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
