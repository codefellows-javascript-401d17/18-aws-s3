'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const cabinetSchema = Schema({
  name: { type: String, required: true },
  updated: { type: Date, required: true, default: Date.now},
  userID: { type: Schema.Types.ObjectId, required: true }
})

module.exports = mongoose.model('cabinet', cabinetSchema);