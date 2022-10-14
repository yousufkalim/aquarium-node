// Init
const mongoose = require('mongoose');

// Admin Schema
const tankSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['size', 'type', 'material', 'filter'],
      required: true,
    },
    value: {
      type: String,
      required: true,
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
module.exports = mongoose.model('tanks', tankSchema);
