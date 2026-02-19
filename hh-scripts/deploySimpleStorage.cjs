const hre = require("hardhat");

async function main() {
  const Factory = await hre.ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await Factory.deploy();
  await simpleStorage.waitForDeployment();

  const address = await simpleStorage.getAddress();
  console.log(`SimpleStorage deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
