import { nftsData } from '../backEnd/nftsData.js'
import Contract from '../backEnd/abis/NFT.json'
import ContractGame from '../backEnd/abis/DegenMugen.json'
import { nftaddressAddress } from '../ContractConfig'
import { degenmugenAddress } from '../ContractConfig'
import Web3 from 'web3'
import {
  web3Loaded,
  contractLoaded,
  contractGameLoaded,
  web3NetworkLoaded,
  web3AccountLoaded,
  web3BalanceLoaded,
  metadataLoaded,
  nftStateLoaded
} from './actions'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


toast.configure();


export const loadWeb3 = async (dispatch) => {
  try{
    if(typeof window.ethereum!=='undefined'){
      window.ethereum.autoRefreshOnNetworkChange = false;
      const web3 = new Web3(window.ethereum)
      dispatch(web3Loaded(web3))
      return web3
    }
  } catch (e) {
    console.log('Error, load Web3: ', e)
  }
}

export const NETWORK = {
  1: "ETHEREUM", 
  31337: "HARDHAT"
}

export const loadNetwork = async (dispatch, web3) => {
  try{
    let network = await web3.eth.net.getId()
    /*console.log("AAAAAAAAAAAAa\n");
    console.log(network);
    console.log("AAAAAAAAAAAAa\n");*/

    //network = network.charAt(0).toUpperCase()+network.slice(1)
    network = NETWORK[network]
    dispatch(web3NetworkLoaded(network))
    return network
  } catch (e) {
    dispatch(web3NetworkLoaded('Wrong network'))
    console.log('Error, load network: ', e)
  }
}

export const loadAccount = async (dispatch, web3) => {
  try{
    const accounts = await web3.eth.getAccounts()
    //const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = await accounts[0]
    if(typeof account !== 'undefined'){
      dispatch(web3AccountLoaded(account))
      return account
    } else {
      dispatch(web3AccountLoaded(null))
      return null
    }
  } catch (e) {
    console.log('Error, load account: ', e)
  }
}

export const loadBalance = async (dispatch, web3, account) => {
  try {
    const etherBalance = await web3.eth.getBalance(account)
    dispatch(web3BalanceLoaded((etherBalance/10**18).toFixed(5)))
  } catch (e) {
    console.log('Error, load balance: ', e)
  }
}

export const loadContract = async (dispatch, web3, netId) => {
  try {
    //let myNetId = Object.keys(Contract.networks)[0]
    const contract = new web3.eth.Contract(Contract, nftaddressAddress)// Contract.networks[myNetId].address)
    dispatch(contractLoaded(contract))
    return contract
  } catch (e) {
    window.alert('Wrong network! Error, load contract')
    console.log('Error, load contract: ', e)
    dispatch(contractLoaded(null))
    return null
  }
}

export const loadContractGame = async (dispatch, web3, netId) => {
  try {
    const contractGame = new web3.eth.Contract(ContractGame, degenmugenAddress)
    dispatch(contractGameLoaded(contractGame))
    return contractGame
  } catch (e) {
    window.alert('Wrong network! Error, load contractGame')
    console.log('Error, load contract Game: ', e)
    dispatch(contractGameLoaded(null))
    return null
  }
}

export const update = async (dispatch) => {
  try{
    let account, web3, netId, contract, contractGame

    web3 = await loadWeb3(dispatch)
    await loadNetwork(dispatch, web3)
    account = await loadAccount(dispatch, web3)
    netId = await web3.eth.net.getId()
    contract = await loadContract(dispatch, web3, netId)
    contractGame = await loadContractGame(dispatch, web3, netId)
  
    await loadNftData(dispatch, contract)
    await loadNftState(dispatch, contract)
    if(account && contract && contractGame){
      await loadBalance(dispatch, web3, account)
    }
  } catch (e) {
    console.log('Error, update data: ', e)
  }
}

//get NFTs data from nftsData.js generated while minting
export const loadNftData = async (dispatch, contract) => {
  try{
    console.log("AVANT totalsupply AVANT")
    const totalSupply = await contract.methods.totalSupply().call()
    console.log("APRES totalsupply APRES")
    //const uri = await contract.methods.tokenURI(1).call()

   if(Number(totalSupply) > 0) {
      dispatch(metadataLoaded(nftsData))
      console.log("dispatch réussi")
    } else {
      console.log("dispatch fail")
      console.log(Number(totalSupply))
      console.log(nftsData.length)
      console.log(nftsData[0].image)
    }
    console.log(nftsData)
  } catch (e) {
    console.log('Error, load images')
    console.log(e)
  }
}

