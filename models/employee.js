const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  Empid: {
    type: Number,
    unique: true,
    required: false //
  },
  Username: {
    type: String,
    required: true,
    unique: true
  },
  Password: {
    type: String,
    required: true
  },
  Role: {
    type: String,
    type: String,
    default: 'user' // This prevents undefined errors on login
  
  }
});

module.exports = mongoose.model('Employee', employeeSchema);
