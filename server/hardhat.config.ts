import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    confluxESpaceLocal: {
      url: "http://localhost:8545",
      chainId: 20,
      accounts: [], // Will be populated by the node manager
    },
  },
  paths: {
    sources: "../contracts/contracts",
    tests: "../contracts/test",
    cache: "../contracts/cache",
    artifacts: "../contracts/artifacts",
  },
};

export default config;



