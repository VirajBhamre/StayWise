const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  forMonth: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  }
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;