/**
 * User schema
 * @author Yousuf Kalim
 */
const mongoose = require('mongoose');

// Schema
const userSchema = new mongoose.Schema(
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
      unique: true,
    },
    role: {
      type: String,
      enum: ['user'],
      default: 'user',
    },
    current_status: {
      type: String,
      enum: ['clocked_in', 'clocked_out'],
      default: 'clocked_out',
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admins',
      required: true,
    },
    otp: String,
    profile_pic: String,
  },
  {
    timestamps: true,
  },
);

// Model
module.exports = mongoose.model('users', userSchema);
