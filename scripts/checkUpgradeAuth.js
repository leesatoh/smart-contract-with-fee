import "dotenv/config";
import { JsonRpcProvider, Interface, Wallet, getAddress } from "ethers";

const RPC_URL = process.env.RPC_URL ?? "https://sepolia.optimism.io";
const TARGET_PROXY = process.env.TARGET_PROXY ?? "0x5CD8f0925513D1Aeb0c762add13f872676a61AD5";
const NEW_IMPLEMENTATION = process.env.NEW_IMPLEMENTATION;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CHECK_FROM = process.env.CHECK_FROM;

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

function getFromAddress() {
  if (PRIVATE_KEY) {
    return new Wallet(PRIVATE_KEY).address;
  }
  if (CHECK_FROM) {
    return normalizeAddress(CHECK_FROM, "CHECK_FROM");
  }
  throw new Error("Set PRIVATE_KEY or CHECK_FROM to simulate caller address");
}

async function main() {
  const nextImplementation = normalizeAddress(NEW_IMPLEMENTATION, "NEW_IMPLEMENTATION");

  const provider = new JsonRpcProvider(RPC_URL);

  const from = getFromAddress();
  const proxyCode = await provider.getCode(TARGET_PROXY);
  if (proxyCode === "0x") {
    throw new Error(`No contract at TARGET_PROXY: ${TARGET_PROXY}`);
  }

  const implCode = await provider.getCode(nextImplementation);
  if (implCode === "0x") {
    throw new Error(`No contract at NEW_IMPLEMENTATION: ${nextImplementation}`);
  }

  const iface = new Interface(proxyAbi);
  const callData = iface.encodeFunctionData("upgradeTo", [nextImplementation]);

  console.log("=== Upgrade Auth Check (eth_call) ===");
  console.log(`rpc              : ${RPC_URL}`);
  console.log(`from             : ${from}`);
  console.log(`proxy            : ${TARGET_PROXY}`);
  console.log(`new impl         : ${nextImplementation}`);

  try {
    await provider.call({
      from,
      to: TARGET_PROXY,
      data: callData,
    });
    console.log("result           : PASS (caller likely authorized)");
  } catch (error) {
    const message = error?.shortMessage ?? error?.reason ?? error?.message ?? String(error);
    console.log("result           : FAIL (caller likely not authorized)");
    console.log(`revert           : ${message}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error?.message ?? error);
  process.exit(1);
});
