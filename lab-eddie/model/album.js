'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const debug = require('debug')('app:album');
const Track = require('./track.js');
const createError = require('http-errors');

const albumSchema = Schema({
  title: { type: String, required: true },
  datePublished: { type: Date, required: true},
  tracks: [{type: Schema.Types.ObjectId, ref: 'track'}],
  userID: { type: Schema.Types.ObjectId, required: true }
});

module.exports = mongoose.model('album', albumSchema);

albumSchema.methods.addTrack = function (albumID, track) {
  debug('addTrack')

  albumSchema.findById(id)
  .then(album => {
    track.albumID = album._id;
    this.album = album;
    return new Track(track).save();
  })
  .then(album => {
    this.album.tracks.push(album._id)
    this.album.save();
    this.album = album;
  })
  .then(() => this.album)
  .catch(err => Promise.reject(createError(400, err.message)));
}