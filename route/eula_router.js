'use strict';

const Router = require('express').Router;
const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const createError = require('https-errors');
const debug = require('debug')('eula:eula_router.js');

const Eula = require('../model/eula.js');
const Cabinet = require('../model/cabinet.js');
const bearerAuthorization = require('../lib/bearer-auth-middleware.js');

const eulaRouter = module.exports = new Router();

//use bluebird implementation of promise with AWS
AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
//multer is middleware
const upload = multer({ dest: dataDir })

eulaRouter.post(`/api/cabinet/:cabinetID/eula`, bearerAuthorization, upload.single('pdf'), function (req, rsp, next) {
  debug('POST: /api/cabinet/:cabinetID/eula');

  if (!req.file) {
    return next(createError(400, 'file not found'));
  }
  if (!req.file.path) {
    return next(createError(500, 'file not saved'));
  }

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Body: fs.createReadStream(req.file.path)
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename$}${ext}`,
  }

  function s3uploadProm(params) {
    return new Promise((resolve, reject) => {
      s3.upload(params, (err, s3data) => {
        resolve(s3data);
      })
    })
  }
  //find cabinet, upload 
  Cabinet.findById(req.params.cabinetID)
    .then(() => {
      return s3uploadProm(params);
    })
    .then((s3data) => {
      console.log('s3data', s3data);
      del([`${dataDir}/*`]);
      let eulaData = {
        name: req.body.name,    //request
        content: req.body.content,  //request
        userID: req.user._id, //created by middleware
        cabinetID: req.params.cabinetID, //url param
        pdfURI: s3data.Location,  //s3
        objectKey: s3data.Key,  //s3
      }
      return Eula.create(eulaData);
    })
    .then((pic) => {
      return rsp.json(pic)
    })
    .catch((err) => {
      next(err);
    })
})