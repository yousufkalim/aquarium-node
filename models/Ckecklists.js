// Init
const mongoose = require('mongoose');

// Admin Schema
const checklistSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['service', 'loadup', 'unload'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
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
module.exports = mongoose.model('checklists', checklistSchema);
