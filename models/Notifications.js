// Init
const mongoose = require('mongoose');

// Admin Schema
const notificationSchema = new mongoose.Schema(
  {
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    text: String,
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'tasks',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Model
module.exports = mongoose.model('notifications', notificationSchema);
