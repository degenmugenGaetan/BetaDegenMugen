
const NFT = artifacts.require("NFT")
const DegenMugen = artifacts.require("DegenMugen")
var HDWalletProvider = require("truffle-hdwallet-provider");


const wallet = {"Jean": "0xB9679B63bAA0C1cd6933ac90e5B82B8E921D0739", "Paul": "0x1F46B8A31f3B2a2aacC0CF151562482F57A61466", "Pierre": "0x885a0530e8FDFE440AE3cF81e5A03A7944303ce3", "Jacques": "0x00539d0fDdFbDFCd3e3860BE2536Fcd84B0E0e9C"};

let p1Address = wallet["Jean"]
let p2Address = wallet["Pierre"]
let stageAddress = wallet["Paul"]
let JacquesAddress = wallet["Jacques"]
console.log(p1Address, p2Address, stageAddress, JacquesAddress)

// !(migrate --reset) contract before running the script!

async function totalBet(game) {
    console.log("\n")
    await game.AmountOne().then(result => console.log("Valeur de AmountOne:", web3.utils.fromWei(result, "ether")))
    await game.AmountTwo().then(result => console.log("Valeur de AmountTwo:", web3.utils.fromWei(result, "ether")))

}

async function getBalanceNFTOwner() {
  console.log("\n")
  retValue = {}
  let balance = await web3.eth.getBalance(p1Address)
  retValue[p1Address] = parseFloat(balance)
    console.log("p1Address:  " + p1Address + " \tbalance: " + web3.utils.fromWei(balance, "ether") + " ether");
    balance = await web3.eth.getBalance(p2Address)
    retValue[p2Address] = parseFloat(balance)
    console.log("p2Address:  " + p2Address + " \tbalance: " + web3.utils.fromWei(balance, "ether") + " ether");
    balance = await web3.eth.getBalance(stageAddress)
    retValue[stageAddress] = parseFloat(balance)
    console.log("stageAddress:  " + stageAddress + " \tbalance: " + web3.utils.fromWei(balance, "ether") + " ether");
    balance = await web3.eth.getBalance(JacquesAddress)
    retValue[JacquesAddress] = parseFloat(balance)
    console.log("JacquesAddress:  " + JacquesAddress + " \tbalance: " + web3.utils.fromWei(balance, "ether") + " ether");
    return retValue
}

async function makeBet(game, amount, player, account) {
  console.log("\n")
  await game.bet(web3.utils.toWei(amount, 'ether'), player, {from: account,value: web3.utils.toWei(amount, 'ether'),})
  console.log(`Pari de ${account} sur player ${player} de ${amount} ETH`)
}

async function getBalanceAllAccount(accounts) {
  for (var i = 0; i < accounts.length; i++) {
      balance = await web3.eth.getBalance(accounts[i])
      console.log("accounts["+i+"]: " + accounts[i] + " \tbalance: " + web3.utils.fromWei(balance, "ether") + " ether");
      //console.log("\n")
    }
}

module.exports = async function(callback) {
  try {
    const nft = await NFT.deployed()
    const addressContract = nft.address

    const game = await DegenMugen.deployed()
    const addressContractGame = game.address

    const accounts = await web3.eth.getAccounts()

    try {
      await nft.buy(1, {from: p1Address, value: web3.utils.toWei("1", 'ether')})
    } catch {
      console.log("NFT 1 déjà acheté!\n")
    }

    try {
      await nft.buy(24, {from: p2Address, value: web3.utils.toWei("1", 'ether')})
    } catch {
      console.log("NFT 24 déjà acheté!\n")
    }

    try {
      await nft.buy(8, {from: stageAddress, value: web3.utils.toWei("1", 'ether')})
    } catch {
      console.log("NFT 8 déjà acheté!\n")
    }

    
      


    await game.resetAmount()
    
    await getBalanceAllAccount(accounts)
    let myBal1 = await getBalanceNFTOwner()

    await totalBet(game)

    await makeBet(game, "1", 1, JacquesAddress) // winner

    await makeBet(game, "1", 2, p2Address)  // loser

    await totalBet(game)

    console.log("startFight 1, 24, 8")
    await game.startFight(1, 24, 8)

    await web3.eth.sendTransaction({to:game.address, from:accounts[8], value:web3.utils.toWei("2", "ether")})

    //console.log("distributePrizes 2")
    //await game.distributePrizes(2)


    console.log("endFight 2")
    game.endFight(1)

    await getBalanceAllAccount(accounts)
    let myBal2 = await getBalanceNFTOwner()

    let newObj = Object.keys(myBal1).reduce((a, k) => {
      a[k] = myBal2[k] - myBal1[k];
      return a;
    }, {});
    console.log(newObj);

    console.log("JacquesAddress:   \tbalance: " + web3.utils.fromWei(newObj[JacquesAddress].toString(), "ether") + " ether");
    console.log("Jean p1Address:   \tbalance: " + web3.utils.fromWei(newObj[p1Address].toString(), "ether") + " ether");
    console.log("Pierre p2Address:   \tbalance: " + web3.utils.fromWei(newObj[p2Address].toString(), "ether") + " ether");
    console.log("Paul stageAddress:   \tbalance: " + web3.utils.fromWei(newObj[stageAddress].toString(), "ether") + " ether");



  } catch(error) {
    console.log(error)
  }
  callback()
}