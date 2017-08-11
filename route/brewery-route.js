'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const debug = require('debug')('brewery:brewery-route');

const Brewery = require('../model/brewery.js');
const bearerAuth = require('../lib/bearer-auth-middleware');

const breweryRouter = module.exports = new Router();

breweryRouter.post('/api/brewery', bearerAuth, jsonParser, function(req, res, next){
  debug('POST: /api/brewery');

  req.body.timestamp = new Date();
  req.body.userID = req.user._id;
  new Brewery(req.body).save()
  .then( brewery => res.json(brewery))
  .catch(next);
});

breweryRouter.get('/api/brewery/:id', bearerAuth, function(req, res, next){
  debug('GET: /api/brewery');

  Brewery.findById(req.params.id)
  .populate('beers')
  .then( brewery => res.json(brewery))
  .catch(next);
});

breweryRouter.put('/api/brewery/:id', bearerAuth, jsonParser, function(req, res, next){
  debug('PUT: /api/brewery/:id');

  if(Object.keys(req.body).length === 0) {
    Brewery.findById(req.params.id)
    .then(brewery => {
      res.status(400);
      res.json(brewery);
    })
    .catch(next);
    return;
  }

  Brewery.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .then(brewery => res.json(brewery))
  .catch(next);
});

breweryRouter.delete('/api/brewery/:id', bearerAuth, function(req, res, next){
  debug('DELETE: /api/brewery/:id');

  Brewery.findByIdAndRemove(req.params.id)
  .then( () => res.status(204).send())
  .catch(next);
});
