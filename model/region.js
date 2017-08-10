'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const regionSchema = Schema({
  name: { type: String, required: true },
  capital: { type: String, required: true },
  rulingHouse: { type: String, required: true },
  userID: { type: Schema.Types.ObjectId, required: true }
});

module.exports = mongoose.model('region', regionSchema);
