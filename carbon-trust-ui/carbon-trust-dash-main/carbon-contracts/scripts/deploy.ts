// This first import is the key. It explicitly loads the Hardhat environment extensions.
import "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import hre from "hardhat";

async function main() {
  console.log("Deploying CreditToken contract...");

  const creditToken = await hre.ethers.deployContract("CreditToken");

  await creditToken.waitForDeployment();

  const contractAddress = await creditToken.getAddress();
  console.log(`CreditToken contract deployed to: ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
