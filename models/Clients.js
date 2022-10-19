// Init
const mongoose = require('mongoose');

// Admin Schema
const clientSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    email: String,
    aquariums: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'aquariums',
      },
    ],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admins',
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Model
module.exports = mongoose.model('clients', clientSchema);
