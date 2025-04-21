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

// Admin Authentication //

// Login admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for admin email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return admin and token
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

// Warden Authentication //

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

// Hosteller Authentication //

// Login hosteller
const loginHosteller = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for hosteller email
    const hosteller = await Hosteller.findOne({ email }).populate('hostel', 'name hostelId');

    if (!hosteller) {
      return res.status(401).json({ message: 'Invalid email or password' });
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
      token: generateToken(hosteller._id, 'hosteller'),
    });
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
  loginHosteller 
};