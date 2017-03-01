'use strict';

const Joi = require('joi');
const mongoose = require('mongoose');
const crypto = require('crypto');

const reqValidationSchema = Joi.object().keys({
  accessToken: Joi.string().required(),
  fbId: Joi.string().required(),
  name: Joi.string().required(),
}).required();

const createUser = (userData, next) => {
  const User = mongoose.model('User');
  const registrationDate = Date.now();
  const user = new User({
    fbId: userData.fbId,
    name: userData.name,
    lastLogin: registrationDate,
    registrationDate,
    clientId: crypto.createHash('md5').update(userData.accessToken).digest('hex')
  });

  user.save((err, userDoc) => {
    if (err) return next(500);
    else {
      return next(null, userDoc);
    }
  });

};

const validateAccessToken = (fbgraph, accessToken, fbId, next) => {
  fbgraph.setAccessToken(accessToken);
  fbgraph.get(fbId, (err, res) => {
    if (err) return next(err);
    if(fbId === res.id) { return next(null);}
    return next('err');
  });
};

const processUserRecordBasedOnToken = (fbgraph, {fbId, name, accessToken} , next) => {
  const User = mongoose.model('User');
  User.findOne({ fbId }, (err, userDoc) => {
    if (err) return next(500);

    // user found
    if (userDoc) {
      User.findOneAndUpdate({fbId }, { '$set': {lastLogin: Date.now() }}, { upsert:false }, (err) => {
        if (err) return next(500);
        return next(null, userDoc);
      });
    } else {
      return createUser({fbId, name, accessToken }, next);
    }
  });
};

/**
 * POST /api/auth
 * Client authorization
 */
module.exports = function(fbgraph) {
  return (req, res) => {
    const body = req.body;

    const reqDataOk = () => {
      validateAccessToken(fbgraph, body.accessToken, body.fbId, (err) => {
        if (err) return res.status(401).send();
        return processReq();
      });
    };

    // process user record / generate clientId
    const processReq = () => {
      processUserRecordBasedOnToken(fbgraph, {fbId: body.fbId, name: body.name, accessToken: body.accessToken}, (err, doc) => {
        if (err) return res.status(err).send();
        res.status(200).send({clientId:doc.clientId});
      });
    };

    Joi.validate(body, reqValidationSchema, (err) => {
      if (err) return res.status(400).send({ msg:'Missing required data'});
      return reqDataOk();
    });

  };
};
