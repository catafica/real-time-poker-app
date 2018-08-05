const mongoose = require('mongoose');
const validator = require('validator');

var User = mongoose.model('User',{
  username: {
    type: String,
    required: true,
    minlength: 4,
    unique: true
  },
  email: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      unique: true,
      validate: {
        validator: validator.isEmail
      }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  points: {
    type: Number,
    default: 1000
  }
});

module.exports = {User};
