#!/usr/bin/env node

/**
 * Contract Configuration Generator
 *
 * This script automatically consolidates contract addresses and ABIs from multiple sources:
 * - /deployment/deployments/ (legacy deployment files)
 * - /contracts/ignition/deployments/ (Hardhat Ignition deployment files)
 * - /contracts/artifacts/ (Hardhat compilation artifacts)
 *
 * It generates a unified configuration file for both frontend and server to use.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const DEPLOYMENT_DIR = path.join(WORKSPACE_ROOT, 'deployment', 'deployments');
const IGNITION_DIR = path.join(WORKSPACE_ROOT, 'contracts', 'ignition', 'deployments');
const ARTIFACTS_DIR = path.join(WORKSPACE_ROOT, 'contracts', 'artifacts', 'contracts');
const OUTPUT_DIR = path.join(WORKSPACE_ROOT, 'shared');
const CONFIG_FILE = path.join(OUTPUT_DIR, 'contract-config.json');

// Network configuration
const NETWORKS = {
  'localEspace': {
    name: 'Local eSpace',
    chainId: 71,
    rpcUrl: 'http://localhost:8545',
    type: 'eSpace'
  },
  'chain-2030': {
    name: 'Local Chain 2030',
    chainId: 2030,
    rpcUrl: 'http://localhost:8545',
    type: 'eSpace'
  }
};

/**
 * Read and parse JSON file safely
 */
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`⚠️  Failed to read ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Get all files matching a pattern recursively
 */
function getFilesRecursive(dir, pattern = /\.json$/) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir);

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (pattern.test(entry)) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * Extract contract info from legacy deployment files
 */
function extractLegacyDeployments() {
  console.log('🔍 Scanning legacy deployment files...');
  const contracts = {};

  const deploymentFiles = getFilesRecursive(DEPLOYMENT_DIR);

  for (const file of deploymentFiles) {
    const deployment = readJsonFile(file);
    if (!deployment) continue;

    const contractName = path.basename(file, '.json');

    if (deployment.address && deployment.network) {
      contracts[contractName] = {
        name: contractName,
        address: deployment.address,
        network: deployment.network,
        source: 'legacy',
        deploymentFile: file,
        metadata: {
          txHash: deployment.txHash,
          gasUsed: deployment.gasUsed,
          timestamp: deployment.timestamp,
          mock: deployment.mock || false
        }
      };

      console.log(`  ✅ ${contractName}: ${deployment.address} (${deployment.network})`);
    }
  }

  return contracts;
}

/**
 * Extract contract info from Hardhat Ignition deployments
 */
function extractIgnitionDeployments() {
  console.log('🔍 Scanning Hardhat Ignition deployments...');
  const contracts = {};

  // Find all chain directories
  const chainDirs = fs.existsSync(IGNITION_DIR) ?
    fs.readdirSync(IGNITION_DIR).filter(name =>
      fs.statSync(path.join(IGNITION_DIR, name)).isDirectory()
    ) : [];

  for (const chainDir of chainDirs) {
    const deployedAddressesFile = path.join(IGNITION_DIR, chainDir, 'deployed_addresses.json');
    const addresses = readJsonFile(deployedAddressesFile);

    if (!addresses) continue;

    console.log(`  📂 Processing chain: ${chainDir}`);

    for (const [moduleContract, address] of Object.entries(addresses)) {
      // Extract contract name from "ModuleName#ContractName" format
      const contractName = moduleContract.includes('#') ?
        moduleContract.split('#')[1] : moduleContract;

      contracts[contractName] = {
        name: contractName,
        address,
        network: chainDir,
        source: 'ignition',
        moduleContract,
        deploymentFile: deployedAddressesFile
      };

      console.log(`    ✅ ${contractName}: ${address}`);
    }
  }

  return contracts;
}

/**
 * Extract ABIs from Hardhat artifacts
 */
function extractContractAbis() {
  console.log('🔍 Extracting contract ABIs...');
  const abis = {};

  if (!fs.existsSync(ARTIFACTS_DIR)) {
    console.warn(`⚠️  Artifacts directory not found: ${ARTIFACTS_DIR}`);
    return abis;
  }

  // Find all .sol directories
  const contractDirs = fs.readdirSync(ARTIFACTS_DIR).filter(name =>
    name.endsWith('.sol') &&
    fs.statSync(path.join(ARTIFACTS_DIR, name)).isDirectory()
  );

  for (const contractDir of contractDirs) {
    const contractPath = path.join(ARTIFACTS_DIR, contractDir);
    const jsonFiles = fs.readdirSync(contractPath).filter(name =>
      name.endsWith('.json') && !name.endsWith('.dbg.json')
    );

    for (const jsonFile of jsonFiles) {
      const contractName = path.basename(jsonFile, '.json');
      const artifactPath = path.join(contractPath, jsonFile);
      const artifact = readJsonFile(artifactPath);

      if (artifact && artifact.abi) {
        abis[contractName] = {
          abi: artifact.abi,
          contractName: artifact.contractName,
          sourceName: artifact.sourceName,
          bytecode: artifact.bytecode,
          deployedBytecode: artifact.deployedBytecode
        };

        console.log(`  ✅ ${contractName}: ${artifact.abi.length} functions/events`);
      }
    }
  }

  return abis;
}

/**
 * Merge deployment sources, prioritizing Ignition over legacy
 */
function mergeDeployments(legacyContracts, ignitionContracts) {
  console.log('🔀 Merging deployment sources...');
  const merged = { ...legacyContracts };

  // Ignition deployments override legacy ones
  for (const [name, contract] of Object.entries(ignitionContracts)) {
    if (merged[name]) {
      console.log(`  🔄 ${name}: Ignition (${contract.address}) overriding legacy (${merged[name].address})`);
    }
    merged[name] = contract;
  }

  return merged;
}

/**
 * Generate the final configuration
 */
function generateConfig(contracts, abis) {
  console.log('⚙️  Generating configuration...');

  const config = {
    metadata: {
      generated: new Date().toISOString(),
      version: '1.0.0',
      sources: ['legacy', 'ignition', 'artifacts']
    },
    networks: NETWORKS,
    contracts: {}
  };

  // Combine contracts with their ABIs
  for (const [name, contract] of Object.entries(contracts)) {
    // Try multiple matching strategies for ABI lookup
    let abi = null;

    // Direct match
    if (abis[name]) {
      abi = abis[name];
    }
    // Case-insensitive match
    else if (abis[name.toLowerCase()]) {
      abi = abis[name.toLowerCase()];
    }
    // Capitalized match
    else if (abis[name.charAt(0).toUpperCase() + name.slice(1)]) {
      abi = abis[name.charAt(0).toUpperCase() + name.slice(1)];
    }
    // Search for partial matches (for counter -> Counter)
    else {
      const abiKeys = Object.keys(abis);
      const matchingKey = abiKeys.find(key =>
        key.toLowerCase() === name.toLowerCase() ||
        key.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(key.toLowerCase())
      );
      if (matchingKey) {
        abi = abis[matchingKey];
        console.log(`    🔍 Matched "${name}" with ABI "${matchingKey}"`);
      }
    }

    config.contracts[name] = {
      name: contract.name,
      address: contract.address,
      network: contract.network,
      source: contract.source,
      abi: abi ? abi.abi : [],
      functions: abi ? abi.abi.filter(item => item.type === 'function').length : 0,
      events: abi ? abi.abi.filter(item => item.type === 'event').length : 0,
      metadata: contract.metadata || {},
      artifact: abi ? {
        contractName: abi.contractName,
        sourceName: abi.sourceName,
        bytecode: abi.bytecode ? abi.bytecode.substring(0, 100) + '...' : null,
        deployedBytecode: abi.deployedBytecode ? abi.deployedBytecode.substring(0, 100) + '...' : null
      } : null
    };

    console.log(`  📄 ${name}: ${config.contracts[name].functions} functions, ${config.contracts[name].events} events`);
  }

  return config;
}

/**
 * Write configuration files
 */
function writeConfig(config) {
  console.log('💾 Writing configuration files...');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write main config file
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log(`  ✅ Main config: ${CONFIG_FILE}`);

  // Write TypeScript definitions
  const tsDefsContent = `// Auto-generated contract configuration types
