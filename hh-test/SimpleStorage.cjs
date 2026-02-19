const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleStorage", function () {
  it("stores and reads value", async function () {
    const Factory = await ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await Factory.deploy();
    await simpleStorage.waitForDeployment();

    await (await simpleStorage.setValue(42)).wait();

    expect(await simpleStorage.getValue()).to.equal(42n);
  });
});
