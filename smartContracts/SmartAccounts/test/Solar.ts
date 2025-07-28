import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Solar", function () {

  async function deploySolarFixture() {
    const [owner, otherAccount, recipient1, recipient2] = await hre.ethers.getSigners();

    const Solar = await hre.ethers.getContractFactory("SOLAR");
    const solar = await Solar.deploy(owner.address);

    return { solar, owner, otherAccount, recipient1, recipient2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { solar, owner } = await loadFixture(deploySolarFixture);

      expect(await solar.owner()).to.equal(owner.address);
    });

    it("Should set correct initial values", async function () {
      const { solar } = await loadFixture(deploySolarFixture);

      expect(await solar.name()).to.equal("Solar Panel NFT");
      expect(await solar.symbol()).to.equal("SOLAR");
      expect(await solar.totalSupply()).to.equal(0);
      expect(await solar.nextTokenId()).to.equal(1);
    });

    it("Should set correct contract info", async function () {
      const { solar } = await loadFixture(deploySolarFixture);

      const contractInfo = await solar.getContractInfo();
      expect(contractInfo[0]).to.equal("NFTs de placas solares"); // description
      expect(contractInfo[1]).to.equal("Placas Solares S.A."); // companyName
      expect(contractInfo[2]).to.equal("https://placassolares.com"); // website
    });
  });

  describe("Minting", function () {
    it("Should mint a token successfully", async function () {
      const { solar, owner, recipient1 } = await loadFixture(deploySolarFixture);
      const privateTokenURI = "https://example.com/private/1";

      const tx = await solar.mint(recipient1.address, privateTokenURI);
      await tx.wait();

      expect(await solar.balanceOf(recipient1.address)).to.equal(1);
      expect(await solar.ownerOf(1)).to.equal(recipient1.address);
      expect(await solar.totalSupply()).to.equal(1);
      expect(await solar.nextTokenId()).to.equal(2);
      expect(await solar.getPrivateTokenURI(1)).to.equal(privateTokenURI);
    });

    it("Should emit SolarPanelMinted event", async function () {
      const { solar, recipient1 } = await loadFixture(deploySolarFixture);
      const privateTokenURI = "https://example.com/private/1";

      await expect(solar.mint(recipient1.address, privateTokenURI))
        .to.emit(solar, "SolarPanelMinted")
        .withArgs(recipient1.address, 1, privateTokenURI);
    });

    it("Should only allow owner to mint", async function () {
      const { solar, otherAccount, recipient1 } = await loadFixture(deploySolarFixture);
      const privateTokenURI = "https://example.com/private/1";

      await expect(
        solar.connect(otherAccount).mint(recipient1.address, privateTokenURI)
      ).to.be.revertedWithCustomError(solar, "OwnableUnauthorizedAccount");
    });

    it("Should mint batch successfully", async function () {
      const { solar, recipient1, recipient2 } = await loadFixture(deploySolarFixture);
      const recipients = [recipient1.address, recipient2.address];
      const privateTokenURIs = ["https://example.com/private/1", "https://example.com/private/2"];

      const tx = await solar.mintBatch(recipients, privateTokenURIs);
      await tx.wait();

      expect(await solar.balanceOf(recipient1.address)).to.equal(1);
      expect(await solar.balanceOf(recipient2.address)).to.equal(1);
      expect(await solar.totalSupply()).to.equal(2);
      expect(await solar.ownerOf(1)).to.equal(recipient1.address);
      expect(await solar.ownerOf(2)).to.equal(recipient2.address);
    });

    it("Should revert mintBatch with mismatched arrays", async function () {
      const { solar, recipient1 } = await loadFixture(deploySolarFixture);
      const recipients = [recipient1.address];
      const privateTokenURIs = ["https://example.com/private/1", "https://example.com/private/2"];

      await expect(
        solar.mintBatch(recipients, privateTokenURIs)
      ).to.be.revertedWith("Arrays length mismatch");
    });
  });

  describe("Token URI Management", function () {
    it("Should return correct tokenURI", async function () {
      const { solar, recipient1 } = await loadFixture(deploySolarFixture);
      const privateTokenURI = "https://example.com/private/1";

      await solar.mint(recipient1.address, privateTokenURI);

      expect(await solar.tokenURI(1)).to.equal("https://example.com/solar-metadata.json");
    });

    it("Should update fixed tokenURI", async function () {
      const { solar } = await loadFixture(deploySolarFixture);
      const newTokenURI = "https://newexample.com/metadata.json";

      const tx = await solar.setTokenURI(newTokenURI);
      await tx.wait();

      await expect(tx).to.emit(solar, "FixedTokenURIUpdated").withArgs(newTokenURI);
    });

    it("Should update private tokenURI", async function () {
      const { solar, recipient1 } = await loadFixture(deploySolarFixture);
      const privateTokenURI = "https://example.com/private/1";
      const newPrivateTokenURI = "https://example.com/private/1-updated";

      await solar.mint(recipient1.address, privateTokenURI);
      
      const tx = await solar.updatePrivateTokenURI(1, newPrivateTokenURI);
      await tx.wait();

      expect(await solar.getPrivateTokenURI(1)).to.equal(newPrivateTokenURI);
      await expect(tx).to.emit(solar, "PrivateTokenURIUpdated").withArgs(1, newPrivateTokenURI);
    });

    it("Should revert when updating private URI for non-existent token", async function () {
      const { solar } = await loadFixture(deploySolarFixture);
      const newPrivateTokenURI = "https://example.com/private/999";

      await expect(
        solar.updatePrivateTokenURI(999, newPrivateTokenURI)
      ).to.be.revertedWith("Token does not exist");
    });
  });

  describe("Contract Info Management", function () {
    it("Should update contract info", async function () {
      const { solar } = await loadFixture(deploySolarFixture);
      const newDescription = "Updated NFTs de placas solares";
      const newCompanyName = "Nueva Empresa Solar S.A.";
      const newWebsite = "https://nuevaempresa.com";

      const tx = await solar.updateContractInfo(newDescription, newCompanyName, newWebsite);
      await tx.wait();

      const contractInfo = await solar.getContractInfo();
      expect(contractInfo[0]).to.equal(newDescription);
      expect(contractInfo[1]).to.equal(newCompanyName);
      expect(contractInfo[2]).to.equal(newWebsite);

      await expect(tx).to.emit(solar, "ContractInfoUpdated")
        .withArgs(newDescription, newCompanyName, newWebsite);
    });

    it("Should only allow owner to update contract info", async function () {
      const { solar, otherAccount } = await loadFixture(deploySolarFixture);

      await expect(
        solar.connect(otherAccount).updateContractInfo("desc", "company", "website")
      ).to.be.revertedWithCustomError(solar, "OwnableUnauthorizedAccount");
    });
  });

  describe("Token Existence and Ownership", function () {
    it("Should correctly check token existence", async function () {
      const { solar, recipient1 } = await loadFixture(deploySolarFixture);
      const privateTokenURI = "https://example.com/private/1";

      expect(await solar.exists(1)).to.be.false;
      
      await solar.mint(recipient1.address, privateTokenURI);
      
      expect(await solar.exists(1)).to.be.true;
      expect(await solar.exists(2)).to.be.false;
    });

    it("Should return tokens of owner", async function () {
      const { solar, recipient1, recipient2 } = await loadFixture(deploySolarFixture);
      
      await solar.mint(recipient1.address, "uri1");
      await solar.mint(recipient2.address, "uri2");
      await solar.mint(recipient1.address, "uri3");

      const tokensOfRecipient1 = await solar.tokensOfOwner(recipient1.address);
      const tokensOfRecipient2 = await solar.tokensOfOwner(recipient2.address);

      expect(tokensOfRecipient1.length).to.equal(2);
      expect(tokensOfRecipient1[0]).to.equal(1);
      expect(tokensOfRecipient1[1]).to.equal(3);
      
      expect(tokensOfRecipient2.length).to.equal(1);
      expect(tokensOfRecipient2[0]).to.equal(2);
    });
  });

  describe("Supply Tracking", function () {
    it("Should track total supply correctly", async function () {
      const { solar, recipient1, recipient2 } = await loadFixture(deploySolarFixture);

      expect(await solar.totalSupply()).to.equal(0);

      await solar.mint(recipient1.address, "uri1");
      expect(await solar.totalSupply()).to.equal(1);

      await solar.mint(recipient2.address, "uri2");
      expect(await solar.totalSupply()).to.equal(2);

      const recipients = [recipient1.address, recipient2.address];
      const uris = ["uri3", "uri4"];
      await solar.mintBatch(recipients, uris);
      
      expect(await solar.totalSupply()).to.equal(4);
    });

    it("Should track next token ID correctly", async function () {
      const { solar, recipient1 } = await loadFixture(deploySolarFixture);

      expect(await solar.nextTokenId()).to.equal(1);

      await solar.mint(recipient1.address, "uri1");
      expect(await solar.nextTokenId()).to.equal(2);

      await solar.mint(recipient1.address, "uri2");
      expect(await solar.nextTokenId()).to.equal(3);
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to call restricted functions", async function () {
      const { solar, otherAccount } = await loadFixture(deploySolarFixture);

      await expect(
        solar.connect(otherAccount).mint(otherAccount.address, "uri")
      ).to.be.revertedWithCustomError(solar, "OwnableUnauthorizedAccount");

      await expect(
        solar.connect(otherAccount).setTokenURI("newuri")
      ).to.be.revertedWithCustomError(solar, "OwnableUnauthorizedAccount");

      await expect(
        solar.connect(otherAccount).mintBatch([otherAccount.address], ["uri"])
      ).to.be.revertedWithCustomError(solar, "OwnableUnauthorizedAccount");
    });
  });

  describe("Error Handling", function () {
    it("Should revert when querying private URI for non-existent token", async function () {
      const { solar } = await loadFixture(deploySolarFixture);

      await expect(
        solar.getPrivateTokenURI(999)
      ).to.be.revertedWith("Token does not exist");
    });

    it("Should revert when querying tokenURI for non-existent token", async function () {
      const { solar } = await loadFixture(deploySolarFixture);

      await expect(
        solar.tokenURI(999)
      ).to.be.revertedWith("ERC721: URI query for nonexistent token");
    });
  });
});
