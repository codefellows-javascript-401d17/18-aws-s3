'use strict';   

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = Schema({
  name: { type: String, required: true },
  year: { type: String, required: true },
  userID: { type: Schema.Types.ObjectId, required: true },
  bandID: { type: Schema.Types.ObjectId, required: true },
  audioURI: { type: String, required: true, unique: true },
  objectKey: { type: String, required: true, unique: true },
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('song', songSchema);
