const amount = BigInt(process.env.AMOUNT ?? "1000000000000000000");
const feeBps = BigInt(process.env.FEE_BPS ?? "100");

if (feeBps > 1000n) {
  throw new Error("FEE_BPS must be <= 1000 (10%)");
}

const fee = (amount * feeBps) / 10000n;
const net = amount - fee;

console.log("=== Fee Preview ===");
console.log(`amount   : ${amount.toString()}`);
console.log(`feeBps   : ${feeBps.toString()}`);
console.log(`fee      : ${fee.toString()}`);
console.log(`net      : ${net.toString()}`);
