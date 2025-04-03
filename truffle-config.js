module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
  },

  compilers: {
    solc: {
      version: "0.8.16", // match your Solidity version
      settings: {
        optimizer: {
          enabled: true,     // clearly enable optimizer
          runs: 200,         // recommended optimization runs
        },
        viaIR: true,         // enable via IR compilation clearly
      },
    },
  },
};


