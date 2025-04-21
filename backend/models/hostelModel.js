const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  hostelId: {
    type: String,
    unique: true,
    default: () => `HST-${uuidv4().substring(0, 8).toUpperCase()}`
  },
  address: {
    type: String,
    required: true
  },
  totalRooms: {
    type: Number,
    required: true
  },
  occupiedRooms: {
    type: Number,
    default: 0
  },
  rentPerMonth: {
    type: Number,
    required: true
  },
  warden: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warden'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
});

const Hostel = mongoose.model('Hostel', hostelSchema);
module.exports = Hostel;