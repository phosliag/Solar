import {
  loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { expect } from "chai";
  import hre from "hardhat";

  
  describe("bondFactory", function () {

  async function deployAccountFixture() {

    const [owner, otherAccount] = await hre.ethers.getSigners();
    const BondFactory = await hre.ethers.getContractFactory("BondFactory");
    const bondFactory = await BondFactory.deploy();
  
    return { bondFactory, owner, otherAccount };
  }
  
  describe("check owner", function () {
    it("Should set the right owner", async function () {
    const { bondFactory, owner } = await loadFixture(deployAccountFixture);
  
    expect(await bondFactory.owner()).to.equal(owner.address);
    });
    });

    it("should create a new Bond", async () => {
    const { bondFactory, otherAccount } = await loadFixture(deployAccountFixture);
      // Calls the contract function
      const tx = await bondFactory.createBond("Test", "TEST", 100, otherAccount); // 

      await tx.wait();
      // Verifies that the contract was deployed
      const deployed = await bondFactory.deployedBonds(0);
      // console.log(`create the account: `, deployed );
      expect(deployed).not.be.equal(0);

  });
    it("should show the same bondsByBeneficiary that deployedBonds", async () => {
      const { bondFactory, otherAccount } = await loadFixture(deployAccountFixture);
      const tx = await bondFactory.createBond("Test", "TEST", 100, otherAccount.address); // 
   
      await tx.wait();

      const bond = await bondFactory.bondsByBeneficiary(otherAccount.address, 0, {});

      const deployedBond = await bondFactory.deployedBonds(0);

      expect(deployedBond).to.equal(bond);

    });

  });