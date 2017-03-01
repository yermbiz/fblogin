'use strict';

import React from 'react';
import HomeStore from '../stores/HomeStore';
import HomeActions from '../actions/HomeActions';

class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = HomeStore.getState();
    this.onChange = this.onChange.bind(this);
  }

  login() {
    HomeActions.login();
  }

  logout() {
    HomeActions.logout();
  }

  componentDidMount() {
    HomeStore.listen(this.onChange);
    setTimeout(function () {
      HomeActions.checkLogin();
    }, 1000);
  }

  componentWillUnmount() {
    HomeStore.unlisten(this.onChange);
  }

  onChange(state) {
    this.setState(state);
  }

  render() {
    let pane = (
      <div className="inner">
        <p>checking ...</p>
        <button className="button buttonFB" disabled onClick={this.login}>FB Login</button>
      </div>
    );

    if (this.state.checkedOnStart && !this.state.fbUser) {
      pane = (
        <div className="inner">
          <p>Welcome visitor, please login</p>
          <button className="button buttonFB" onClick={this.login}>FB Login</button>
        </div>
      );
    }

    if (this.state.fbUser && this.state.fbUser.name) {
      pane = (
        <div className="inner">
          <p>Welcome visitor, {this.state.fbUser.name}. Your clientID={this.state.fbUser.clientId}</p>
          <button className="button buttonFB" onClick={this.logout}>FB Logout</button>
        </div>
      );
    }

    return (
      <div id="page-content">
        {pane}
      </div>
    );
  }
}

export default Home;
