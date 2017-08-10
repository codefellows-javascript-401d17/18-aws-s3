'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('app:album route');

const Album = require('../model/album.js');
const bearerAuth = require('../lib/bearer-auth.js');

const albumRouter = module.exports = Router();

albumRouter.post('/api/album', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/album');
  
  req.body.userID = req.user._id;
  new Album(req.body).save()
  .then( album => res.json(album))
  .catch(err => next(createError(400, err.message)));
});

albumRouter.get('/api/album/:id', bearerAuth, function(req, res, next) {
  debug('GET: /api/album/:id');
  
  Album.findById(req.params.id)
  .then( album => {
    res.json(album);
  })
  .catch(err => next(createError(404, err.message)));
});

albumRouter.put('/api/album/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/album/:id');
  
  Album.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .then( album => {
    res.json(album);
  })
  .catch(err => next(createError(404, err.message)));
});