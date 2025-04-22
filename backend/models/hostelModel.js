const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    default: 1,
    required: true
  },
  occupants: {
    type: Number,
    default: 0
  },
  occupied: {
    type: Boolean,
    default: false
  }
});

const floorSchema = new mongoose.Schema({
  floorName: {
    type: String,
    required: true
  },
  rooms: [roomSchema]
});

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
  isRoomArchitectureDefined: {
    type: Boolean,
    default: false
  },
  floors: [floorSchema],
  registrationDate: {
    type: Date,
    default: Date.now
  }
});

const Hostel = mongoose.model('Hostel', hostelSchema);
module.exports = Hostel;