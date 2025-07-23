import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { expect } from "chai";
  import hre from "hardhat";
  
  describe("Account", function () {

    async function deployAccountFixture() {

      const [owner, otherAccount] = await hre.ethers.getSigners();
  
      const Account = await hre.ethers.getContractFactory("Account");
    const account = await Account.deploy(otherAccount.address);
  
      return { account, owner, otherAccount };
    }
  
    describe("Owner of contract", function () {
      it("Should set the right owner", async function () {
        const { account, otherAccount } = await loadFixture(deployAccountFixture);
  
        expect(await account.owner()).to.equal(otherAccount.address);
        });
      });

      

      

  });