import { HardhatRuntimeEnvironment } from "hardhat/types";
import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

async function generateTypes(hre: HardhatRuntimeEnvironment) {
  console.log("🔧 Generating TypeScript types for eSpace contracts...");

  // Compile contracts first
  await hre.run("compile");

  // Generate TypeChain types
  try {
    execSync("npx typechain --target ethers-v6 --out-dir types", { stdio: "inherit" });
    console.log("✅ TypeChain types generated successfully");
  } catch (error) {
    console.error("❌ TypeChain generation failed:", error);
    return;
  }

  // Create index file for easy imports
  const indexContent = `// Auto-generated contract types
export * from "./DelegationManager";
export * from "./DelegationManager__factory";

// Contract addresses by network
export const CONTRACT_ADDRESSES = {
  confluxEspace: {
    DelegationManager: process.env.CONFLUX_ESPACE_DELEGATION_MANAGER_ADDRESS || "",
  },
  confluxEspaceTestnet: {
    DelegationManager: process.env.CONFLUX_ESPACE_TESTNET_DELEGATION_MANAGER_ADDRESS || "",
  },
  hardhat: {
    DelegationManager: process.env.HARDHAT_DELEGATION_MANAGER_ADDRESS || "",
  },
  localhost: {
    DelegationManager: process.env.LOCALHOST_DELEGATION_MANAGER_ADDRESS || "",
  },
} as const;

// Network configuration
export const NETWORKS = {
  confluxEspace: {
    chainId: 1030,
    name: "Conflux eSpace",
    rpcUrl: process.env.CONFLUX_ESPACE_RPC_URL || "https://evm.confluxrpc.com",
  },
  confluxEspaceTestnet: {
    chainId: 71,
    name: "Conflux eSpace Testnet",
    rpcUrl: process.env.CONFLUX_ESPACE_TESTNET_RPC_URL || "https://evmtestnet.confluxrpc.com",
  },
  hardhat: {
    chainId: 1337,
    name: "Hardhat Local",
    rpcUrl: "http://127.0.0.1:8545",
  },
  localhost: {
    chainId: 1337,
    name: "Localhost",
    rpcUrl: "http://127.0.0.1:8545",
  },
} as const;

export type NetworkName = keyof typeof NETWORKS;
export type ContractName = keyof typeof CONTRACT_ADDRESSES.confluxEspace;
`;

  // Ensure types directory exists
  mkdirSync("types", { recursive: true });
  writeFileSync(join("types", "index.ts"), indexContent);

  console.log("✅ Contract types generated successfully");
}

export default generateTypes;
