'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const debug = require('debug')('brewery:beer router');
const Brewery = require('../model/brewery.js');
const Beer = require('../model/beer.js');

const beerRouter = module.exports = new Router();

beerRouter.post('/api/brewery/:breweryID/beer', jsonParser, function(req, res, next){
  debug('POST: /api/brewery/:breweryID/beer');

  Brewery.findByIdAndAddBeer(req.params.breweryID, req.body)
  .then( beer => res.json(beer))
  .catch(next);
});

beerRouter.get('/api/brewery/:breweryID/beer/:id', function(req, res, next){
  debug('GET: /api/brewery/:breweryID/beer/:id');

  Beer.findById(req.params.id)
  .then(beer => res.json(beer))
  .catch(next);
});

beerRouter.put('/api/brewery/:breweryID/beer/:id',jsonParser , function(req, res, next){
  debug('PUT: /api/brewery/:breweryID/beer/:id');

  if(Object.keys(req.body).length === 0) {
    Beer.findById(req.params.id)
    .then(beer => {
      res.status(400);
      res.json(beer);
    })
    .catch(next);
    return;
  }

  Beer.findByIdAndUpdate(req.params.id, req.body, {new: true} )
  .then(beer => res.json(beer))
  .catch(next);
});

beerRouter.delete('/api/brewery/:breweryID/beer/:id', function (req, res , next){
  debug('DELETE: /api/brewery/:breweryID/beer/:id');

  Beer.findByIdAndRemove(req.params.id)
  .then(() => res.status(204).send())
  .catch(next);
});
