// Init
const { Schema, model } = require('mongoose');

// Admin Schema
const adminSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      default: 'admin',
      enum: ['admin', 'super_admin'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    phone_number: String,
    profile_pic: {
      type: String,
      default: 'uploads/logo.png',
    },
  },
  {
    timestamps: true,
  },
);

// Model
module.exports = model('admins', adminSchema);
