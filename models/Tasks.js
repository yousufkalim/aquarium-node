// Init
const mongoose = require('mongoose');

// Admin Schema
const taskSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['service', 'loadup', 'unload'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'driving', 'started', 'completed'],
      default: 'pending',
    },
    date: {
      type: Date,
      required: true,
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
      },
    ],
    schedule: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'schedules',
      },
    ],
    checklists: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'checklists',
        },
        status: Boolean,
        reason: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Model
module.exports = mongoose.model('tasks', taskSchema);
