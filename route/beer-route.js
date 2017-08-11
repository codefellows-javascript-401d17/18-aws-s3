'use strict';

const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('brewery:beer-route');

const Beer = require('../model/beer.js');
const Brewery = require('../model/brewery.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const datadir = `${__dirname}/../data`;
const upload = multer({ dest: datadir });

const beerRouter = module.exports = Router();

function s3uploadProm(params) {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      resolve(s3data);
    });
  });
}

beerRouter.post('/api/brewery/:breweryID/beer', bearerAuth, upload.single('image'), function(req, res, next){
  debug('POST: /api/brewery/:breweryID/beer');

  if(!req.file){
    return next(createError(400, 'file not found'));
  }

  if(!req.file.path){
    return next(createError(400, 'file not saved'));
  }

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path),
  };

  Brewery.findById(req.params.breweryID)
  .then( () => s3uploadProm(params))
  .then( s3data => {
    console.log('s3data', s3data);
    del([`${datadir}/*`]);
    let beerData = {
      name: req.body.name,
      style: req.body.style,
      ibu: req.body.ibu,
      objectKey: s3data.key,
      imageURI: s3data.Location,
      userID: req.user._id,
      breweryID: req.params.breweryID,
    };
    return new Beer(beerData).save();
  })
  .then( beer =>res.json(beer))
  .catch( err => next(err));
});

beerRouter.delete('/api/brewery/:breweryID/beer/:beerID', bearerAuth, function(req, res, next){
  debug('DELETE: /api/brewery/:id');


  Beer.findById(req.params.beerID)
  .then( beer => {
    let params = {
      Bucket: process.env.AWS_BUCKET,
      Key: beer.objectKey
    };
    s3.deleteObject(params, function(err, data) {
      if(err)console.log(err);
      else console.log(data);
      Beer.findByIdAndRemove(req.params.id)
      .then( () => res.status(204).send())
      .catch(next);
    });
  })
  .catch(next);
});
