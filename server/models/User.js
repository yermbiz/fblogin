'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fbId: { type:String, unique: true, index: true, required: true },
  name: { type: String, required: true },
  lastLogin:   { type: Date, required: true },
  registrationDate:  { type: Date, required: true },
  clientId: { type:String, unique: true, index: true, required: true }
});

mongoose.Promise = global.Promise;
module.exports = mongoose.model('User', userSchema);
