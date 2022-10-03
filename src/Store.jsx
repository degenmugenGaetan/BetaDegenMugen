import React, { Component } from 'react'
import { buyNft } from './store/interactions'
import { connect } from 'react-redux'
import Identicon from 'identicon.js';
import Loading from './StoreLoading'
import {
    contractSelector,
    metadataSelector,
    nftStateSelector,
    networkSelector
} from './store/selectors'

import './StoreStyle.css'
import LifeIcon from './images/Iicon-life.png'
import AttackIcon from './images/Iicon-attack.png'
import DefenseIcon from './images/Iicon-defense.png'
import PowerIcon from './images/Iicon-power.png'


class Main extends Component {
    state = {
        items: this.props.metadata,
        filter: '',
        show: false,
        fullscreen: true,
        id: 0
    }

    handleChange = (e) => {
        this.setState({ filter: e.target.value });
    }

    render() {

        console.log("affichage de this.props.metadata")
        console.log(this.props.metadata)

        try{
            return (
                <div className="container" style={{ color: "#64E9EE" }}>
                    <div className='row text-center'>
                        {this.props.metadata.map((nft, key) => {
                            return(
                                <div className="col" key={nft.id}>
                                    <div className="card mr-5 ml-5 mt-5 mb-5 zoom myCard " key={nft.id} style={{ width: '275px' }}>
                                        { this.props.nftState[nft.id-1] ?
                                            <a href={nft.image} target="_blank" rel="noopener noreferrer">
                                                <img className='card-img-top' src={`data:image/png;base64,${nft.img}`} style={{ border: '2mm ridge #8B8B8B', width: '200px', height: '300px', align: "center", marginTop:"15px" }} alt="art"/>
                                            </a>
                                        : <a href={nft.image} target="_blank" rel="noopener noreferrer">
                                                <img className='card-img-top' src={`data:image/png;base64,${nft.img}`} style={{ border: '2mm ridge #64E9EE', width: '200px', height: '300px', align: "center", marginTop:"15px" }} alt="art" />
                                            </a>
                                        }
                                        <div className="card-body pt-1">
                                            <div className="card-text" style={{color: "#8B8B8B", textAlign: "left", marginLeft: "18px"}}>
                                                ID: <div className="text-center" style={{ textAlign: "center", display: "inline", marginLeft: "18px"}}>{nft.id}</div>
                                            </div>
                                            <div className="card-text" style={{color: "#8B8B8B", textAlign: "left", marginLeft: "18px"}}>URI:
                                                <a href={nft.uri} target="_blank" rel="noopener noreferrer" className="text-center" style={{ color: "#64E9EE", textAlign: "center", display: "inline", marginLeft: "18px"}} >
                                                link
                                                </a>
                                            </div>
                                            <div style={{textAlign: "left", marginLeft: "18px"}}><img src={LifeIcon} data-descr="Life" alt="" width="16" height="16"/> : {nft.life}</div>
                                            <div style={{textAlign: "left", marginLeft: "18px"}}> <img src={PowerIcon}  data-descr="Pwer" alt="" width="16" height="16"/> : {nft.power}</div>
                                            <div style={{textAlign: "left", marginLeft: "18px"}}><img src={AttackIcon} data-descr="Attack" alt="" width="16" height="16"/> : {nft.attack}</div>
                                            <div style={{textAlign: "left", marginLeft: "18px"}}> <img src={DefenseIcon} data-descr="Defense" alt="" width="16" height="16"/> : {nft.defence}</div>
                                            {this.props.nftState[nft.id-1] ?
                                                <div className="text-left" style={{color: "#8B8B8B", textAlign: "left", marginLeft: "18px"}}>Owner:
                                                    <img
                                                        alt="id"
                                                        className="ml-2 id border border-success"
                                                        width="15"
                                                        height="15"
                                                        src={`data:image/png;base64,${new Identicon(this.props.nftState[nft.id-1], 30).toString()}`}
                                                    />{' '}
                                                    <a
                                                        href={`https://etherscan.io/address/` + this.props.nftState[nft.id-1]}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{color: "#64E9EE", "fontWeight": "normal"}}
                                                    >
                                                        { 
                                                        this.props.nftState[nft.id-1].substring(0,6) + '...' + this.props.nftState[nft.id-1].substring(this.props.nftState[nft.id-1].length - 4, this.props.nftState[nft.id-1].length)}
                                                    </a>
                                                </div>
                                                :
                                                <div>
                                                    <div className="" style={{color: "#8B8B8B", textAlign: "left", marginLeft: "18px"}}>Price: {nft.price/10**18} ETH</div>
                                                </div>
                                            }
                                            {this.props.nftState[nft.id-1] ?
                                                <button
                                                    type="Success"
                                                    className="btn btn-block"
                                                    style={{border: '3px ridge #8B8B8B', color: "#8B8B8B", width: '200px'}}
                                                    onClick={(e) => buyNft(this.props.dispatch, nft.id, nft.price)}
                                                    disabled
                                                >
                                                    <b>S o l d</b>
                                                </button>
                                                :
                                                <button
                                                    type="Success"
                                                    className="btn btn-block btn-outline"
                                                    style={{border: '3px ridge #64E9EE', color: "#64E9EE", width: '200px'}}
                                                    onClick={(e) => buyNft(this.props.dispatch, nft.id, nft.price)}
                                                >
                                                    <b>B u y</b>
                                                </button>
                                            }
                                            <button
                                                    className="btn btn-block btn-outline"
                                                    style={{border: '3px ridge #64E9EE', color: "#64E9EE", marginTop:"8px"}}
                                                    onClick={(e) => buyNft(this.props.dispatch, nft.id, nft.price)}
                                                >
                                                    <b>Detail</b>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
             )
        } catch(e) {
            console.log("affichage err")
            console.log(e)
            return(
                <Loading />
            )
        }
    }
}

function mapStateToProps(state) {
  return {
    metadata: metadataSelector(state),
    contract: contractSelector(state),
    nftState: nftStateSelector(state),
    network: networkSelector(state)
  }
}

export default connect(mapStateToProps)(Main)
