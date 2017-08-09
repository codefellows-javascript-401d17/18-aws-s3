const Router = require('express').Router;
const debug = require('debug')('eula:cabinet-router.js');
const jsonParser = require('body-parser').json();
const bearerAuthorization = require('../lib/bearer-auth-middleware');
const Cabinet = require('../model/cabinet');
const createError = require('http-errors');

const cabinetRouter = module.exports = new Router();

cabinetRouter.post('/api/cabinet', bearerAuthorization, jsonParser, function (req, rsp, next) {
  debug('POST /api/cabinet');
  req.body.userID = req.user._id; //see bearerAuthr middleware, attaches it 
  Cabinet.create(req.body)
    .then((cabinet) => {
      rsp.json(cabinet);
    })
    .catch((err) => {
      next(err);
    })
})

cabinetRouter.get('/api/cabinet/:id', bearerAuthorization, function (req, rsp, next) {
  debug('GET /api/cabinet/:id')

  Cabinet.findById(req.params.id)
    .then((cabinet) => {
      rsp.json(cabinet);
    })
    .catch((err) => {
      next(err);
    })
})

cabinetRouter.put('/api/cabinet/:id', bearerAuthorization, jsonParser, function (req, rsp, next) {
  debug('PUT /api/cabinet/:id');
  if (Object.keys(req.body).length === 0) return next(createError(400));
  Cabinet.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((cabinet) => {
      rsp.json(cabinet);
    })
    .catch((err) => {
      next(err);
    })
})

cabinetRouter.delete('/api/cabinet/:id', bearerAuthorization, jsonParser, function (req, rsp, next) {
  debug('DELETE /api/cabinet/:id');
  if(!req.params.id) return next(createError(400));
  
  Cabinet.findByIdAndRemove(req.params.id)
    .then(() => {
      rsp.sendStatus(201);
    })
    .catch((err) => {
      next(err);
    })
})