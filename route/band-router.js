'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const debug = require('debug')('cfgram:band-router');

const Band = require('../model/band.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const bandRouter = module.exports = Router();

bandRouter.post('/api/band', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/band');

  req.body.userID = req.user._id;
  new Band(req.body).save()
  .then(band => res.json(band))
  .catch(next);
});

bandRouter.get('/api/band/:id', bearerAuth, function(req,res, next) {
  debug('GET: /api/gallery/:id');

  Band.findById(req.params.id)
  .then(band => res.json(band))
  .catch(next);
});

bandRouter.put('/api/band/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/band/:id');

  Band.findByIdAndUpdate(req.params.id, req.body, { 'new': true })
  .then(band => res.json(band))
  .catch(err => {
    if(err.name === 'ValidationError') return next(err);
    next();
  });
});

bandRouter.delete('/api/band/:id', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/band/:id');

  Band.findByIdAndRemove(req.params.id)
  .then( () => res.status(204).send())
  .catch(next);
});
