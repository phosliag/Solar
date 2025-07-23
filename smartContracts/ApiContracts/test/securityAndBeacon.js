const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecurityToken (BeaconProxy architecture)", function () {
  let SecurityToken;
  let securityTokenImpl;
  let beacon;
  let factory;
  let admin;
  let user1;
  let user2;
  let bondAddress;

  const initParams = {
    name: "TestBond",
    symbol: "TBND",
    cap: ethers.parseUnits("1000000", 18),
    isin: "ISIN1234567890",
    instrumentType: "bond",
    jurisdiction: "ES"
  };

before(async function () {
  [admin, user1, user2] = await ethers.getSigners();
  let implAddress;
  let beaconAddress;
  let factoryAddress;
  const SecurityTokenFactory = await ethers.getContractFactory("SecurityToken");
  securityTokenImpl = await SecurityTokenFactory.deploy();
  await securityTokenImpl.waitForDeployment();

   implAddress = await securityTokenImpl.getAddress(); 
  // console.log("Implementation deployed at:", implAddress);

 try {

   BeaconFactory = await ethers.getContractFactory("UpgradeableBeacon");
  beacon = await BeaconFactory.deploy(implAddress, admin.address);
  await beacon.waitForDeployment();

  beaconAddress = await beacon.getAddress();
  // console.log("Beacon deployed at:", beaconAddress);
  // console.log(BeaconFactory.interface.format("full")); // muestra la firma del constructor

} catch (error) {
  console.error("❌ Error deploying UpgradeableBeacon:", error);
}

 try {
  const artifacts = await hre.artifacts.readArtifact("SecurityBondFactory");
  console.log("Artifact target (bytecode):", artifacts.bytecode.slice(0, 10));

  const Factory = await ethers.getContractFactory("SecurityBondFactory");
  factory = await Factory.deploy(beaconAddress);
  await factory.waitForDeployment();
  factoryAddress = await factory.getAddress();
  // console.log("Beacon deployed at:", factoryAddress);
  // console.log(Factory.interface.format("full")); // muestra la firma del constructor
  } catch (error) {
  console.error("❌ Error deploying SecurityBondFactory:", error);
}
    // Crear un bond para uso posterior
    const initData = securityTokenImpl.interface.encodeFunctionData("initialize", [
      initParams.name,
      initParams.symbol,
      initParams.cap,
      initParams.isin,
      initParams.instrumentType,
      initParams.jurisdiction,
      admin.address,
    ]);

    const tx = await factory.createBond(initData, user1.address);
    await tx.wait();
    bondAddress = await factory.deployedBonds(0);
    bond = await ethers.getContractAt("SecurityToken", bondAddress);
});



it("should deploy a new bond contract using the factory", async function () {
  // Codificamos la llamada a initialize usando el ABI REAL de la implementación
  const initData = securityTokenImpl.interface.encodeFunctionData("initialize", [
    initParams.name,
    initParams.symbol,
    initParams.cap,
    initParams.isin,
    initParams.instrumentType,
    initParams.jurisdiction,
    admin.address,
  ]);

  // Llamamos a la factory para crear el proxy
  const tx = await factory.createBond(initData, user1.address);
  await tx.wait();

  // Verificamos que el proxy ha sido desplegado correctamente
  bondAddress = await factory.deployedBonds(0);
  expect(bondAddress).to.be.properAddress;

  console.log("SecurityToken proxy deployed at:", bondAddress);
});


it("should allow minting and transferring if whitelisted", async function () {
    await bond.addToWhitelist(admin.address);
    await bond.addToWhitelist(user1.address);

    await bond.mint(user1.address, ethers.parseUnits("1000", 18));
    expect(await bond.balanceOf(user1.address)).to.equal(ethers.parseUnits("1000", 18));

    await bond.connect(user1).transfer(admin.address, ethers.parseUnits("500", 18));
    expect(await bond.balanceOf(admin.address)).to.equal(ethers.parseUnits("500", 18));
  });

    it("should log transactions in transactionRecords", async function () {
    const txCount = await bond.transactionCount();
    expect(txCount).to.equal(2); // mint y transfer 2 transacciones del admin

    const txData = await bond.getTransactionRecord(2); // comprobamos la segunda transacción transfer
    expect(txData.from).to.equal(user1.address);
    expect(txData.to).to.equal(admin.address);
    expect(txData.amount).to.equal(ethers.parseUnits("500", 18));
  });


    it("should revert a transaction by ID", async function () {
    const tx = await bond.getTransactionRecord(2); // la transacción válida del transfer
    expect(tx.from).to.not.equal(ethers.ZeroAddress);
    expect(tx.to).to.not.equal(ethers.ZeroAddress);

    const prevBalance = await bond.balanceOf(tx.from);
    // console.log(`prevBalance`, prevBalance);
    await bond.revertTransaction(2); // revertimos la segunda transacción
    const newBalance = await bond.balanceOf(tx.from);
    // console.log(`newBalance`, newBalance);
    expect(newBalance).to.equal(prevBalance + tx.amount);
  });

  it("should block transfer if recipient is not whitelisted", async function () {
    await expect(
      bond.connect(user1).transfer(user2.address, ethers.parseUnits("100", 18))
    ).to.be.revertedWith("Recipient is not whitelisted");
  });
});
