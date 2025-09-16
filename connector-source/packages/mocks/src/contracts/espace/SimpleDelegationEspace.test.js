// Simple Test Suite for Conflux eSpace
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleDelegationEspace", function () {
  let simpleDelegation;
  let owner, delegate, user, otherUser;

  beforeEach(async function () {
    [owner, delegate, user, otherUser] = await ethers.getSigners();
    
    const SimpleDelegationEspace = await ethers.getContractFactory("SimpleDelegationEspace");
    simpleDelegation = await SimpleDelegationEspace.deploy();
    await simpleDelegation.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await simpleDelegation.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero delegations", async function () {
      expect(await simpleDelegation.totalDelegations()).to.equal(0);
    });
  });

  describe("Delegation Creation", function () {
    it("Should create delegation successfully", async function () {
      const limit = ethers.utils.parseEther("1.0");
      
      await simpleDelegation.connect(user).createDelegation(delegate.address, limit);
      
      const delegation = await simpleDelegation.getDelegation(user.address);
      expect(delegation.delegate).to.equal(delegate.address);
      expect(delegation.limit).to.equal(limit);
      expect(delegation.active).to.be.true;
    });

    it("Should emit DelegationCreated event", async function () {
      const limit = ethers.utils.parseEther("1.0");
      
      await expect(simpleDelegation.connect(user).createDelegation(delegate.address, limit))
        .to.emit(simpleDelegation, "DelegationCreated")
        .withArgs(user.address, delegate.address, limit);
    });

    it("Should reject invalid delegate address", async function () {
      const limit = ethers.utils.parseEther("1.0");
      
      await expect(
        simpleDelegation.connect(user).createDelegation(ethers.constants.AddressZero, limit)
      ).to.be.revertedWith("Invalid delegate");
    });

    it("Should reject zero limit", async function () {
      await expect(
        simpleDelegation.connect(user).createDelegation(delegate.address, 0)
      ).to.be.revertedWith("Invalid limit");
    });
  });

  describe("Delegation Usage", function () {
    beforeEach(async function () {
      const limit = ethers.utils.parseEther("1.0");
      await simpleDelegation.connect(user).createDelegation(delegate.address, limit);
    });

    it("Should allow delegate to use delegation", async function () {
      const amount = ethers.utils.parseEther("0.5");
      
      await simpleDelegation.connect(delegate).useDelegation(user.address, amount);
      
      const usage = await simpleDelegation.getUsage(user.address);
      expect(usage).to.equal(amount);
    });

    it("Should reject usage by non-delegate", async function () {
      const amount = ethers.utils.parseEther("0.5");
      
      await expect(
        simpleDelegation.connect(otherUser).useDelegation(user.address, amount)
      ).to.be.revertedWith("Unauthorized delegate");
    });

    it("Should reject usage exceeding limit", async function () {
      const amount = ethers.utils.parseEther("1.5");
      
      await expect(
        simpleDelegation.connect(delegate).useDelegation(user.address, amount)
      ).to.be.revertedWith("Exceeds delegation limit");
    });
  });

  describe("Delegation Revocation", function () {
    beforeEach(async function () {
      const limit = ethers.utils.parseEther("1.0");
      await simpleDelegation.connect(user).createDelegation(delegate.address, limit);
    });

    it("Should revoke delegation successfully", async function () {
      await simpleDelegation.connect(user).revokeDelegation();
      
      const delegation = await simpleDelegation.getDelegation(user.address);
      expect(delegation.active).to.be.false;
    });

    it("Should emit DelegationRevoked event", async function () {
      await expect(simpleDelegation.connect(user).revokeDelegation())
        .to.emit(simpleDelegation, "DelegationRevoked")
        .withArgs(user.address);
    });
  });
});
