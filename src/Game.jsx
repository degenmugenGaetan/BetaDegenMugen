import React, { Component } from 'react';
//import { TwitchEmbed, TwitchChat, TwitchClip, TwitchPlayer } from 'react-twitch-embed';
//import { TwitchChat, TwitchPlayer } from 'react-twitch-embed';
import Web3 from 'web3'
import { toast } from 'react-toastify';
import ContractGame from './backEnd/abis/DegenMugen.json'
import { degenmugenAddress } from './ContractConfig'
import 'react-toastify/dist/ReactToastify.css';
import { getNomDuContrat, getAccount, getContractGame, getGameState, NETWORK } from './store/interactions'
import { connect } from 'react-redux'
import Main from './Main'

import {
    contractSelector,
    metadataSelector,
    contractGameSelector,
    networkSelector
} from './store/selectors'


  const statusToClassName = {
    0: "row banner bannerGreen",
    1: "row banner bannerRed",
    2: "row banner bannerBlue",
  };

  const statusToText = {
    0: "Bets are open",
    1: "Bets are closed",
    2: "Result",
  };

toast.configure();

class Game extends Component {

    async UNSAFE_componentWillMount() {
        let name = await getNomDuContrat(this.props.dispatch)
        let contractGameState = await getGameState(this.props.dispatch)
        this.changeContractState(contractGameState)
        await this.loadWeb3Event()
        //nomDuContrat
    }
    
  betMadeDebug(event, web3) {
    console.log("betMadeDebug")

    console.log("adresse du pari " + event.returnValues['_from'])
    console.log("adresse du value " + event.returnValues['_value'])
    console.log("adresse du player " + event.returnValues['_player'])
    console.log("val en eth:", web3.utils.fromWei(event.returnValues['_value'], "ether"))
  }

