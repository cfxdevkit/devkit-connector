import { expect } from "chai";
import { ethers } from "hardhat";
import { DelegationManager } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("DelegationManager", function () {
  let delegationManager: DelegationManager;
  let owner: SignerWithAddress;
  let admin: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  beforeEach(async function () {
    [owner, admin, user1, user2, user3] = await ethers.getSigners();

    const DelegationManagerFactory = await ethers.getContractFactory("DelegationManager");
    delegationManager = await DelegationManagerFactory.deploy();
    await delegationManager.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await delegationManager.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct values", async function () {
      expect(await delegationManager.nextDelegationId()).to.equal(1);
      expect(await delegationManager.MAX_DELEGATION_DURATION()).to.equal(365 * 24 * 60 * 60);
      expect(await delegationManager.MIN_DELEGATION_DURATION()).to.equal(60 * 60);
    });
  });

  describe("Delegation Creation", function () {
    it("Should create a delegation successfully", async function () {
      const duration = 7 * 24 * 60 * 60; // 7 days
      const dailyLimit = ethers.utils.parseEther("1");
      const perTxLimit = ethers.utils.parseEther("0.1");

      await expect(
        delegationManager
          .connect(user1)
          .createDelegation(user2.address, duration, dailyLimit, perTxLimit)
      )
        .to.emit(delegationManager, "DelegationCreated")
        .withArgs(user1.address, user2.address, 1, anyValue, dailyLimit, perTxLimit);

      const delegation = await delegationManager.getDelegation(1);
      expect(delegation.delegator).to.equal(user1.address);
      expect(delegation.delegate).to.equal(user2.address);
      expect(delegation.isActive).to.be.true;
      expect(delegation.dailyLimit).to.equal(dailyLimit);
      expect(delegation.perTxLimit).to.equal(perTxLimit);
    });

    it("Should reject invalid delegation parameters", async function () {
      const duration = 7 * 24 * 60 * 60;
      const dailyLimit = ethers.utils.parseEther("1");
      const perTxLimit = ethers.utils.parseEther("0.1");

      // Invalid delegate address
      await expect(
        delegationManager
          .connect(user1)
          .createDelegation(ethers.constants.AddressZero, duration, dailyLimit, perTxLimit)
      ).to.be.revertedWith("DelegationManager: invalid delegate");

      // Self-delegation
      await expect(
        delegationManager
          .connect(user1)
          .createDelegation(user1.address, duration, dailyLimit, perTxLimit)
      ).to.be.revertedWith("DelegationManager: cannot delegate to self");

      // Invalid duration
      await expect(
        delegationManager
          .connect(user1)
          .createDelegation(user2.address, 0, dailyLimit, perTxLimit)
      ).to.be.revertedWith("DelegationManager: invalid duration");

      // Invalid limits
      await expect(
        delegationManager
          .connect(user1)
          .createDelegation(user2.address, duration, 0, perTxLimit)
      ).to.be.revertedWith("DelegationManager: daily limit must be > 0");

      await expect(
        delegationManager
          .connect(user1)
          .createDelegation(user2.address, duration, dailyLimit, 0)
      ).to.be.revertedWith("DelegationManager: per-tx limit must be > 0");

      await expect(
        delegationManager
          .connect(user1)
          .createDelegation(user2.address, duration, dailyLimit, dailyLimit.add(1))
      ).to.be.revertedWith("DelegationManager: per-tx limit exceeds daily limit");
    });
  });

  describe("Delegation Management", function () {
    let delegationId: number;

    beforeEach(async function () {
      const duration = 7 * 24 * 60 * 60;
      const dailyLimit = ethers.utils.parseEther("1");
      const perTxLimit = ethers.utils.parseEther("0.1");

      const tx = await delegationManager
        .connect(user1)
        .createDelegation(user2.address, duration, dailyLimit, perTxLimit);
      
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "DelegationCreated");
      delegationId = event?.args?.delegationId.toNumber();
    });

    it("Should revoke delegation", async function () {
      await expect(
        delegationManager.connect(user1).revokeDelegation(delegationId)
      )
        .to.emit(delegationManager, "DelegationRevoked")
        .withArgs(user1.address, user2.address, delegationId);

      const delegation = await delegationManager.getDelegation(delegationId);
      expect(delegation.isActive).to.be.false;
    });

    it("Should allow delegate to revoke", async function () {
      await expect(
        delegationManager.connect(user2).revokeDelegation(delegationId)
      )
        .to.emit(delegationManager, "DelegationRevoked")
        .withArgs(user1.address, user2.address, delegationId);
    });

    it("Should reject unauthorized revocation", async function () {
      await expect(
        delegationManager.connect(user3).revokeDelegation(delegationId)
      ).to.be.revertedWith("DelegationManager: not authorized to revoke");
    });

    it("Should update limits", async function () {
      const newDailyLimit = ethers.utils.parseEther("2");
      const newPerTxLimit = ethers.utils.parseEther("0.2");

      await expect(
        delegationManager
          .connect(user1)
          .updateLimits(delegationId, newDailyLimit, newPerTxLimit)
      )
        .to.emit(delegationManager, "LimitsUpdated")
        .withArgs(delegationId, newDailyLimit, newPerTxLimit);

      const delegation = await delegationManager.getDelegation(delegationId);
      expect(delegation.dailyLimit).to.equal(newDailyLimit);
      expect(delegation.perTxLimit).to.equal(newPerTxLimit);
    });
  });

  describe("Transaction Execution", function () {
    let delegationId: number;
    let user1PrivateKey: string;

    beforeEach(async function () {
      const duration = 7 * 24 * 60 * 60;
      const dailyLimit = ethers.utils.parseEther("1");
      const perTxLimit = ethers.utils.parseEther("0.1");

      const tx = await delegationManager
        .connect(user1)
        .createDelegation(user2.address, duration, dailyLimit, perTxLimit);
      
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "DelegationCreated");
      delegationId = event?.args?.delegationId.toNumber();

      // Get user1's private key for signing
      user1PrivateKey = await user1.getPrivateKey();
    });

    it("Should execute transaction successfully", async function () {
      const value = ethers.utils.parseEther("0.05");
      const data = "0x";
      const nonce = await delegationManager.nonces(user1.address);
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      const messageHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["uint256", "address", "uint256", "bytes", "uint256", "uint256", "address"],
          [delegationId, user3.address, value, data, nonce, deadline, delegationManager.address]
        )
      );

      const signature = await user1.signMessage(ethers.utils.arrayify(messageHash));

      await expect(
        delegationManager
          .connect(user2)
          .executeTransaction(
            delegationId,
            {
              to: user3.address,
              value: value,
              data: data,
              nonce: nonce,
              deadline: deadline,
            },
            signature
          )
      )
        .to.emit(delegationManager, "TransactionExecuted")
        .withArgs(user2.address, user3.address, value, data, delegationId);
    });

    it("Should reject unauthorized execution", async function () {
      const value = ethers.utils.parseEther("0.05");
      const data = "0x";
      const nonce = await delegationManager.nonces(user1.address);
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      const messageHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["uint256", "address", "uint256", "bytes", "uint256", "uint256", "address"],
          [delegationId, user3.address, value, data, nonce, deadline, delegationManager.address]
        )
      );

      const signature = await user1.signMessage(ethers.utils.arrayify(messageHash));

      await expect(
        delegationManager
          .connect(user3)
          .executeTransaction(
            delegationId,
            {
              to: user3.address,
              value: value,
              data: data,
              nonce: nonce,
              deadline: deadline,
            },
            signature
          )
      ).to.be.revertedWith("DelegationManager: not authorized delegate");
    });
  });

  describe("Access Control", function () {
    it("Should pause and unpause", async function () {
      await delegationManager.pause();
      expect(await delegationManager.paused()).to.be.true;

      await delegationManager.unpause();
      expect(await delegationManager.paused()).to.be.false;
    });

    it("Should reject non-owner pause operations", async function () {
      await expect(
        delegationManager.connect(user1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});

// Helper function for anyValue matcher
function anyValue() {
  return true;
}
