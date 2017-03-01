'use strict';

// Babel ES6/JSX Compiler
require('babel-register');

const mongoose = require('mongoose');
const crypto = require('crypto');

const Code = require('code');
const Lab = require('lab');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const beforeEach = lab.beforeEach;
const after = lab.after;
const expect = Code.expect;

const User = require('../../../server/models/User');
const postAuth = require('../../../server/handlers/postAuth')();

const config = {
  database: 'localhost/fblogintest'
}

const createUser = (userData, next) => {
  const User = mongoose.model('User');
  const currentTimestamp = Date.now();

  const user = new User({
    fbId: userData.fbId,
    name: userData.name,
    lastLogin: currentTimestamp,
    registrationDate: currentTimestamp,
    clientId: crypto.createHash('md5').update(userData.accessToken).digest("hex")
  });

  user.save((err, userDoc) => {
    if (err) return next(500);
    else {
      return next(null, userDoc);
    }
  });
}

describe('postAuth', () => {
  before(done => {
    mongoose.Promise = global.Promise;
    mongoose.connect(config.database);
    mongoose.connection.on('error', (err) => {
      console.info('\n\n => Error: Could not connect to MongoDB. Did you forget to run `mongod`?');
      process.exit(0);
    });

    process.on('SIGINT', () => { });

    mongoose.connection.on('disconnected', () => {
      console.log('\n\n => Mongoose disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.log('\n\n => Mongoose default connection error: ' + err);
      process.exit(0);
    });

    mongoose.connection.on('connected', () => {
      console.log('\n\n => Mongoose default connection open to ' + config.database);
    });
    done();
  });

  after(done => {
    mongoose.connection.close( () => {
      done();
    });
  });

  beforeEach(done => {
    User.remove({}, (err) => {
      if (err) return process.exit(0);
      done();
    });
  });

  describe('validate req', () => {

    it('with missing req body, returns status code 400', done => {
      const res = {status: code => {
        expect(code).to.equal(400);
        return {send: (msg) => {
          done();
        }};
      }};
      postAuth({}, res);

    });

    it('with empty req body, returns status code 400', done => {
      const res = {status: code => {
        expect(code).to.equal(400);
        return {send: (msg) => {
          done();
        }};
      }};
      postAuth({ body: {}}, res);

    });

    it('with missing accessToken body param in req, returns status code 400', done => {
      const res = {status: (code) => {
        expect(code).to.equal(400);
        return {send: (msg) => {
          done();
        }};
      }};
      postAuth({ body: {fbId: 'fbId', name: 'name' }}, res);

    });

    it('with missing fbId body param in req, returns status code 400', done => {
      const res = {status: (code) => {
        expect(code).to.equal(400);
        return {send: (msg) => {
          done();
        }};
      }};
      postAuth({ body: {accessToken: 'accessToken', name: 'name' }}, res);

    });

    it('with missing name body param in req, returns status code 400', done => {
      const res = {status: (code) => {
        expect(code).to.equal(400);
        return {send: (msg) => {
          done();
        }};
      }};
      postAuth({ body: {accessToken: 'accessToken', fbId: 'fbId' }}, res);

    });
  });


  describe('responses of fbgraph req', () => {

    it('with err response req body, returns status code 401', done => {

      const fbgraphMock = {
        setAccessToken: () => {},
        get: (fbId, next) => {
          return next('err');
        }
      }
      const postAuth = require('../../../server/handlers/postAuth')(fbgraphMock);

      const res = {status: (code) => {
        expect(code).to.equal(401);
        return {send: (msg) => {
          done();
        }};
      }};
      postAuth({ body: { name: 'name', fbId: 'fbId', accessToken: 'accessToken' }}, res);

    });

    it('with non-equal fbId response req body, returns status code 401', done => {

      const fbgraphMock = {
        setAccessToken: () => {},
        get: (fbId, next) => {
          return next(null, {id:'wrongUser'});
        }
      }
      const postAuth = require('../../../server/handlers/postAuth')(fbgraphMock);

      const res = {status: (code) => {
        expect(code).to.equal(401);
        return {send: (msg) => {
          done();
        }};
      }};
      postAuth({ body: { name: 'name', fbId: 'fbId', accessToken: 'accessToken' }}, res);

    });

  });

  describe('processing user record', () => {

    it('when new user, account with clientId will be created, returns cliendId data and status code 401', done => {

      const fbgraphMock = {
        setAccessToken: () => {},
        get:  (fbId, next) => {
          return next(null, {id:'fbId'});
        }
      }
      const postAuth = require('../../../server/handlers/postAuth')(fbgraphMock);

      const res = {status: (code) => {
        expect(code).to.equal(200);
        return {send: (msg) => {
          expect(msg.caId).to.not.be.null();

          User.findOne({fbId:'fbId'} , (err, userDoc) => {
            expect(userDoc.caId).to.equal(msg.caId);
            expect(userDoc.name).to.equal('name');
            done();
          });
        }};
      }};
      postAuth({ body: { name: 'name', fbId: 'fbId', accessToken: 'accessToken' }}, res);

    });


    it('when already existing user, returns clientId data and status code 200', done => {
      createUser({fbId:'fbId', name:'name', accessToken:'accessToken' }, (err, doc) => {
        expect(err).to.be.null();
        expect(doc).to.be.not.null();
        const createdClientId = doc.clientId;
        const fbgraphMock = {
          setAccessToken: () => {},
          get: (fbId, next) => {
            return next(null, {id:'fbId'});
          }
        }
        const postAuth = require('../../../server/handlers/postAuth')(fbgraphMock);

        const res = {status: (code) => {
          expect(code).to.equal(200);
          return {send: (msg) => {
            expect(createdClientId).to.equal(msg.clientId);
            done();
          }};
        }};
        postAuth({ body: { name: 'name', fbId: 'fbId', accessToken: 'accessToken' }}, res);
      });
    });
  });
});
