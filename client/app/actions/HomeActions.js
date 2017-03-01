'use strict';

import alt from '../alt';

class HomeActions {
  constructor() {
    this.generateActions(
      'authorizedSuccessfully',
      'authorizationCancelled',
      'authorizationFailed',
      'logoutSuccessfully',
      'unauthorized'
    );
  }

  authenticateClient(fbUser, next) {
    $.ajax({
      type: 'POST',
      url: '/api/auth',
      data:  JSON.stringify({fbId:fbUser.fbId, accessToken:fbUser.accessToken, name: fbUser.name}),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
    })
      .done((response) => {
        fbUser.clientId = response.clientId;
        return next(null, fbUser);
      })
      .fail(() => {
        return next('err');
      });
  }

  me(response, fbUser, authSuccessAction, authFailedAction){
    let self = this;
    fbUser = {fbId: response.authResponse.userID, connection:response.status, accessToken:response.authResponse.accessToken};
    FB.api('/me', function(response) {
      fbUser.name = response.name;
      self.authenticateClient(fbUser, (err, fbUser) => {
        if (err && authFailedAction) return authFailedAction();
        return authSuccessAction(fbUser);
      });
    });
  }

  fbLogin(authSuccessAction, authCancelAction, authFailedAction) {
    let self = this;
    var fbUser = {};
    if (typeof FB !== 'undefined'){
      FB.login(function(response) {
        if (response.authResponse) {
          return self.me(response, fbUser, authSuccessAction, authFailedAction);
        } else {
          return authCancelAction();
        }
      });
    }
  }

  checkLoginFB(authSuccessAction, unauthorized, authCancelAction, authFailedAction) {
    var fbUser = {};
    let self = this;
    if (typeof FB !== 'undefined'){
      FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
          return self.me(response, fbUser, authSuccessAction, authFailedAction);
        } else if (response.status === 'not_authorized') {
          return unauthorized();
        } else {
          self.fbLogin(authSuccessAction, authCancelAction, authFailedAction);
        }
      });
    }
  }

  logoutFB(logoutSuccessAction) {
    if (typeof FB !== 'undefined'){
      FB.logout(function() {
        return logoutSuccessAction();
      });
    }
  }

  logout() {
    this.logoutFB(this.logoutSuccessfully);
  }

  checkLogin() {
    this.checkLoginFB(this.authorizedSuccessfully, this.unauthorized, this.authorizationCancelled,  this.authorizationFailed);
  }
  login() {
    this.fbLogin(this.authorizedSuccessfully, this.authorizationCancelled, this.authorizationFailed);
  }
}

export default alt.createActions(HomeActions);
