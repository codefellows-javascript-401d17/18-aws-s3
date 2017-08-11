'use strict';

const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');

const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('cfgram:song-router');

const Song = require('../model/song.js');
const Band = require('../model/band.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });

const songRouter = module.exports = Router();

function s3uploadProm(params) {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      resolve(s3data);
    });
  });
}

songRouter.post('/api/band/:bandID/song', bearerAuth, upload.single('audio'), function(req, res, next) {
  debug('POST: /api/band/:bandID/song');

  if (!req.file) {
    return next(createError(400, 'file not found'));
  }

  if (!req.file.path) {
    return next(createError(500, 'file not saved'));
  }

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };

  Band.findById(req.params.bandID)
  .then( () => s3uploadProm(params))
  .then(s3data => {
    del([`${dataDir}/*`]);
    let songData = {
      name: req.body.name,
      year: req.body.year,
      objectKey: s3data.Key,
      audioURI: s3data.Location,
      userID: req.user._id,
      bandID: req.params.bandID
    };
    return new Song(songData).save();
  })
  .then(song => res.json(song))
  .catch(err => next(err));
});
