import React, { Component } from 'react';
//import { TwitterTimelineEmbed} from 'react-twitter-embed';

import './App.css';
import { connect } from 'react-redux'
import { updateContractStateInteraction } from './store/interactions'

import {
  contractSelector,
  metadataSelector,
  nftStateSelector,
  networkSelector,
  accountSelector
} from './store/selectors'
import LifeIcon from './images/Iicon-life.png'
import AttackIcon from './images/Iicon-attack.png'
import DefenseIcon from './images/Iicon-defense.png'
import PowerIcon from './images/Iicon-power.png'
import { nftsData } from './backEnd/nftsData.js'



class Main extends Component {

  async betFunction(player) {
    let elem = document.getElementById("betAmount1")
    if (elem && elem.value === "") {
      this.setState({error: 1})
    }
    else {
      let amount = elem.value
      await this.props.makeBet(amount, player)
    }
  }

  hideError() {
    this.setState({error: 0})
  }

  async updateContractState(newValue) {
    let refThis = this
    if (this.props.contractState === newValue) {
      console.log('pas de changement d\'état à faire')
      return
    }
    updateContractStateInteraction(this.props.dispatch, newValue, refThis)
  }

  constructor(props) {
    super(props)
    this.state = {
      error: 0
    }

    this.betFunction = this.betFunction.bind(this)
    this.updateContractState = this.updateContractState.bind(this)

  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
            <div className="col-sm">
              {/*<h4>affichage de contractStatestate: {this.props.contractState}</h4>*/}
              {!this.props.fight.p1 ? 
                <div>
{console.log("mauvaise condition\n\n")}
                </div>
              :
              <div className="row">

                <div className="col">
                      <p className="fighterName1"> { nftsData[this.props.fight.p1 - 1].name } </p>

                      <p className="colorBar1"></p>
                      <p> <img src={LifeIcon} data-descr="Life" alt="" width="24" height="24"/> { nftsData[this.props.fight.p1 - 1].life } </p>
                      <p> <img src={PowerIcon} data-descr="Power" alt="" width="24" height="24"/> { nftsData[this.props.fight.p1 - 1].power } </p>
                      <p> <img src={AttackIcon} data-descr="Attack" alt="" width="24" height="24"/> { nftsData[this.props.fight.p1 - 1].attack } </p>
                      <p> <img src={DefenseIcon} data-descr="Defense" alt="" width="24" height="24"/> { nftsData[this.props.fight.p1 - 1].defence } </p>
                      <p> <img src={nftsData[this.props.fight.p1 - 1].image} className="fightImage"  alt="fightImage1" /></p>
                </div>
                <div className="col">
                      <p className="fighterName2"> { nftsData[this.props.fight.p2 - 1].name } </p>
                      <p className="colorBar2"></p>
                      <p> <img src={LifeIcon} data-descr="Life" alt="" width="24" height="24"/> { nftsData[this.props.fight.p2 - 1].life } </p>
                      <p> <img src={PowerIcon} data-descr="Power" alt="" width="24" height="24"/> { nftsData[this.props.fight.p2 - 1].power } </p>
                      <p> <img src={AttackIcon} data-descr="Attack" alt="" width="24" height="24"/> { nftsData[this.props.fight.p2 - 1].attack } </p>
                      <p> <img src={DefenseIcon} data-descr="Defense" alt="" width="24" height="24"/> { nftsData[this.props.fight.p2 - 1].defence } </p>
                      <p> <img src={nftsData[this.props.fight.p2 - 1].image} className="fightImage" alt="fightImage2"/></p>
                </div>
              </div>
                
              }

              <div className="row">
                <div className="col">
                <h4 className="fighterName1">
                  total1: { Number(( this.props.total1 ).toFixed(4)) } ETH
                </h4>
                </div>
                <div className="col">
                <h4 className="fighterName2">
                total2: { Number(( this.props.total2 ).toFixed(4)) } ETH
                </h4>
                </div>
              </div>

              <main role="main" className="col-lg-12 d-flex text-center">
                <div className="content mr-auto ml-auto">
                  <p>&nbsp;</p>
                    <div className="form-group mr-sm-2">
                      <input
                        id="betAmount1"
                        type="number"
                        min="0"
                        ref={(input) => { this.betAmount1 = input }}
                        placeholder="Bet Amount ?"
                        />
                    </div>
                    <div className="row m-2">
                      <div className="col">
                        <button id="recupAmount1" type="button" onClick={() => { this.betFunction(1) }} className="btn btn-primary btn-block">Bet on P1</button>
                      </div>
                      <div className="col">
                        <button id="recupAmount2" type="button" onClick={() => { this.betFunction(2) }} className="btn btn-primary btn-block">Bet on P2</button>
                      </div>
                    </div>
                  { this.state.error
                    ? <div className="alert alert-danger"  onClick={() => { this.hideError() }} >
                      <strong>Danger!</strong> Enter a valid number

                       &ensp; &emsp;
                      <button>x</button>  
                    </div>
                    :
                    <div></div>
                  }
                  <div className="amountWagered">
                    <h4>
                      Amount wagered : { Number(( this.props.amountWagered ).toFixed(4)) } ETH
                    </h4>
                  </div>
                  <p>&nbsp;</p>
                  { /*
                  
                  <p>
                    contract state: {this.props.contractState}
                  </p>
                  */ }
                  {this.props.winner !== '' ?
                  <p>
                    fight winner : {this.props.winner}
                  </p> :
                  <p>
                    fight winner:
                  </p>
                  }
                </div>
              </main>
            </div>
                <div className="row m-2">
                  {/*
                  <div className="col">
                    <button id="recupAmount" type="button" onClick={() => { this.updateContractState(0) }} className="btn btn-secondary btn-block">setState 0</button>
                  </div>
                  <div className="col">
                    <button id="recupAmount" type="button" onClick={() => { this.updateContractState(1) }} className="btn btn-secondary btn-block">setState 1</button>
                  </div>
                  */}
                </div>
                <div className="row m-2">
                </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    metadata: metadataSelector(state),
    contract: contractSelector(state),
    nftState: nftStateSelector(state),
    network: networkSelector(state),
    account: accountSelector(state)
  }
}

export default connect(mapStateToProps)(Main)
