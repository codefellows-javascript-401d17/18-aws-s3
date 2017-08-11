'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const brewerySchema = Schema({
  name: {type: String, required: true},
  address: {type: String, required: true},
  phoneNumber: {type: String, required: true},
  timestamp: {type: Date, required: true},
  userID: {type: Schema.Types.ObjectId, required: true},
  beers: [{type: Schema.Types.ObjectId, ref: 'beer'}]
});

module.exports = mongoose.model('brewery', brewerySchema);
