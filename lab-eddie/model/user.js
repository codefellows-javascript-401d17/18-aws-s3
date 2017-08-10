'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const creatError = require('http-errors');
const debug = require('debug')('app: user');
const crypto = require('crypto');
const Promise = require('bluebird');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const User = Schema({
  userName: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  passWord: {type: String, required: true},
  findHash: {type: String, unique: true}
});

User.methods.hashPass = function(password) {
  debug('generatePasswordHash');
  console.log(password)

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 5, (err, hash) => {
      if(err) return reject(err);
      this.passWord = hash;
      resolve(this);
    })
  })
}

User.methods.confirmPass = function(password) {
  debug('comparePass');


  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.passWord, (err, valid) => {
      if(err) return reject(err);
      if(!valid) return reject(creatError(401, 'Invalid Password!'));
      resolve(this);
    });
  });
};

User.methods.tokenGen = function() {
  debug('tokenGen');

  return new Promise((resolve, reject) => {
    let tries = 0;

    _generateHash.call(this);

    function _generateHash() {
      this.findHash = crypto.randomBytes(32).toString('hex');
      this.save()
      .then(() => resolve(this.findHash))
      .catch(err => {
        if(tries >2) return reject(err);
        tries++;
        _generateHash.call(this);
      });
    }
  });
};

User.methods.signToken = function() {
  debug('signToken');

  return new Promise((resolve, reject) => {
    this.tokenGen()
    .then(hash => {
      return resolve(jwt.sign({token: hash}, process.env.APP_SECRET))
    })
    .catch(err => reject(err));
  });
};

module.exports = mongoose.model('user', User);
