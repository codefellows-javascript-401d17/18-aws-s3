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
// AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: "YOURSECRET"
// });
const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });


function s3Prom(params) {
  return new Promise((resolve, reject) => {
    console.log('processing')
    s3.upload(params, (err, s3data) => {
      if(err) console.log(err);
      resolve(s3data);
    });
  });
}

trackRouter.post('/api/album/:albumID/track', bearerAuth, upload.single('track'), function(req, res, next) {
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
  
  Album.findById(req.params.albumID)
  .then(() => s3Prom(params))
  .then(s3data => {
    console.log('Why wont this work!!!!!!!')
    console.log(req.user)
    del([`${dataDir}/*`]);
    var trackBody = {
      title: req.body.title,
      awsKey: s3data.Key,
      awsURI: s3data.Location,
      userID: req.user._id,
      albumID: req.params.albumID,
    }
    return trackBody;
  })
  .then(body => {
    return new Track(body)
  })
  .then(track => {
    res.json(track);
    next();
  })
  .catch(err => next(createError(400, err.message)));
});



