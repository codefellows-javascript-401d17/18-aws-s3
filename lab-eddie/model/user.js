'use strict';

const mongoose = require('mongoose');
const debug = require('debug')('app: user.js');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const createError = require('http-errors');

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

    

};