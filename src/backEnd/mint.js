const hre = require("hardhat");
const fs = require('fs');
const { ethers } = require("hardhat");
const IpfsHttpClient = require('ipfs-http-client');
const { exit } = require("process");
const ipfs = IpfsHttpClient('http://127.0.0.1:5002')
const { globSource } = IpfsHttpClient

async function main() {
  let j = 0
  let nftsData = [] //NFT's database for front-end

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


  console.log('\nUploading images on IPFS...')
    let files = fs.readdirSync(`${__dirname}/gallery`);
    let myData = fs.readdirSync(`${__dirname}/data`);
    let upload = await ipfs.add(globSource(`${__dirname}/gallery`, { recursive: true }))

    console.log('\nPreparing metadata directory...')
    await fs.rmdirSync(`${__dirname}/metadata`, { recursive: true });
    await fs.mkdirSync(`${__dirname}/metadata`, { recursive: true });

    console.log('\nCreating metadata...')
    for(let i=0; i<myData.length; i++){
      let tmp = require(`${__dirname}/data/${myData[i]}`)
      let metadata = {
        ...tmp,
        "image": `https://ipfs.io/ipfs/${upload.cid.toString()}/${myData[i].replace(/\.[^/.]+$/, ".jpg")}`,
        "jsonName": `${myData[i]}`,
        "myImage": `${__dirname}/gallery/${myData[i].replace(/\.[^/.]+$/, ".jpg")}`
      };
      metadata = JSON.stringify(metadata, null, '\t');

      var img = fs.readFileSync(`${__dirname}/gallery/${myData[i].replace(/\.[^/.]+$/, ".jpg")}`, {encoding: 'base64'});
      nftsData.push(metadata.slice(0, -2) + `,\n\t"img": "${img}"` + `,\n\t"id": ${i+1+j}\n}`)

      await fs.writeFileSync(`${__dirname}/metadata/${/[^.]*/.exec(myData[i])[0]}.json`, metadata)
    }

    console.log('\nUploading metadata on IPFS...')
    files = fs.readdirSync(`${__dirname}/data`);
    upload = await ipfs.add(globSource(`${__dirname}/data`, { recursive: true }))

    console.log('\nMinting NFTs...')
    for(let i=0; i< nftsData.length; i++){
      let tmp = JSON.parse(nftsData[i])
      tmp = tmp["jsonName"]
      console.log(tmp)
      try {
        await nft.mint(`https://ipfs.io/ipfs/${upload.cid.toString()}/${tmp}`, ethers.utils.parseEther('1'))
        nftsData[i] = nftsData[i].slice(0, -2) + `,\n\t"price": ${await nft.price(i+1+j)},\n\t"uri": "${await nft.tokenURI(i+1+j)}"\n}` //add price&URI to nftsData
        console.log(`\n${i+1+j} NFT is minted with URI:\n${await nft.tokenURI(i+1+j)}`)
      } catch (error) {
        console.log("erreur lors du mint de :", tmp);
        console.log(error)
      }
    }

    console.log('\nAggregating NFTs data...')
    if(fs.existsSync(`${__dirname}/nftsData.js`)) {
      await fs.unlinkSync(`${__dirname}/nftsData.js`)
    }
    await fs.writeFileSync(`${__dirname}/nftsData.js`, `export const nftsData = [${nftsData}]`)
    

    console.log('\n\nSuccess.')
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });