const Admin = require('../models/adminModel');
const Warden = require('../models/wardenModel');
const Hosteller = require('../models/hostellerModel');
const Hostel = require('../models/hostelModel');
const jwt = require('jsonwebtoken');

// Generate JWT with role
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Login admin (simplified without OTP)
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Always verify against fixed admin email
    const adminEmail = 'virajbhamre55@gmail.com';
    
    // Check if email is the admin email
    if (email !== adminEmail) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check for admin record
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return admin and token (no OTP verification)
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id, 'admin'),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create admin (only use once to create the initial admin)
const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Count admins - ensure only one admin exists
    const adminCount = await Admin.countDocuments();
    
    if (adminCount > 0) {
      return res.status(400).json({ message: 'Only one admin can exist in the system' });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
    });

    if (admin) {
      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id, 'admin'),
      });
    } else {
      res.status(400).json({ message: 'Invalid admin data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Login warden
const loginWarden = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for warden email
    const warden = await Warden.findOne({ email }).populate('hostel', 'name hostelId');

    if (!warden) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if warden is approved
    if (!warden.isApproved) {
      return res.status(403).json({ message: 'Your account is pending approval by admin' });
    }

    // Check if password matches
    const isMatch = await warden.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return warden and token
    res.json({
      _id: warden._id,
      name: warden.name,
      email: warden.email,
      hostel: warden.hostel,
      token: generateToken(warden._id, 'warden'),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Register warden request
const registerWardenRequest = async (req, res) => {
  try {
    const { name, email, password, phone, hostelName, address, totalRooms, rentPerMonth } = req.body;

    // Check if warden already exists
    const wardenExists = await Warden.findOne({ email });

    if (wardenExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create a new hostel (pending approval)
    const hostel = await Hostel.create({
      name: hostelName,
      address,
      totalRooms,
      rentPerMonth,
      isApproved: false
    });

    // Create warden (pending approval)
    const warden = await Warden.create({
      name,
      email,
      password,
      phone,
      hostel: hostel._id,
      isApproved: false
    });

    // Update hostel with warden reference
    await Hostel.findByIdAndUpdate(hostel._id, { warden: warden._id });

    res.status(201).json({
      message: 'Registration request submitted successfully. Awaiting admin approval.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Login hosteller
// Login hosteller
const loginHosteller = async (req, res) => {
  try {
    const { email, password, hostelId } = req.body;

    // Check for hosteller email
    const hosteller = await Hosteller.findOne({ email }).populate('hostel', 'name hostelId');

    if (!hosteller) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if hostelId matches
    if (hostelId && hosteller.hostel.hostelId !== hostelId) {
      return res.status(401).json({ message: 'Invalid hostel ID' });
    }
    
    // Check if hosteller's stay has expired
    if (hosteller.endDate && new Date() > new Date(hosteller.endDate)) {
      return res.status(403).json({ 
        message: 'Your stay duration has expired. Please contact your warden.',
        expired: true
      });
    }

    // Check if password matches
    const isMatch = await hosteller.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return hosteller and token
    res.json({
      _id: hosteller._id,
      name: hosteller.name,
      email: hosteller.email,
      room: hosteller.room,
      hostel: hosteller.hostel,
      rentPaid: hosteller.rentPaid,
      endDate: hosteller.endDate,
      token: generateToken(hosteller._id, 'hosteller'),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add these functions for admin routes

// Get admin dashboard stats
const getAdminStats = async (req, res) => {
  try {
    const totalHostels = await Hostel.countDocuments();
    const approvedHostels = await Hostel.countDocuments({ isApproved: true });
    const pendingRequests = await Hostel.countDocuments({ isApproved: false });
    const totalHostellers = await Hosteller.countDocuments();
    
    // Calculate total and available rooms across all hostels
    const hostelsData = await Hostel.find({ isApproved: true });
    let totalRooms = 0;
    let occupiedRooms = 0;
    
    hostelsData.forEach(hostel => {
      totalRooms += hostel.totalRooms;
      occupiedRooms += hostel.occupiedRooms || 0;
    });
    
    const availableRooms = totalRooms - occupiedRooms;
    
    res.json({
      totalHostels,
      approvedHostels,
      pendingRequests,
      totalHostellers,
      totalRooms,
      availableRooms,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all hostel registration requests
const getHostelRequests = async (req, res) => {
  try {
    const requests = await Hostel.find({ isApproved: false })
      .populate('warden', 'name email phone');
    
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Approve hostel registration
const approveHostel = async (req, res) => {
  try {
    const { hostelId } = req.params;
    
    // Find the hostel to be approved
    const hostel = await Hostel.findById(hostelId).populate('warden');
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    // Find the associated warden
    const warden = await Warden.findById(hostel.warden);
    
    if (!warden) {
      return res.status(404).json({ message: 'Warden not found' });
    }
    
    // Generate a unique hostel ID (e.g., HMS-001, HMS-002, etc.)
    const hostelCount = await Hostel.countDocuments({ isApproved: true });
    const hostelIdNumber = (hostelCount + 1).toString().padStart(3, '0');
    const uniqueHostelId = `HMS-${hostelIdNumber}`;
    
    // Update hostel and warden records
    hostel.isApproved = true;
    hostel.hostelId = uniqueHostelId;
    warden.isApproved = true;
    
    await hostel.save();
    await warden.save();
    
    res.json({ 
      message: 'Hostel approved successfully',
      hostel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Reject hostel registration
const rejectHostel = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const { reason } = req.body;
    
    // Find the hostel to be rejected
    const hostel = await Hostel.findById(hostelId).populate('warden');
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    // Remove warden and hostel records
    if (hostel.warden) {
      await Warden.findByIdAndDelete(hostel.warden._id);
    }
    
    await Hostel.findByIdAndDelete(hostelId);
    
    res.json({ message: 'Hostel request rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all approved hostels
const getAllHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find({ isApproved: true })
      .populate('warden', 'name email phone');
    
    res.json(hostels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { 
  loginAdmin,
  createAdmin, 
  loginWarden, 
  registerWardenRequest, 
  loginHosteller,
  getAdminStats,
  getHostelRequests,
  approveHostel,
  rejectHostel,
  getAllHostels
};