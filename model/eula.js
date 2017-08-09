const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eulaSchema = Schema({
  name: { type: String, required: true }
  content: { type: String, required: true },
  UserID: { type: Schema.Types.ObjectId, required: true },
  CabinetID: { type: Schema.Types.ObjectId, required: true },
  pdf_URI: { type: String, required: true, unique: true },
  objectKey: { type: String, required: true, unique: true },
  created: { type: Date, default: Date.now }
})

module.exports = mongoose.model('eula', eulaSchema);