// Generated: ${config.metadata.generated}

export interface ContractConfig {
  name: string;
  address: string;
  network: string;
  source: 'legacy' | 'ignition';
  abi: any[];
  functions: number;
  events: number;
  metadata: Record<string, any>;
  artifact?: {
    contractName: string;
    sourceName: string;
    bytecode: string | null;
    deployedBytecode: string | null;
  };
}

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  type: 'eSpace' | 'core';
}

export interface Config {
  metadata: {
    generated: string;
    version: string;
    sources: string[];
  };
  networks: Record<string, NetworkConfig>;
  contracts: Record<string, ContractConfig>;
}

// Contract addresses (for convenience)
export const CONTRACT_ADDRESSES = {
${Object.entries(config.contracts).map(([name, contract]) =>
  `  ${name.toUpperCase()}: '${contract.address}' as const,`
).join('\n')}
} as const;

// Contract names
export const CONTRACT_NAMES = {
${Object.entries(config.contracts).map(([name]) =>
  `  ${name.toUpperCase()}: '${name}' as const,`
).join('\n')}
} as const;
`;

  const tsDefsFile = path.join(OUTPUT_DIR, 'contract-config.d.ts');
  fs.writeFileSync(tsDefsFile, tsDefsContent);
  console.log(`  ✅ TypeScript definitions: ${tsDefsFile}`);

  // Write JavaScript module for Node.js (CommonJS)
  const jsModuleContent = `// Auto-generated contract configuration
