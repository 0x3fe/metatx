import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(deployer.address);

  console.log(
    ethers.utils.formatEther(await ethers.provider.getBalance(deployer.address))
  );

  const forwarder_factory = await ethers.getContractFactory("Forwarder");
  const forwarder = await forwarder_factory.connect(deployer).deploy();
  await forwarder.deployed();

  const storage_factory = await ethers.getContractFactory("Storage");
  const storage = await storage_factory
    .connect(deployer)
    .deploy(forwarder.address);
  await storage.deployed();

  console.log(`Forwarder deployed to ${forwarder.address}`);
  console.log(`Storage deployed to ${storage.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
