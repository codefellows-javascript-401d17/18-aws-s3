'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const superheroSchema = Schema({
  name: { type: String, required: true },
  powers: { type: String, required: true },
  created: { type: Date, required: true, default: Date.now },
  userID: { type: Schema.Types.ObjectId, required: true }
});

module.exports = mongoose.model('superhero', superheroSchema);