// Generated: ${config.metadata.generated}

module.exports = ${JSON.stringify(config, null, 2)};
`;

  const jsModuleFile = path.join(OUTPUT_DIR, 'contract-config.js');
  fs.writeFileSync(jsModuleFile, jsModuleContent);
  console.log(`  ✅ JavaScript CommonJS module: ${jsModuleFile}`);

  // Write ES module version
  const esmModuleContent = `// Auto-generated contract configuration (ES Module)
// Generated: ${config.metadata.generated}

const contractConfig = ${JSON.stringify(config, null, 2)};

export default contractConfig;
export const { metadata, networks, contracts } = contractConfig;
`;

  const esmModuleFile = path.join(OUTPUT_DIR, 'contract-config.mjs');
  fs.writeFileSync(esmModuleFile, esmModuleContent);
  console.log(`  ✅ JavaScript ES module: ${esmModuleFile}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Contract Configuration Generator');
  console.log('=====================================');

  try {
    // Extract data from all sources
    const legacyContracts = extractLegacyDeployments();
    const ignitionContracts = extractIgnitionDeployments();
    const abis = extractContractAbis();

    // Merge and generate configuration
    const contracts = mergeDeployments(legacyContracts, ignitionContracts);
    const config = generateConfig(contracts, abis);

    // Write output files
    writeConfig(config);

    console.log('\n✨ Configuration generation completed successfully!');
    console.log(`📊 Generated config for ${Object.keys(config.contracts).length} contracts`);

    // Summary
    console.log('\n📋 Contract Summary:');
    for (const [name, contract] of Object.entries(config.contracts)) {
      console.log(`  • ${name}: ${contract.address} (${contract.network}, ${contract.source})`);
    }

  } catch (error) {
    console.error('❌ Configuration generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  main,
  extractLegacyDeployments,
  extractIgnitionDeployments,
  extractContractAbis,
  generateConfig
};