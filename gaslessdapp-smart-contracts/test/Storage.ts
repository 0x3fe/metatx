import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Storage", function () {
  async function deployOneYearLockFixture() {
    const [signer, relayer] = await ethers.getSigners();

    const forwarder_factory = await ethers.getContractFactory("Forwarder");
    const forwarder = await forwarder_factory.deploy();
    await forwarder.deployed();

    const storage_factory = await ethers.getContractFactory("Storage");
    const storage = await storage_factory.deploy(forwarder.address);
    await storage.deployed();

    // actors
    console.table({
      signer: signer.address,
      relayer: relayer.address,
      forwarder: forwarder.address,
      storage: storage.address,
    });

    return { forwarder, storage, signer, relayer };
  }

  describe("Deployment", function () {
    beforeEach(async function () {
      const { forwarder, storage, signer, relayer } = await loadFixture(
        deployOneYearLockFixture
      );
      this.forwarder = forwarder;
      this.storage = storage;
      this.signer = signer;
      this.relayer = relayer;
    });

    it("Should properly send a meta tx", async function () {
      // Defining Domain Separator
      const domain = {
        name: "MinimalForwarder",
        version: "0.0.1",
        chainId: 31337,
        verifyingContract: this.forwarder.address,
      };

      // Define the type data structure for the request
      const types = {
        ForwardRequest: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "gas", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "data", type: "bytes" },
        ],
      };

      const nonce = await this.forwarder.getNonce(this.signer.address);
      let ABI = ["function store(uint256 value)"];
      let iface = new ethers.utils.Interface(ABI);
      const data = iface.encodeFunctionData("store", [10]);
      console.log(data, nonce);

      // Define the values for the message
      const value = {
        from: this.signer.address,
        to: this.storage.address,
        value: "0",
        gas: "300000",
        nonce,
        data,
      };

      // Sign the typed data with the signer
      const signature = await this.signer._signTypedData(domain, types, value);

      console.log(signature);

      const expectedSignerAddress = this.signer.address;
      const recoveredAddress = ethers.utils.verifyTypedData(
        domain,
        types,
        value,
        signature
      );
      expect(recoveredAddress).to.be.eq(expectedSignerAddress);

      const signerBalanceBefore = await ethers.provider.getBalance(
        this.signer.address
      );
      const relayerBalanceBefore = await ethers.provider.getBalance(
        this.relayer.address
      );

      const tx = await this.forwarder
        .connect(this.relayer)
        .execute(value, signature);
      await expect(tx)
        .to.emit(this.storage, "Stored")
        .withArgs(this.signer.address, 10);

      const receipt = await tx.wait();
      const feesPaid = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice);

      console.log("receipt", receipt);
      console.log("feesPaid", ethers.utils.formatEther(feesPaid));

      const signerBalanceAfter = await ethers.provider.getBalance(
        this.signer.address
      );
      const relayerBalanceAfter = await ethers.provider.getBalance(
        this.relayer.address
      );

      expect(signerBalanceBefore.sub(signerBalanceAfter)).to.be.eq(0);
      expect(relayerBalanceBefore.sub(relayerBalanceAfter)).to.be.eq(feesPaid);

      expect(await this.storage.getValue(this.signer.address)).to.be.eq(10);
    });
  });
});
