import React, { Component } from 'react'
import { connect } from 'react-redux'

class Loading extends Component {
  render() {
    return(
      <div className="loading text-center centered" style={{ color: "#55FF55" }}>
	      Loading ........................
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
  }
}

export default connect(mapStateToProps)(Loading)