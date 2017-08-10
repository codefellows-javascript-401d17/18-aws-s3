'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('userex:comment-router');

const Comment = require('../model/comment.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const commentRouter = module.exports = Router();

commentRouter.post('/api/comment', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/comment');

  req.body.userID = req.user._id;
  new Comment(req.body).save()
    .then(comment => res.json(comment))
    .catch(next);
});

commentRouter.get('/api/comment/:id', bearerAuth, function(req, res, next) {
  debug('GET: /api/comment/:id');

  Comment.findById(req.params.id)
    .then(comment => {
      res.json(comment);
    })
    .catch(next);
});