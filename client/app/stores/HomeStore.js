'use strict';

import alt from '../alt';
import HomeActions from '../actions/HomeActions';

class HomeStore {
  constructor() {
    this.bindActions(HomeActions);
    this.fbUser = undefined;
    this.checkedOnStart = false;
  }


  onUnauthorized() {
    this.fbUser = null;
    this.checkedOnStart = true;
  }

  onLogoutSuccessfully() {
    this.fbUser = null;
    this.checkedOnStart = true;
  }
  onAuthorizedSuccessfully(fbUser){
    this.fbUser = fbUser;
    this.checkedOnStart = true;
  }

  onAuthorizationFailed(){
    this.fbUser = null;
    this.checkedOnStart = true;
  }

  onAuthorizationCancelled() {
    if(this.fbUser === undefined) { this.fbUser = null;}
    this.checkedOnStart = true;
  }

}

export default alt.createStore(HomeStore);
