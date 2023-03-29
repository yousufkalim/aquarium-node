// Init
const mongoose = require('mongoose');

// Admin Schema
const qbauthSchema = new mongoose.Schema({
  refresh_token: String,
  expiry_date: Date,
});

// Model
module.exports = mongoose.model('qbauth', qbauthSchema);
