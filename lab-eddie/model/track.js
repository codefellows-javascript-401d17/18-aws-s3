'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trackSchema = new Schema({
  title: {type: String, required: true},
  albumID: {type: Schema.Types.ObjectId, required: true},
  userID: {type: Schema.Types.ObjectId, required: true},
  datePublished: {type: Date, default: Date.now},
  awsKey: {type: String, required: true},
  awsURI: {type: String, required: true}
})

module.exports = mongoose.model('track', trackSchema);