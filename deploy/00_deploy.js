require("hardhat-deploy");
require("hardhat-deploy-ethers");

const ethers = require("ethers");
const fa = require("@glif/filecoin-address");
const util = require("util");
const request = util.promisify(require("request"));

const DEPLOYER_PRIVATE_KEY = network.config.accounts[0];

async function callRpc(method, params) {
  var options = {
      method: "POST",
      url: "https://api.hyperspace.node.glif.io/rpc/v1",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
          jsonrpc: "2.0",
          method: method,
          params: params,
          id: 1,
      }),
  }
  const res = await request(options)
  return JSON.parse(res.body).result
}

const deployer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY);

module.exports = async ({ deployments }) => {
  const { deploy } = deployments;

  const priorityFee = await callRpc("eth_maxPriorityFeePerGas");

  // Wraps Hardhat's deploy, logging errors to console.
  const deployLogError = async (title, obj) => {
    let ret;
    try {
        ret = await deploy(title, obj);
    } catch (error) {
        console.log(error.toString())
        process.exit(1)
    }
    return ret;
  }

  console.log("Wallet Ethereum Address:", deployer.address)

  await deployLogError("NoticeBoard", {
    from: deployer.address,
    args: [],
    // maxPriorityFeePerGas to instruct hardhat to use EIP-1559 tx format
    maxPriorityFeePerGas: priorityFee,
    log: true,
  })
  
};
module.exports.tags = ["NoticeBoard"];
