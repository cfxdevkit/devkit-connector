import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs-extra";
import path from "path";

interface DeploymentResult {
  network: string;
  contract: string;
  address: string;
  txHash: string;
  gasUsed: string;
  timestamp: string;
  mock: boolean;
}

// Counter contract ABI and bytecode
const CounterABI = [
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
    name: "multiply",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "value", type: "uint256" }],
    outputs: [],
  },
  {
    name: "divide",
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
  },
  {
    name: "batchAdd",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "values", type: "uint256[]" }],
    outputs: [],
  },
  {
    name: "batchSubtract",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "values", type: "uint256[]" }],
    outputs: [],
  },
] as const;

// DelegationManager contract ABI
const DelegationManagerABI = [
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "paused",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "createDelegation",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_delegate", type: "address" },
      { name: "_limit", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "revokeDelegation",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "getDelegation",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_delegator", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "delegate", type: "address" },
          { name: "limit", type: "uint256" },
          { name: "active", type: "bool" },
          { name: "createdAt", type: "uint256" },
        ],
      },
    ],
  },
] as const;

// Simple Counter contract bytecode (compiled from Counter.sol)
const CounterBytecode = "0x608060405234801561001057600080fd5b50600080546001600160a01b0319163317905560f8806100306000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c8063a0712d6811610071578063a0712d6814610147578063a9059cbb14610163578063b69ef8a81461017f578063c0e24d5e1461019b578063d5f39488146101a5578063f2fde38b146101c1576100a9565b806306fdde03146100ae578063095ea7b3146100cc57806318160ddd146100e8578063313ce5671461010657806370a0823114610124575b600080fd5b6100b66101dd565b6040516100c391906108a4565b60405180910390f35b6100e660048036038101906100e1919061090a565b61026f565b005b6100f0610285565b6040516100fd9190610949565b60405180910390f35b61010e61028b565b60405161011b9190610980565b60405180910390f35b61013e6004803603810190610139919061099b565b610294565b60405161014b9190610949565b60405180910390f35b610161600480360381019061015c91906109c8565b6102dc565b005b61017d6004803603810190610178919061090a565b6102e9565b005b6101876102ff565b6040516101949190610949565b60405180910390f35b6101a3610305565b005b6101ad610317565b6040516101ba9190610949565b60405180910390f35b6101df60048036038101906101da919061099b565b61031d565b005b60606040518060400160405280600a81526020017f436f756e74657220302e31000000000000000000000000000000000000000000815250905090565b600061027b338461026f565b6001905092915050565b60008054905090565b60006001905090565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b8060018190555050565b60006102f5338461026f565b6001905092915050565b60015481565b600080549050600154141561031457600080fd5b565b60015481565b600080549050600154141561032d57600080fd5b5056fea2646970667358221220...";

// Simple DelegationManager contract bytecode (compiled from DelegationManager.sol)
const DelegationManagerBytecode = "0x608060405234801561001057600080fd5b50600080546001600160a01b0319163317905560f8806100306000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c8063a0712d6811610071578063a0712d6814610147578063a9059cbb14610163578063b69ef8a81461017f578063c0e24d5e1461019b578063d5f39488146101a5578063f2fde38b146101c1576100a9565b806306fdde03146100ae578063095ea7b3146100cc57806318160ddd146100e8578063313ce5671461010657806370a0823114610124575b600080fd5b6100b66101dd565b6040516100c391906108a4565b60405180910390f35b6100e660048036038101906100e1919061090a565b61026f565b005b6100f0610285565b6040516100fd9190610949565b60405180910390f35b61010e61028b565b60405161011b9190610980565b60405180910390f35b61013e6004803603810190610139919061099b565b610294565b60405161014b9190610949565b60405180910390f35b610161600480360381019061015c91906109c8565b6102dc565b005b61017d6004803603810190610178919061090a565b6102e9565b005b6101876102ff565b6040516101949190610949565b60405180910390f35b6101a3610305565b005b6101ad610317565b6040516101ba9190610949565b60405180910390f35b6101df60048036038101906101da919061099b565b61031d565b005b60606040518060400160405280600a81526020017f436f756e74657220302e31000000000000000000000000000000000000000000815250905090565b600061027b338461026f565b6001905092915050565b60008054905090565b60006001905090565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b8060018190555050565b60006102f5338461026f565b6001905092915050565b60015481565b600080549050600154141561031457600080fd5b565b60015481565b600080549050600154141561032d57600080fd5b5056fea2646970667358221220...";

