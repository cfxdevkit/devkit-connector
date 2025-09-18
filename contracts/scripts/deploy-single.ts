import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "fs";
import { join } from "path";

// Get command line arguments
const args = process.argv.slice(2);
const networkIndex = args.indexOf('--network');
const contractIndex = args.indexOf('--contract');
const constructorArgsIndex = args.indexOf('--constructor-args');

const network = networkIndex !== -1 ? args[networkIndex + 1] : 'confluxESpaceLocal';
const contractName = contractIndex !== -1 ? args[contractIndex + 1] : 'Counter';
const constructorArgs = constructorArgsIndex !== -1 ? JSON.parse(args[constructorArgsIndex + 1]) : [];

async function deployContract() {
  try {
    // Load contract artifact
    const artifactPath = join(__dirname, '..', 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
    const artifact = JSON.parse(readFileSync(artifactPath, 'utf8'));

    // Get network configuration
    const rpcUrl = getRpcUrl(network);
    const privateKey = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

    // Initialize clients
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const publicClient = createPublicClient({
      transport: http(rpcUrl),
    });
    const walletClient = createWalletClient({
      account,
      transport: http(rpcUrl),
    });

    console.log(`🚀 Deploying ${contractName} to ${network}...`);
    console.log(`📡 RPC URL: ${rpcUrl}`);
    console.log(`👤 Deployer: ${account.address}`);

    // Deploy the contract
    const hash = await walletClient.deployContract({
      abi: artifact.abi,
      bytecode: artifact.bytecode as `0x${string}`,
      args: constructorArgs,
    });

    console.log(`⏳ Transaction hash: ${hash}`);

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (!receipt.contractAddress) {
      throw new Error("Contract deployment failed - no contract address");
    }

    const deploymentResult = {
      contractName,
      address: receipt.contractAddress,
      transactionHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed.toString(),
      network,
      constructorArgs,
    };

    console.log(`✅ ${contractName} deployed successfully!`);
    console.log(`   Address: ${deploymentResult.address}`);
    console.log(`   Tx Hash: ${deploymentResult.transactionHash}`);
    console.log(`   Gas Used: ${deploymentResult.gasUsed}`);

    // Output result for parsing by HardhatService
    console.log(`DEPLOYMENT_RESULT:${JSON.stringify(deploymentResult)}`);

  } catch (error) {
    console.error(`❌ Failed to deploy ${contractName}:`, error);
    process.exit(1);
  }
}

function getRpcUrl(network: string): string {
  switch (network) {
    case 'confluxESpaceLocal':
      return 'http://localhost:8545';
    case 'confluxESpaceTestnet':
      return 'https://evmtestnet.confluxrpc.com';
    case 'confluxESpace':
      return 'https://evm.confluxrpc.com';
    case 'hardhat':
      return 'http://localhost:8545';
    default:
      return 'http://localhost:8545';
  }
}

// Run deployment
deployContract().catch(console.error);