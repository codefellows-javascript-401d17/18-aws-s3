'use strict';

const jsonParser = require('body-parser').json();
const debug = require('debug')('eula:auth-router');
const Router = require('express').Router;
const basicAuth = require('../lib/basic-auth-middleware.js');
const User = require('../model/user.js');
const createError = require('http-errors');

const authRouter = module.exports = Router();

authRouter.post('/api/signup', jsonParser, function (req, rsp, next) {
  debug('POST: /api/signup');

  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);

  user.generatePasswordHash(password)
    .then(user => {
      return user.save()
    })
    .then(user => {
      user.generateToken()
    })
    .then(token => rsp.send(token))
    .catch((err) => {
      next(err);
    });
});

authRouter.get('/api/signin', basicAuth, function (req, rsp, next) {
  debug('GET: /api/signin');
  console.log('authorization requetst', req.auth);
  User.findOne({ username: req.auth.username })
    .then(user => user.comparePasswordHash(req.auth.password))
    .then(user => user.generateToken())
    .then(token => rsp.send(token))
    .catch((err) => {
      next(createError(401, 'User could not be authenticated'));
    });
});

authRouter.all('*', function (req, rsp, next) {
  next(createError(404, 'not found'));
})