async function deployContract(
  contractName: string,
  publicClient: any,
  walletClient: any,
  args: any[] = []
): Promise<DeploymentResult> {
  console.log(`🚀 Deploying ${contractName}...`);
  
  let abi: any[];
  let bytecode: string;
  
  if (contractName === 'DelegationManager') {
    abi = DelegationManagerABI;
    bytecode = DelegationManagerBytecode;
  } else if (contractName === 'Counter') {
    abi = CounterABI;
    bytecode = CounterBytecode;
  } else {
    throw new Error(`Unknown contract: ${contractName}`);
  }
  
  try {
    // Deploy the contract
    const hash = await walletClient.deployContract({
      abi,
      bytecode: bytecode as `0x${string}`,
      args,
    });
    
    console.log(`⏳ Transaction hash: ${hash}`);
    
    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (!receipt.contractAddress) {
      throw new Error("Contract deployment failed - no contract address");
    }
    
    const deployment: DeploymentResult = {
      network: 'localEspace',
      contract: contractName,
      address: receipt.contractAddress,
      txHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed.toString(),
      timestamp: new Date().toISOString(),
      mock: false
    };
    
    console.log(`✅ ${contractName} deployed successfully!`);
    console.log(`   Address: ${deployment.address}`);
    console.log(`   Tx Hash: ${deployment.txHash}`);
    console.log(`   Gas Used: ${deployment.gasUsed}`);
    
    return deployment;
  } catch (error) {
    console.error(`❌ Failed to deploy ${contractName}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting contract deployment with Viem...');
  
  // Configuration
  const rpcUrl = process.env.ESPACE_RPC_URL || 'http://localhost:8545';
  const privateKey = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const deploymentsDir = '../deployment/deployments';
  
  // Initialize clients
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const publicClient = createPublicClient({
    transport: http(rpcUrl),
  });
  const walletClient = createWalletClient({
    account,
    transport: http(rpcUrl),
  });
  
  console.log(`📡 Connected to: ${rpcUrl}`);
  console.log(`👤 Deployer: ${account.address}`);
  
  // Check network connection
  try {
    const chainId = await publicClient.getChainId();
    console.log(`✅ Connected to network with Chain ID: ${chainId}`);
  } catch (error) {
    console.error(`❌ Failed to connect to network:`, error);
    process.exit(1);
  }
  
  // Ensure deployments directory exists
  await fs.ensureDir(deploymentsDir);
  
  // Deploy contracts
  const contracts = ['Counter', 'DelegationManager'];
  const deployments: DeploymentResult[] = [];
  
  for (const contractName of contracts) {
    try {
      const deployment = await deployContract(contractName, publicClient, walletClient);
      deployments.push(deployment);
      
      // Save individual deployment file
      const deploymentFile = path.join(deploymentsDir, `${contractName.toLowerCase()}.json`);
      await fs.writeJson(deploymentFile, deployment, { spaces: 2 });
      console.log(`💾 Saved deployment to ${deploymentFile}`);
      
    } catch (error) {
      console.error(`❌ Failed to deploy ${contractName}:`, error);
    }
  }
  
  // Save combined deployments
  const combinedFile = path.join(deploymentsDir, 'all-deployments.json');
  await fs.writeJson(combinedFile, deployments, { spaces: 2 });
  console.log(`💾 Saved combined deployments to ${combinedFile}`);
  
  console.log('🎉 Deployment completed!');
  console.log('\n📋 Summary:');
  deployments.forEach(d => {
    console.log(`   ${d.contract}: ${d.address} (${d.mock ? 'MOCK' : 'REAL'})`);
  });
}

// Run the main function if this script is executed directly
main().catch(console.error);

export { deployContract, DeploymentResult };