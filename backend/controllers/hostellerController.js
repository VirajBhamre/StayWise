const Hosteller = require('../models/hostellerModel');
const Complaint = require('../models/complaintModel');
const Maintenance = require('../models/maintenanceModel');
const Event = require('../models/eventModel');
const Payment = require('../models/paymentModel');
const { v4: uuidv4 } = require('uuid');

// Get hosteller profile
const getProfile = async (req, res) => {
  try {
    const hosteller = await Hosteller.findById(req.user._id)
      .select('-password')
      .populate('hostel', 'name hostelId rentPerMonth');
    
    if (!hosteller) {
      return res.status(404).json({ message: 'Hosteller not found' });
    }
    
    res.json(hosteller);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update hosteller profile
const updateProfile = async (req, res) => {
  try {
    const { phone } = req.body;
    
    const hosteller = await Hosteller.findById(req.user._id);
    
    if (!hosteller) {
      return res.status(404).json({ message: 'Hosteller not found' });
    }
    
    hosteller.phone = phone || hosteller.phone;
    
    const updatedHosteller = await hosteller.save();
    
    res.json({
      _id: updatedHosteller._id,
      name: updatedHosteller.name,
      email: updatedHosteller.email,
      phone: updatedHosteller.phone
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create complaint
const createComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const complaint = await Complaint.create({
      title,
      description,
      hosteller: req.user._id,
      hostel: req.user.hostel
    });
    
    res.status(201).json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get hosteller's complaints
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ hosteller: req.user._id });
    
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create maintenance request
const createMaintenanceRequest = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Get hosteller's room
    const hosteller = await Hosteller.findById(req.user._id);
    
    const request = await Maintenance.create({
      title,
      description,
      room: hosteller.room,
      hosteller: req.user._id,
      hostel: req.user.hostel
    });
    
    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get hosteller's maintenance requests
const getMaintenanceRequests = async (req, res) => {
  try {
    const requests = await Maintenance.find({ hosteller: req.user._id });
    
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Pay rent
const payRent = async (req, res) => {
  try {
    const { paymentMethod, amount } = req.body;
    
    // Get hosteller details
    const hosteller = await Hosteller.findById(req.user._id)
      .populate('hostel', 'rentPerMonth');
    
    if (!hosteller) {
      return res.status(404).json({ message: 'Hosteller not found' });
    }
    
    // Validate payment amount
    if (amount < hosteller.hostel.rentPerMonth) {
      return res.status(400).json({ 
        message: `Payment amount must be at least ${hosteller.hostel.rentPerMonth}` 
      });
    }
    
    // Get current date for month tracking
    const currentDate = new Date();
    
    // Create payment record
    const payment = await Payment.create({
      hosteller: req.user._id,
      hostel: req.user.hostel,
      amount,
      paymentMethod,
      transactionId: `PAY-${uuidv4().substring(0, 8).toUpperCase()}`,
      forMonth: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      status: 'completed'
    });
    
    // Update hosteller rent status
    hosteller.rentPaid = true;
    hosteller.lastRentPayment = Date.now();
    await hosteller.save();
    
    res.status(201).json({
      message: 'Rent payment successful',
      payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get hosteller's rent payment history
const getRentPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ hosteller: req.user._id })
      .sort({ paymentDate: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get hostel events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ 
      hostel: req.user.hostel,
      date: { $gte: new Date() }
    }).sort({ date: 1 });
    
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Register for an event
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if event belongs to hosteller's hostel
    if (event.hostel.toString() !== req.user.hostel.toString()) {
      return res.status(403).json({ message: 'Not authorized to register for this event' });
    }
    
    // Check if hosteller is already registered
    if (event.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    
    // Add hosteller to participants
    event.participants.push(req.user._id);
    await event.save();
    
    res.json({ message: 'Registered for event successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  createComplaint,
  getComplaints,
  createMaintenanceRequest,
  getMaintenanceRequests,
  payRent,
  getRentPaymentHistory,
  getEvents,
  registerForEvent
};