import { JsonRpcProvider, getAddress, dataSlice, toBeHex } from "ethers";

const TARGET = process.env.TARGET_PROXY ?? "0x5CD8f0925513D1Aeb0c762add13f872676a61AD5";
const RPC_URL = process.env.RPC_URL ?? "https://sepolia.optimism.io";

const IMPLEMENTATION_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const ADMIN_SLOT =
  "0xb53127684a568b3173ae13b9f8a6016e0197f2a4fdb1a5a44f6d3a4c9c7a2c8d";

function slotValueToAddress(slotHex) {
  const sliced = dataSlice(slotHex, 12, 32);
  return getAddress(sliced);
}

async function main() {
  const provider = new JsonRpcProvider(RPC_URL);

  const bytecode = await provider.getCode(TARGET);
  if (bytecode === "0x") {
    throw new Error(`No contract found at ${TARGET}`);
  }

  const implementationRaw = await provider.getStorage(TARGET, toBeHex(IMPLEMENTATION_SLOT, 32));
  const adminRaw = await provider.getStorage(TARGET, toBeHex(ADMIN_SLOT, 32));

  const implementation = slotValueToAddress(implementationRaw);
  const admin = slotValueToAddress(adminRaw);

  console.log("=== Proxy Inspection ===");
  console.log(`network RPC      : ${RPC_URL}`);
  console.log(`proxy address    : ${TARGET}`);
  console.log(`implementation   : ${implementation}`);
  console.log(`admin            : ${admin}`);
  console.log(`bytecode size    : ${(bytecode.length - 2) / 2} bytes`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
