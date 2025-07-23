const { expect } = require("chai");
const hre  = require("hardhat");

describe("AccountFactory", function () {

    before(async function () {
        // Obtén los signers con tipado
        [owner, addr1, addr2] = await hre.ethers.getSigners();


        const AccountFactoryContract = await hre.ethers.getContractFactory("AccountFactory");
        accountFactory = (await AccountFactoryContract.deploy()) ;

   
        await accountFactory.waitForDeployment();
    });

    it("should create a new account", async () => {
        // Llama a la función del contrato
        const tx = await accountFactory.createAccount();
        await tx.wait();

        // Verifica que el contrato fue desplegado
        const deployed = await accountFactory.deployedContracts(0);
        expect(deployed).to.not.be.undefined;

    
    });

    it("should return the correct number of created accounts", async () => {
        // Verifica el número de cuentas creadas
        const count = await accountFactory.currentAccounts();
        expect(Number(count)).to.equal(1);
    });
});
   
