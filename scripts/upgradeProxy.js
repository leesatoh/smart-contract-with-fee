import "dotenv/config";
import { Contract, JsonRpcProvider, Wallet, getAddress } from "ethers";

const RPC_URL = process.env.RPC_URL ?? "https://sepolia.optimism.io";
const TARGET_PROXY = process.env.TARGET_PROXY ?? "0x5CD8f0925513D1Aeb0c762add13f872676a61AD5";
const NEW_IMPLEMENTATION = process.env.NEW_IMPLEMENTATION;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const EXECUTE_UPGRADE = process.env.EXECUTE_UPGRADE === "true";

const proxyAbi = [
  "function upgradeTo(address newImplementation)",
  "function upgradeToAndCall(address newImplementation, bytes data)",
];

function normalizeAddress(value, label) {
  if (typeof value !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(value)) {
    throw new Error(`Set ${label} to a valid address`);
  }
  return getAddress(value.toLowerCase());
}

async function main() {
  if (!EXECUTE_UPGRADE) {
    throw new Error("Set EXECUTE_UPGRADE=true to send transaction");
  }
  if (!PRIVATE_KEY) {
    throw new Error("Set PRIVATE_KEY for transaction signing");
  }
  const nextImplementation = normalizeAddress(NEW_IMPLEMENTATION, "NEW_IMPLEMENTATION");

  const provider = new JsonRpcProvider(RPC_URL);
  const signer = new Wallet(PRIVATE_KEY, provider);

  const proxyCode = await provider.getCode(TARGET_PROXY);
  if (proxyCode === "0x") {
    throw new Error(`No contract at TARGET_PROXY: ${TARGET_PROXY}`);
  }

  const implCode = await provider.getCode(nextImplementation);
  if (implCode === "0x") {
    throw new Error(`No contract at NEW_IMPLEMENTATION: ${nextImplementation}`);
  }

  const proxy = new Contract(TARGET_PROXY, proxyAbi, signer);

  console.log("=== Upgrade Proxy Execution ===");
  console.log(`rpc              : ${RPC_URL}`);
  console.log(`signer           : ${signer.address}`);
  console.log(`proxy            : ${TARGET_PROXY}`);
  console.log(`new impl         : ${nextImplementation}`);

  const tx = await proxy.upgradeTo(nextImplementation);
  console.log(`tx hash          : ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(`status           : ${receipt?.status === 1 ? "SUCCESS" : "FAILED"}`);
  console.log(`block            : ${receipt?.blockNumber}`);
}

main().catch((error) => {
  console.error(error?.shortMessage ?? error?.reason ?? error?.message ?? error);
  process.exit(1);
});
