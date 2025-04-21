const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  hosteller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hosteller',
    required: true
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'in-progress', 'completed', 'rejected'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date
  },
  wardenResponse: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
module.exports = Maintenance;