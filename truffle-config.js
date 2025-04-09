require('dotenv').config();
// const { MNEMONIC, PROJECT_ID } = process.env;
const HDWalletProvider = require('@truffle/hdwallet-provider');
const { SEPOLIA_PRIVATE_KEY, SEPOLIA_RPC_URL } = process.env;
module.exports = {
  /**
   * $ truffle test --network <network-name>
   */
  contracts_build_directory: "./public/contracts",
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 7545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },
    // sepolia: {
    //   provider: () => new HDWalletProvider(MNEMONIC, `https://eth-sepolia.g.alchemy.com/v2/${PROJECT_ID}`),
    //   network_id: "11155111",
    //   confirmations: 2,
    //   timeoutBlocks: 200,
    //   gas: 4465030, 
    //   skipDryRun: true
    // },
    // Sepolia Testnet
    // sepolia: {
    //   provider: () => new HDWalletProvider(
    //     SEPOLIA_PRIVATE_KEY,
    //     SEPOLIA_RPC_URL
    //   ),
    //   network_id: 11155111,     // Sepolia's network ID
    //   gas: 5500000,             // Adjust gas limit if needed
    //   confirmations: 2,         // # of confirmations to wait between deployments
    //   timeoutBlocks: 200,       // Timeout before failing deployment
    //   skipDryRun: true          // Skip dry run before migrations
    // },

  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.19", // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 1,
        },
        //  evmVersion: "byzantium"
      },
    },
  },
  // },

  // $ truffle migrate --reset --compile-all
  //
  // db: {
  //   enabled: false,
  //   host: "127.0.0.1",
  //   adapter: {
  //     name: "indexeddb",
  //     settings: {
  //       directory: ".db"
  //     }
  //   }
  // }
};
