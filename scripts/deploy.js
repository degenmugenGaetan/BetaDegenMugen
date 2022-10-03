const hre = require("hardhat");
const fs = require('fs');
const { ethers } = require("hardhat");



async function main() {
  const network = await ethers.getDefaultProvider().getNetwork();
  console.log("Network name=", network.name);
  console.log("Network chain id=", network.chainId);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy();
  await nft.deployed();
  console.log("nft deployed to:", nft.address);
  
  const DegenMugen = await hre.ethers.getContractFactory("DegenMugen");
  const degenmugen = await DegenMugen.deploy(nft.address);
  await degenmugen.deployed();
  console.log("nftMarket deployed to:", degenmugen.address);

  let config = `
  export const nftaddressAddress = "${nft.address}"
  export const degenmugenAddress = "${degenmugen.address}"
  `

  let data = JSON.stringify(config)
  fs.writeFileSync('src/ContractConfig.js', JSON.parse(data))

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
