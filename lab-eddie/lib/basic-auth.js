'use strict';

const createError = require('http-errors');
const debug = require('debug')('app: basic-auth-middleware');

module.exports = function(req, res, next) {
  debug('basic- auth');

  let header = req.headers.authorization
  if(!header) return next(createError(401, 'Header required'));

  let cryptToken = header.split('Basic ')[1];
  if(!cryptToken) return next(createError(401, 'No Token provided'));

  let trueToken = new Buffer(cryptToken, 'base64').toString();

  let userPass = trueToken.split(':');

  req.auth = {
    userName: userPass[0],
    passWord: userPass[1]
  }

  if(!req.auth.userName) return next(createError(401, 'Invalid User Name'));
  if(!req.auth.passWord) return next(createError(401, 'Invalid Password'));
  next();
};