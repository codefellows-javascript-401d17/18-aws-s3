'use strict';

const createError = require('http-errors');
const debug = require('debug')('app: bear-auth-middleware');
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  debug('bear- auth')

  let authHeader = req.headers.authorization;

  if(!authHeader) return next(createError(401, 'Authorization Header Required'));

  let splitHead = authHeader.split('Bearer ')[1];
  if(!splitHead) return next(createError(401, 'Token required'));

  jwt.verify(splitHead, process.env.APP_SECRET, (err, decde) => {
    if(err) return next(createError(401, err.message));

    User.findOne({hash: decode.token})
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => next(createError(401, err.message)));
  });
};