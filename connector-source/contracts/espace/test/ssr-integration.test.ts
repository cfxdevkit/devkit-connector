import { expect } from "chai";
import { ethers } from "hardhat";
import { ContractService, createContractService } from "../../../packages/server/src/services/contract-service";

describe("SSR Integration Tests", function () {
  let contractService: ContractService;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Create contract service for testing
    const config = {
      network: "hardhat" as any,
      rpcUrl: "http://127.0.0.1:8545",
      privateKey: owner.privateKey,
    };

    contractService = createContractService(config);
  });

  describe("Contract Service Integration", function () {
    it("Should create and retrieve delegation", async function () {
      const duration = 7 * 24 * 60 * 60; // 7 days
      const dailyLimit = "1.0";
      const perTxLimit = "0.1";

      // Create delegation
      const delegationId = await contractService.createDelegation(
        user2.address,
        duration,
        dailyLimit,
        perTxLimit
      );

      expect(delegationId).to.be.a("number");
      expect(delegationId).to.be.greaterThan(0);

      // Retrieve delegation
      const delegation = await contractService.getDelegation(delegationId);
      
      expect(delegation.delegator).to.equal(owner.address);
      expect(delegation.delegate).to.equal(user2.address);
      expect(delegation.isActive).to.be.true;
      expect(delegation.dailyLimit).to.equal(ethers.utils.parseEther(dailyLimit).toString());
      expect(delegation.perTxLimit).to.equal(ethers.utils.parseEther(perTxLimit).toString());
    });

    it("Should get user delegations", async function () {
      const duration = 7 * 24 * 60 * 60;
      const dailyLimit = "1.0";
      const perTxLimit = "0.1";

      // Create delegation
      await contractService.createDelegation(
        user2.address,
        duration,
        dailyLimit,
        perTxLimit
      );

      // Get user delegations
      const delegations = await contractService.getUserDelegations(owner.address);
      
      expect(delegations).to.be.an("array");
      expect(delegations.length).to.be.greaterThan(0);
    });

    it("Should check transaction execution", async function () {
      const duration = 7 * 24 * 60 * 60;
      const dailyLimit = "1.0";
      const perTxLimit = "0.1";

      // Create delegation
      const delegationId = await contractService.createDelegation(
        user2.address,
        duration,
        dailyLimit,
        perTxLimit
      );

      // Check if transaction can be executed
      const result = await contractService.canExecuteTransaction(delegationId, "0.05");
      
      expect(result.canExecute).to.be.true;
      expect(result.reason).to.equal("");
    });

    it("Should update delegation limits", async function () {
      const duration = 7 * 24 * 60 * 60;
      const dailyLimit = "1.0";
      const perTxLimit = "0.1";

      // Create delegation
      const delegationId = await contractService.createDelegation(
        user2.address,
        duration,
        dailyLimit,
        perTxLimit
      );

      // Update limits
      const newDailyLimit = "2.0";
      const newPerTxLimit = "0.2";

      await contractService.updateLimits(
        delegationId,
        newDailyLimit,
        newPerTxLimit
      );

      // Verify updated limits
      const delegation = await contractService.getDelegation(delegationId);
      expect(delegation.dailyLimit).to.equal(ethers.utils.parseEther(newDailyLimit).toString());
      expect(delegation.perTxLimit).to.equal(ethers.utils.parseEther(newPerTxLimit).toString());
    });

    it("Should revoke delegation", async function () {
      const duration = 7 * 24 * 60 * 60;
      const dailyLimit = "1.0";
      const perTxLimit = "0.1";

      // Create delegation
      const delegationId = await contractService.createDelegation(
        user2.address,
        duration,
        dailyLimit,
        perTxLimit
      );

      // Revoke delegation
      await contractService.revokeDelegation(delegationId);

      // Verify delegation is revoked
      const delegation = await contractService.getDelegation(delegationId);
      expect(delegation.isActive).to.be.false;
    });

    it("Should get contract events", async function () {
      const duration = 7 * 24 * 60 * 60;
      const dailyLimit = "1.0";
      const perTxLimit = "0.1";

      // Create delegation
      await contractService.createDelegation(
        user2.address,
        duration,
        dailyLimit,
        perTxLimit
      );

      // Get delegation events
      const events = await contractService.getDelegationEvents();
      
      expect(events).to.be.an("array");
      expect(events.length).to.be.greaterThan(0);
    });

    it("Should get network information", async function () {
      const networkInfo = contractService.getNetworkInfo();
      
      expect(networkInfo).to.have.property("chainId");
      expect(networkInfo).to.have.property("name");
      expect(networkInfo).to.have.property("rpcUrl");
    });

    it("Should get contract address", async function () {
      const contractAddress = contractService.getContractAddress();
      
      expect(contractAddress).to.be.a("string");
      expect(contractAddress).to.not.equal("");
    });
  });

  describe("Error Handling", function () {
    it("Should handle invalid delegation ID", async function () {
      try {
        await contractService.getDelegation(999999);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).to.be.an("error");
      }
    });

    it("Should handle invalid user address", async function () {
      try {
        await contractService.getUserDelegations("0x0000000000000000000000000000000000000000");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).to.be.an("error");
      }
    });
  });
});
