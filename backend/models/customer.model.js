const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // Lab 04 Task 1: Wishlist relationship referencing Product model
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    versionKey: false,
  }
);

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
module.exports.Customer = Customer;
module.exports.User = Customer;
