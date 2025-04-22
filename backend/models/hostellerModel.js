const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hostellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  parentPhone: {
    type: String,
    required: true
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  room: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 12
  },
  endDate: {
    type: Date,
    required: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  rentPaid: {
    type: Boolean,
    default: false
  },
  lastRentPayment: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
hostellerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Match entered password with hashed password
hostellerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Hosteller = mongoose.model('Hosteller', hostellerSchema);
module.exports = Hosteller;