//get data about NFT's sold state
export const loadNftState = async (dispatch, contract) => {
  try{
    const tab = []
    const totalSupply = await contract.methods.totalSupply().call()


    for(let i=1; i<=totalSupply; i++){
      const state = await contract.methods.sold(i).call()
      if(state){
        tab.push(await contract.methods.ownerOf(i).call()) //if sold, then add owner address
      } else {
        tab.push(state)
      }
    }
    dispatch(nftStateLoaded(tab))
  } catch (e) {
    console.log('Error, load NFT state', e)
  }
}



/*export const buyNft = async (dispatch, id, price) => {
  try{
    const web3 = await loadWeb3(dispatch)
    await loadNetwork(dispatch, web3)
    const account = await loadAccount(dispatch, web3)
    const netId = await web3.eth.net.getId()
    const contract = await loadContract(dispatch, web3, netId)

    await contract.methods.buy(id).send({from: account, value: price})
      .on('receipt', async (r) => {
        update(dispatch)
        toast.info(`NFT with ID: ${id} received\n`, {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        });
        window.alert(`Congratulations, you've received NFT with ID: ${id}\nAddress: addresse du contrat`)
      })
      .on('error',(error) => {
        console.error(error)
        window.alert(`There was an NFT STORE error !`)
      })
  } catch (e){
    console.log('Error, buy NFT', e)
  }
  
}*/


export const buyNft = async (dispatch, id, price) => {
  try{
    const web3 = await loadWeb3(dispatch)
    await loadNetwork(dispatch, web3)
    const account = await loadAccount(dispatch, web3)
    const netId = await web3.eth.net.getId()
    const contract = await loadContract(dispatch, web3, netId)

    await contract.methods.buy(id).send({from: account, value: price})
      .on('receipt', async (r) => {
        update(dispatch)
        toast.dark(`NFT with ID: ${id} received\n`, {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          });
        //window.alert(`Congratulations, you've received NFT with ID: ${id}`)
      })
      .on('error',(error) => {
        console.error(error)
        window.alert(`There was an error!`)
      })
  } catch (e){
    console.log('Error, buy NFT', e)
  }
}

export const getAccount = async (dispatch) => {
  try{
    const web3 = await loadWeb3(dispatch)
    await loadNetwork(dispatch, web3)
    const account = await loadAccount(dispatch, web3)
    return account
  } catch (e){
    console.log('getAccount', e)
  }
}


export const getContractGame = async (dispatch) => {
  try{
    const web3 = await loadWeb3(dispatch)
    await loadNetwork(dispatch, web3)
    const netId = await web3.eth.net.getId()
    const contractGame = await loadContractGame(dispatch, web3, netId)
    return contractGame
  } catch (e){
    console.log('erreur lors de getContractGame')
    console.log(e)
    return null
  }
}

export const updateContractStateInteraction = async (dispatch, newValue, refThis) => {
  try{
    const account = await getAccount(dispatch)
    const contractGame = await getContractGame(dispatch)
    contractGame.methods.setState(newValue).send({
      from: account,
    })
    .on('confirmation', function(receipt){
      refThis.props.changeContractState(newValue)
    })
    .on('error', function(error){
      console.log(`une erreur est apparue ${error}`)
    })
  } catch (e){
    console.log('erreur lors du updateContractStateInteraction avec la valeur: ' + newValue)
    console.log(e)
  }
}

export const getNomDuContrat = async (dispatch) => {
  try{
    const contractGame = await getContractGame(dispatch)
    let contractName = await contractGame.methods.name().call()
    return(contractName)
  } catch (e){
    console.log('Error, getNomDuContrat', e)
  }
}

export const getGameState = async (dispatch) => {
  try{
    const contractGame = await getContractGame(dispatch)
    let gameState = await contractGame.methods.getState().call()
    return(gameState)
  } catch (e){
    console.log('Error, getGameState', e)
  }
}




//get NFTs data from nftsData.js generated while minting
/*export const loadNftData = async (dispatch, contract) => {
  try{
    const totalSupply = await contract.methods.totalSupply().call()
    const uri = await contract.methods.tokenURI(1).call()

    fetch(uri)
      .then(result => {
        if(true        commentaire à droite          Number(totalSupply)===nftsData.length){
          dispatch(metadataLoaded(nftsData))
          console.log("dispatch réussi")
        }
        else{console.log("dispatch fail")
          console.log(Number(totalSupply))
        console.log(result)
        console.log(nftsData.length)
        console.log(nftsData[0].image)
      }
      console.log(nftsData)
      })
      .catch(e => {
        console.log('Error lors de promise')
        console.log(e)
      })
  } catch (e) {
    console.log('Error, load images')
    console.log(e)
  }
}
*/