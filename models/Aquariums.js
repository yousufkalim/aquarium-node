// Init
const mongoose = require('mongoose');

// Admin Schema
const aquariumSchema = new mongoose.Schema(
  {
    service_details: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      country: String,
      zip_code: String,
      lat: Number,
      lng: Number,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'clients',
      required: true,
    },
    tank_details: {
      size: String,
      type: String,
      material: String,
      filter: String,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admins',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Model
module.exports = mongoose.model('aquariums', aquariumSchema);
