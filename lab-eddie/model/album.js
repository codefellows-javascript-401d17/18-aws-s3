'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trackSchema = Schema({
  title: { type: String, required: true },
  datePublished: { type: Date, required: true},
  tracks: [{type: Schema.Types.ObjectId, ref: 'track'}],
  userID: { type: Schema.Types.ObjectId, required: true }
});

module.exports = mongoose.model('album', albumSchema);