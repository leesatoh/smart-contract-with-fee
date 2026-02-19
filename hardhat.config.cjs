require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const OP_SEPOLIA_RPC_URL = process.env.OP_SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./hh-contracts",
    tests: "./hh-test",
    cache: "./hh-cache",
    artifacts: "./hh-artifacts",
  },
  networks: {
    hardhat: {},
    opSepolia: {
      url: OP_SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155420,
    },
  },
  etherscan: {
    apiKey: {
      optimismSepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
};
