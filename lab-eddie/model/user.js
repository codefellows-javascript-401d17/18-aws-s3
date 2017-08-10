'use strict';

const mongoose = require('mongoose');
const debug = require('debug')('app: user.js');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');

const userSchema = new Schema({
  userName: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  passWord: {type: String, required: true},
  hash: {type: String, unique: true}
});

module.exports = mongoose.model('user', userSchema);

userSchema.methods.hashPass = function(passWord) {
  debug('hashPass');

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 5, (err, has) => {
      if(err) return reject(err);
      this.password = hash;
      this.save();
      resolve(this);
    })
  })
};

userSchema.methods.compareHash = function(password) {
  debug('compareHash');

  return new Promise((resolve, reject) => {

    bcrypt.compare(password, this.password, (err, valid) => {
      if(err) return reject(err);
      if(!valid) return reject(createError(401, 'Invalid password'));
      resolve(this)
    });
  });
}

userSchema.methods.generateToken = function() {
  debug('generateToken');
  
  return new Promise((resolve, reject) => {
    let tries = 0;

    _generateToken,call(this);

    function _generateToken() {
      this.hash = crypto.randomBytes(32).toString('hex');
      this.save()
      .then(() => resolve(this.hash))
      .catch(err => {
        if(tries >2) return reject(err);
        tries++;
        _generateToken().call(this);
      })
    }
  })
};

userSchema.methods.signToken= function() {
  debug('Sign Token');

  return new Promise((resolve, reject) => {

    this.generateToken()
    .then(hash => resolve(jwt.sign({token:hash}, process.env.APP_SECRET)))
    .catch(err => reject(err));
  });
}