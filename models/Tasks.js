// Init
const mongoose = require('mongoose');

// Admin Schema
const taskSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['service', 'loadup', 'unload', 'drive', 'lunch', 'break', 'outOfOffice', 'endOfShift'],
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
    started_at: Date,
    completed_at: Date,
    end_time: {
      type: Date,
      required: true,
    },
    aquarium: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'aquariums',
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admins',
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'products',
        },
        price: Number,
        quantity: Number,
      },
    ],
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'schedules',
      required: true,
    },
    comment: String,
    checklists: [
      {
        title: {
          type: String,
          required: true,
        },
        description: String,
        attachment: {
          url: String,
          type: {
            type: String,
            enum: ['video', 'image'],
          },
        },
        status: Boolean,
        reason: String,
      },
    ],
    rate: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

// Model
module.exports = mongoose.model('tasks', taskSchema);
