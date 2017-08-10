'use strict';

const Router = require('express').Router;
const debug = require('debug')('app:track-route');
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');

const Album = require('../model/album.js');
const Track = require('../model/track.js');
const bearerAuth = require('../lib/bearer-auth.js');
const trackRouter = module.exports = new Router();

AWS.config.setPromisesDependency(require('bluebird'));
const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });

function s3Prom(params) {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      resolve(s3data);
    });
  });
}

trackRouter.post('/api/album/:albimID/track', bearerAuth, pload.single('track'), function(req, res, next) {
  debug('POST: /api/album/albumID/track');

  if (!req.file) return next(createError(400, 'no file found'));
  if (!req.file.path) return next(createError(500, 'no file saved'));

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };
  
});



