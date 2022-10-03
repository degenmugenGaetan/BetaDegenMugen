import React from 'react'
import { connect } from 'react-redux'
import { update } from './store/interactions'
import Store from './Store'
import './App.css';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import StoreNavbar from './StoreNavbar'
import CreateItem from './CreateItem';
import Game from './Game';


class App extends React.Component {
  async UNSAFE_componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    /* Case 1, User connect for 1st time */
    if(typeof window.ethereum !== 'undefined'){
      await update(dispatch)
      /* Case 2 - User switch account */
      window.ethereum.on('accountsChanged', async () => {
        await update(dispatch)
      });
      /* Case 3 - User switch network */
      window.ethereum.on('chainChanged', async () => {
        await update(dispatch)
      });
    }
  }

  render() {
    return (
      <BrowserRouter>
        <StoreNavbar />
        <Routes>
          <Route path='/CreateItem' element={<CreateItem />} />
          <Route path='/Store' element={<Store />} />
          <Route path='/App' element={<Game />} />
        </Routes>
      </BrowserRouter>
    );
  }
}

function mapStateToProps(state) {
  return {
  }
}

export default connect(mapStateToProps)(App)

/*

<WalletCard
        errorMessage={errorMessage} setErrorMessage={setErrorMessage}
        defaultAccount={defaultAccount} setDefaultAccount={setDefaultAccount}
        userBalance={userBalance} setUserBalance={setUserBalance}
      />

*/