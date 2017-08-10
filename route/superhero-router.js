'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('cfgram:superhero-router');

const Superhero = require('../model/superhero.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const superheroRouter = module.exports = Router();

superheroRouter.post('/api/superhero', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/superhero');

  if (!req.body.name) {
    return next(createError(400, 'superhero name is not defined'));
  }
  if (!req.body.powers) {
    return next(createError(400, 'superhero powers is not defined'));
  }

  req.body.userID = req.user._id;
  new Superhero(req.body).save()
  .then( superhero => res.json(superhero))
  .catch(next);
});

superheroRouter.get('/api/superhero/:id', bearerAuth, function(req, res, next) {
  debug('GET: /api/superhero/:id');

  Superhero.findById(req.params.id)
  .then( superhero => {
    res.json(superhero);
  })
  .catch(next);
});

superheroRouter.put('/api/superhero/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/superhero/:id');

  for (var prop in req.body) {
    if (!Superhero[prop]) return next(createError(400, 'not a valid property'));
  }

  Superhero.findByIdAndUpdate(req.params.id, req.body, { new: true })
  .then( superhero => res.json(superhero))
  .catch(next);
});

superheroRouter.delete('/api/superhero/:id', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/superhero/:id');

  Superhero.findByIdAndRemove(req.params.id)
  .catch(next);
});
