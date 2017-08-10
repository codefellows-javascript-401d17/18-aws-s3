'use strict';

const createError = require('http-errors');
const debug = require('debug')('app:error');

module.exports = function(err, req, res, next) {
  debug('error middleware');

  if(err.status) {
    debug('user error')
    res.status(err.status).send(err.message);
    next();
    return;
  }

  if(err.name === 'ValidationError') {
    debug('Validation error')
    err = createError(400, err.message);
    res.status(err.status).send(err.message);
    next();
    return;
  }
  debug('server error')
  err = createError(500, err.message);
  res.status(err.status).send(err.message)
  next();
  return;
}