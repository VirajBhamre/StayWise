const Hostel = require('../models/hostelModel');
const Warden = require('../models/wardenModel');
const Hosteller = require('../models/hostellerModel');
const Complaint = require('../models/complaintModel');
const Maintenance = require('../models/maintenanceModel');
const Event = require('../models/eventModel');
const Payment = require('../models/paymentModel');

// Get hostel info for warden
const getHostelInfo = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.user.hostel);
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    res.json(hostel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add hosteller
const addHosteller = async (req, res) => {
  try {
    const { name, email, password, phone, room } = req.body;
    
    // Check if email already exists
    const existingHosteller = await Hosteller.findOne({ email });
    if (existingHosteller) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Check if room is already occupied
    const roomOccupied = await Hosteller.findOne({ 
      hostel: req.user.hostel, 
      room 
    });
    
    if (roomOccupied) {
      return res.status(400).json({ message: 'Room is already occupied' });
    }
    
    // Get hostel
    const hostel = await Hostel.findById(req.user.hostel);
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    // Check if hostel is full
    if (hostel.occupiedRooms >= hostel.totalRooms) {
      return res.status(400).json({ message: 'Hostel is at full capacity' });
    }
    
    // Create hosteller
    const hosteller = await Hosteller.create({
      name,
      email,
      password,
      phone,
      room,
      hostel: req.user.hostel
    });
    
    // Update hostel occupied rooms count
    hostel.occupiedRooms += 1;
    await hostel.save();
    
    res.status(201).json({
      _id: hosteller._id,
      name: hosteller.name,
      email: hosteller.email,
      room: hosteller.room
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update hosteller
const updateHosteller = async (req, res) => {
  try {
    const { name, phone, room } = req.body;
    const { hostellerId } = req.params;
    
    // Find hosteller
    const hosteller = await Hosteller.findById(hostellerId);
    
    if (!hosteller) {
      return res.status(404).json({ message: 'Hosteller not found' });
    }
    
    // Check if hosteller belongs to warden's hostel
    if (hosteller.hostel.toString() !== req.user.hostel.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this hosteller' });
    }
    
    // If room is changing, check availability
    if (room && room !== hosteller.room) {
      const roomOccupied = await Hosteller.findOne({ 
        hostel: req.user.hostel, 
        room,
        _id: { $ne: hostellerId }
      });
      
      if (roomOccupied) {
        return res.status(400).json({ message: 'Room is already occupied' });
      }
    }
    
    // Update hosteller
    hosteller.name = name || hosteller.name;
    hosteller.phone = phone || hosteller.phone;
    hosteller.room = room || hosteller.room;
    
    const updatedHosteller = await hosteller.save();
    
    res.json({
      _id: updatedHosteller._id,
      name: updatedHosteller.name,
      email: updatedHosteller.email,
      phone: updatedHosteller.phone,
      room: updatedHosteller.room
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Remove hosteller
const removeHosteller = async (req, res) => {
  try {
    const { hostellerId } = req.params;
    
    // Find hosteller
    const hosteller = await Hosteller.findById(hostellerId);
    
    if (!hosteller) {
      return res.status(404).json({ message: 'Hosteller not found' });
    }
    
    // Check if hosteller belongs to warden's hostel
    if (hosteller.hostel.toString() !== req.user.hostel.toString()) {
      return res.status(403).json({ message: 'Not authorized to remove this hosteller' });
    }
    
    // Get hostel to update occupied rooms count
    const hostel = await Hostel.findById(req.user.hostel);
    
    // Delete hosteller
    await Hosteller.findByIdAndDelete(hostellerId);
    
    // Update hostel occupied rooms count
    if (hostel && hostel.occupiedRooms > 0) {
      hostel.occupiedRooms -= 1;
      await hostel.save();
    }
    
    res.json({ message: 'Hosteller removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all hostellers for warden's hostel
const getAllHostellers = async (req, res) => {
  try {
    const hostellers = await Hosteller.find({ hostel: req.user.hostel })
      .select('-password');
    
    res.json(hostellers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get complaints for warden's hostel
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ hostel: req.user.hostel })
      .populate('hosteller', 'name email room');
    
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Respond to complaint
const respondToComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, wardenResponse } = req.body;
    
    const complaint = await Complaint.findById(complaintId);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Check if complaint belongs to warden's hostel
    if (complaint.hostel.toString() !== req.user.hostel.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this complaint' });
    }
    
    // Update complaint
    complaint.status = status || complaint.status;
    complaint.wardenResponse = wardenResponse;
    
    if (status === 'resolved') {
      complaint.resolvedAt = Date.now();
    }
    
    const updatedComplaint = await complaint.save();
    
    res.json(updatedComplaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get maintenance requests for warden's hostel
const getMaintenanceRequests = async (req, res) => {
  try {
    const requests = await Maintenance.find({ hostel: req.user.hostel })
      .populate('hosteller', 'name email room');
    
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Respond to maintenance request
const respondToMaintenance = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, scheduledDate, wardenResponse } = req.body;
    
    const request = await Maintenance.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }
    
    // Check if request belongs to warden's hostel
    if (request.hostel.toString() !== req.user.hostel.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }
    
    // Update request
    request.status = status || request.status;
    request.wardenResponse = wardenResponse;
    
    if (scheduledDate) {
      request.scheduledDate = scheduledDate;
    }
    
    if (status === 'completed') {
      request.completedAt = Date.now();
    }
    
    const updatedRequest = await request.save();
    
    res.json(updatedRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create event
const createEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    
    const event = await Event.create({
      title,
      description,
      date,
      hostel: req.user.hostel,
      createdBy: req.user._id
    });
    
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get events for warden's hostel
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ hostel: req.user.hostel })
      .populate('participants', 'name room');
    
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get rent payment status for all hostellers
const getRentPaymentStatus = async (req, res) => {
  try {
    const hostellers = await Hosteller.find({ hostel: req.user.hostel })
      .select('name email room rentPaid lastRentPayment');
    
    res.json(hostellers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get warden dashboard stats
const getWardenStats = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.user.hostel);
    const totalHostellers = await Hosteller.countDocuments({ hostel: req.user.hostel });
    const pendingComplaints = await Complaint.countDocuments({ 
      hostel: req.user.hostel, 
      status: 'pending' 
    });
    const pendingMaintenance = await Maintenance.countDocuments({ 
      hostel: req.user.hostel, 
      status: 'pending' 
    });
    
    // Count hostellers with unpaid rent
    const unpaidRent = await Hosteller.countDocuments({ 
      hostel: req.user.hostel, 
      rentPaid: false 
    });
    
    res.json({
      totalRooms: hostel.totalRooms,
      occupiedRooms: hostel.occupiedRooms,
      availableRooms: hostel.totalRooms - hostel.occupiedRooms,
      totalHostellers,
      pendingComplaints,
      pendingMaintenance,
      unpaidRent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getHostelInfo,
  addHosteller,
  updateHosteller,
  removeHosteller,
  getAllHostellers,
  getComplaints,
  respondToComplaint,
  getMaintenanceRequests,
  respondToMaintenance,
  createEvent,
  getEvents,
  getRentPaymentStatus,
  getWardenStats
};