import {
  loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { expect } from "chai";
  import hre from "hardhat";
import accountBytecode from "../deployed/accountBytecode.json";
  
  describe("AccountFactory", function () {

  async function deployAccountFixture() {

    const [owner, otherAccount] = await hre.ethers.getSigners();
    const bytecode = accountBytecode.creationBytecode;
    const salt = hre.ethers.id("id-example-salt");
    const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
    const accountFactory = await AccountFactory.deploy();
  
    return { accountFactory, owner, otherAccount, bytecode, salt };
  }
  
  describe("check owner", function () {
    it("Should set the right owner", async function () {
    const { accountFactory, owner } = await loadFixture(deployAccountFixture);
  
    expect(await accountFactory.owner()).to.equal(owner.address);
    });
    });

    it("should create a new account", async () => {
    const { accountFactory, bytecode, salt } = await loadFixture(deployAccountFixture);
      // Calls the contract function
      const tx = await accountFactory.createAccount(salt, bytecode);
      await tx.wait();
      // Verifies that the contract was deployed
      const deployed = await accountFactory.deployedContracts(0);
      // console.log(`create the account: `, deployed );
      expect(deployed).to.not.be.undefined;

  });
    it("should deterministically calculated address must match the deployed one", async () => {
    const { accountFactory, bytecode, salt } = await loadFixture(deployAccountFixture);
      const computeAccountAddress = await accountFactory.computeAddress(salt, bytecode);
      // Calls the contract function
      const tx = await accountFactory.createAccount(salt, bytecode);
      await tx.wait();
      // Verifies that the contract was deployed
      const deployedAddress = await accountFactory.deployedContracts(0);
      // console.log(`create the account: `, deployedAddress );
      expect(deployedAddress).to.not.be.undefined;
      expect(deployedAddress).to.equal(computeAccountAddress);

    });

    it("should return the correct number of created accounts", async () => {
      const { accountFactory, bytecode, salt } = await loadFixture(deployAccountFixture);
      const createAddress = await accountFactory.createAccount(salt, bytecode);
      expect(createAddress).to.not.be.undefined;
      const count = await accountFactory.totalOfContractsAccounts();
      expect(Number(count)).to.equal(1);
  });

  });