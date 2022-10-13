// Init
const mongoose = require('mongoose');

// Admin Schema
const scheduleSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tasks',
      },
    ],
    attendance: [
      {
        clock_in: Date,
        clock_out: Date,
        out_reason: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Model
module.exports = mongoose.model('schedules', scheduleSchema);
