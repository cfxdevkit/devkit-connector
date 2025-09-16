// Simple Contract Test Mock
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleDelegation", function () {
  let simpleDelegation;
  let owner, delegate, user;

  beforeEach(async function () {
    [owner, delegate, user] = await ethers.getSigners();
    
    const SimpleDelegation = await ethers.getContractFactory("SimpleDelegation");
    simpleDelegation = await SimpleDelegation.deploy();
    await simpleDelegation.deployed();
  });

  it("Should create delegation successfully", async function () {
    const limit = ethers.utils.parseEther("1.0");
    
    await simpleDelegation.connect(user).createDelegation(delegate.address, limit);
    
    const delegation = await simpleDelegation.getDelegation(user.address);
    expect(delegation.delegate).to.equal(delegate.address);
    expect(delegation.limit).to.equal(limit);
    expect(delegation.active).to.be.true;
  });

  it("Should revoke delegation successfully", async function () {
    const limit = ethers.utils.parseEther("1.0");
    
    await simpleDelegation.connect(user).createDelegation(delegate.address, limit);
    await simpleDelegation.connect(user).revokeDelegation();
    
    const delegation = await simpleDelegation.getDelegation(user.address);
    expect(delegation.active).to.be.false;
  });

  it("Should emit DelegationCreated event", async function () {
    const limit = ethers.utils.parseEther("1.0");
    
    await expect(simpleDelegation.connect(user).createDelegation(delegate.address, limit))
      .to.emit(simpleDelegation, "DelegationCreated")
      .withArgs(user.address, delegate.address, limit);
  });
});
