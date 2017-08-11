'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bandSchema = Schema({
  name: { type: String, required: true },
  genre: { type: String, required: true },
  origin: { type: String, required: true },
  userID: { type: Schema.Types.ObjectId, required: true }
});

module.exports = mongoose.model('band', bandSchema);
