'use strict';

const createError = require('http-errors');
const debug = require('debug')('eula:error-middleware');

module.exports = function(err, req, rsp, next) {
  debug('error middleware');

  console.error('message:', err.message);
  console.error('name:', err.name);

  if (err.status) {
    rsp.status(err.status).send(err.name);
    next();
    return;
  }


  if (Object.keys(req.body).length === 0 || err.name === 'ValidationError') {
    err = createError(400, err.message);
    rsp.status(err.status).send(err.name);
    next();
    return;
  }

  err = createError(500, err.message);
  rsp.status(err.status).send(err.name);
  next();
}