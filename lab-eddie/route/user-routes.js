'use strict';

const Router = require('express').Router;
const debug = require('debug')('app:user router');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();

const basicAuth = require('../lib/basic-auth.js');
const userRouter = new Router();
const User = require('../model/user.js');

basicAuth.post('api/newuser', jsonParser, (req, res) => {
  debug('POST: api/newuser');

  let passWord = req.body.passWord;
  delete req.body.passWord;

  let user = new User(req.body)
  
  user.hashPass(passWord)
  .then(user => user.save())
  .then(user => user.signToken())
  .then(token => res.json(token))
  .catch(err => next(createError(400, err.message)));
});

userRouter.get('/api/signin',basicAuth , function(req, res, next) {
  debug('GET /api/signin');

  User.findOne({userName: req.auth.userName})
  .then(user => user.confirmHash(req.auth.passWord))
  .then(user => user.signToken())
  .then(token => res.send(token))
  .catch(next);
});

module.exports = authRoute;