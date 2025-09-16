import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Conflux Core Mainnet
    confluxCore: {
      url: process.env.CONFLUX_CORE_RPC_URL || "https://main.confluxrpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1029,
      gasPrice: 1000000000, // 1 gwei
      timeout: 60000,
    },
    // Conflux Core Testnet
    confluxCoreTestnet: {
      url: process.env.CONFLUX_CORE_TESTNET_RPC_URL || "https://test.confluxrpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1,
      gasPrice: 1000000000, // 1 gwei
      timeout: 60000,
    },
    // Local development
    hardhat: {
      chainId: 1337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 20,
        accountsBalance: "10000000000000000000000", // 10000 ETH
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    // Local Conflux Core (via @xcfx/node)
    localCore: {
      url: "http://127.0.0.1:12537",
      chainId: 1111,
      accounts: [
        "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      ],
      gasPrice: 1000000000, // 1 gwei
      timeout: 60000,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 20,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  etherscan: {
    apiKey: {
      confluxCore: process.env.CONFLUX_CORE_API_KEY || "",
      confluxCoreTestnet: process.env.CONFLUX_CORE_TESTNET_API_KEY || "",
    },
    customChains: [
      {
        network: "confluxCore",
        chainId: 1029,
        urls: {
          apiURL: "https://api.confluxscan.net/api",
          browserURL: "https://confluxscan.net",
        },
      },
      {
        network: "confluxCoreTestnet",
        chainId: 1,
        urls: {
          apiURL: "https://testnetapi.confluxscan.net/api",
          browserURL: "https://testnet.confluxscan.net",
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    admin: {
      default: 1,
    },
    user1: {
      default: 2,
    },
    user2: {
      default: 3,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deployments: "./deployments",
  },
  mocha: {
    timeout: 40000,
  },
};

export default config;
