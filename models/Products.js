// Init
const mongoose = require('mongoose');

// Admin Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
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
module.exports = mongoose.model('products', productSchema);