    notify = (value) => {
        toast.info(`You just received ${value} ETH`, {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    notifyBet = (value, player) => {
        toast.info(`You just bet ${value} ETH on P${player}`, {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    changeContractState(newValue) {
      console.log("changement de contractStatestate fct: " + newValue)
      this.setState({contractState: newValue})
    }

    async loadWeb3Event() {
      const web3 = new Web3(window.ethereum)
      const web3Ws = new Web3('ws://localhost:8545')
      // Network ID
      const networkId = await web3.eth.net.getId()
      const networkData = NETWORK[networkId]
      let account = await getAccount(this.props.dispatch)
      if(networkData) {
        const DegenMugenContractWs = new web3Ws.eth.Contract(ContractGame, degenmugenAddress)
        this.setState({ DegenMugenContractWs })
        this.setState({ account })
        this.setState({ contractAddress: degenmugenAddress })
        this.setState({ loading: false})

        let refThis = this
        let myEvent = DegenMugenContractWs.events.allEvents({
          fromBlock: "latest", 
        }, function (error, event) {
          if (error) {
            console.log(error)
          }
          if (event && event.event === "myDebug") {
            console.log("myDebug: " + event.returnValues['value'])
          }
          else if (event && event.event === "debugEventStr") {
            console.log("debugEventStr: " + event.returnValues['_value'])
          }
          else if (event && event.event === "debugEventUint") {
            console.log("debugEventUint: " + event.returnValues['_message'] + event.returnValues['_value'])
          }
          else if (event && event.event === "betMade"){
            refThis.betMadeDebug(event, web3)
            let newVal = web3.utils.fromWei(web3.utils.toBN(event.returnValues['_value']), "ether")
            let player = parseInt(event.returnValues['_player']).toString()
            refThis.betMadeUI(newVal, parseInt(event.returnValues['_player']).toString())
            if (refThis.state.account === event.returnValues['_from']) {
              refThis.notifyBet(newVal, player)
              refThis.amountWageredUI(newVal)
            }
          }
          else if (event && event.event === "changeState"){
            console.log(event)
            console.log("changeState event value: ", event.returnValues['_value'])
            refThis.changeContractState(event.returnValues['_value'])
            console.log("changement de contractStatestate event " + event.returnValues['_value'])
          }
          else if (event && event.event === "fight"){
            console.log("nouvel event fight")
            console.log(event)
            console.log("fight event p1 value: ", event.returnValues.p1)
            console.log("fight event p2 value: ", event.returnValues.p2)
            console.log("fight event stage value: ", event.returnValues.stage)
            refThis.resetValue()
            refThis.state.fight.p1 = event.returnValues.p1
            refThis.state.fight.p2 = event.returnValues.p2
            refThis.state.fight.stage = event.returnValues.stage
          }
          else if (event && event.event === "fightWinner"){
            console.log("nouvel event fightWinner")
            console.log(event)
            console.log("fightWinner event winner value: ", event.returnValues.winner)
            refThis.state.winner = event.returnValues.winner
          }
          else if (event && event.event === "trPaid"){
            console.log("nouvel event trPaid")
            console.log(this.props);
            if (refThis.state.account === event.returnValues._to) {
              console.log(event)
              console.log("trPaid event paid address: ", event.returnValues._to)
              console.log("trPaid event paid value: ", web3.utils.fromWei(event.returnValues.amount, "ether"))
              refThis.notify(web3.utils.fromWei(event.returnValues.amount, "ether"))
            }
          }
          else {
            console.log("event sans nom....")
            console.log(event)
          }
          //refThis.setState({contractState: 0})
        })


      } else {
        window.alert('ContractGame contract not deployed to detected network.')
      }
  }

    resetValue() {
      this.setState((prevState, props) => ({
        winner: '',
        total1: 0,
        total2: 0,
        amountWagered: 0,
      }))
    }

    betMadeUI(newVal, player) {
      if (player === "1") {
        this.setState({ total1: this.state.total1 + parseFloat(newVal) })
      } else if (player === "2") {
        this.setState({ total2: this.state.total2 + parseFloat(newVal) })
      }
    }

    amountWageredUI(amount) {
      this.setState({ amountWagered: parseFloat(amount) })
    }

    async makeBet(amount, player) {
      try {
        this.setState({ loading: true})
        amount = amount.toString()
        //let ethAmount = amount
        amount = Web3.utils.toWei(amount, 'ether')
        let account = await getAccount(this.props.dispatch)
        let contractGame = await getContractGame(this.props.dispatch)
        contractGame.methods.bet(amount, player).send({
          from: account,
          value: amount })
        .on('confirmation', (r) => {
        })
        .on('receipt', (r) => {
          console.log("pari placé! ")
        })
        .on('error',(error) => {
        console.error(error)
        //window.alert(`There was an error!`)
        })
        this.setState({ loading: false })
      } catch (e) {
        console.log("Une erreur est arrivée dans makeBet ")
        console.log(e.message)
      }
      /*.once('receipt', (receipt) => {
        
      })*/
    }

    constructor(props) {
      super(props)
      this.state = {
        account: '',
        DegenMugenContractWs: null,
        name: '',
        nomDuContrat: 'PAS DE NOM',    /// A SUPP !!!!!!!!!!!!!!!!!!!
        contractAddress: '',
        contractState: -1,
        fight: {
          p1: '',
          p2: '',
          stage: '',
        },
        total1: 0,
        total2: 0,
        amountWagered: 0,
        winner: '',
        loading: false
      }



      this.makeBet = this.makeBet.bind(this)
      this.betMadeUI = this.betMadeUI.bind(this)
      this.notify = this.notify.bind(this)
      this.notifyBet = this.notifyBet.bind(this)
      this.changeContractState = this.changeContractState.bind(this)

      this.betMadeDebug = this.betMadeDebug.bind(this)
      this.amountWageredUI = this.amountWageredUI.bind(this)
      this.resetValue = this.resetValue.bind(this)
    }

    render() {
    return (
        <div>
            <div className="row">
              <div className={statusToClassName[this.state.contractState]}>
                <h3 className="content mr-auto ml-auto text-center">{statusToText[this.state.contractState]}</h3>
              </div>
                <div className="col-sm-3">
                    <Main 
                        makeBet={this.makeBet}
                        amountWageredUI={this.amountWageredUI}
                        contractState={this.state.contractState}
                        changeContractState={this.changeContractState}
                        fight={this.state.fight}
                        winner={this.state.winner}
                        total1={this.state.total1}
                        total2={this.state.total2}
                        amountWagered={this.state.amountWagered}
                    />
                </div>
                <div className="col-sm-6">
                    <div>
                        TwitchPlayer
                    </div>
                </div>
                    <div className="col-sm-3">
                        <div className="col">
                            TwitchChat
                        </div>
                </div>
            </div>
        </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    contractSelector,
    contractGameSelector,
    metadataSelector,
    networkSelector
  }
}

export default connect(mapStateToProps)(Game)