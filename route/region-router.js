'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('atlas:region-router');

const Region = require('../model/region.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const regionRouter = module.exports = Router();

regionRouter.post('/api/region', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/region');

  req.body.userID = req.uer._id;
  new Region(req.body).save()
  .then(region => res.json(region))
  .catch(next);
});

regionRouter.get('/api/region/:id', bearerAuth, function(req, res, next) {
  debug('GET: /api/region/:id');

  Region.findById(req.params.id)
  .then(region => {
    res.json(region);
  })
  .catch(next);
});
