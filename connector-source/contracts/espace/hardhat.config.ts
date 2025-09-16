import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "dotenv/config";

const config: HardhatUserConfig = {
    solidity: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  networks: {
    // Conflux eSpace Mainnet
    confluxEspace: {
      url: process.env.CONFLUX_ESPACE_RPC_URL || "https://evm.confluxrpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1030,
      gasPrice: 1000000000, // 1 gwei
      timeout: 60000,
    },
    // Conflux eSpace Testnet
    confluxEspaceTestnet: {
      url: process.env.CONFLUX_ESPACE_TESTNET_RPC_URL || "https://evmtestnet.confluxrpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 71,
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
    // Local Conflux eSpace (via @xcfx/node)
    localEspace: {
      url: "http://127.0.0.1:8545",
      chainId: 2222,
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
      confluxEspace: process.env.CONFLUX_ESPACE_API_KEY || "",
      confluxEspaceTestnet: process.env.CONFLUX_ESPACE_TESTNET_API_KEY || "",
    },
    customChains: [
      {
        network: "confluxEspace",
        chainId: 1030,
        urls: {
          apiURL: "https://evmapi.confluxscan.net/api",
          browserURL: "https://evm.confluxscan.net",
        },
      },
      {
        network: "confluxEspaceTestnet",
        chainId: 71,
        urls: {
          apiURL: "https://evmtestnetapi.confluxscan.net/api",
          browserURL: "https://evmtestnet.confluxscan.net",
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
