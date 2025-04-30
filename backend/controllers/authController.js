const Admin = require('../models/adminModel');
const Warden = require('../models/wardenModel');
const Hosteller = require('../models/hostellerModel');
const Hostel = require('../models/hostelModel');
const jwt = require('jsonwebtoken');
const { generateHotelId } = require('../utils/generators');

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

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
      // Count the number of admins in the system
      const adminCount = await Admin.countDocuments();
      
      // If there's only one admin and password is incorrect (forgotten)
      if (adminCount === 1) {
        // Generate a new admin with random credentials
        const newAdminEmail = `admin.recovery${Date.now()}@staywise.com`;
        const newAdminPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4) + "!1";
        
        // Create the new admin account
        const recoveryAdmin = await Admin.create({
          name: "Recovery Admin",
          email: newAdminEmail,
          password: newAdminPassword // This will be hashed by the pre-save hook in the model
        });
        
        // Log the credentials to the console in a noticeable way
        console.log('\n');
        console.log('='.repeat(50));
        console.log('\x1b[41m%s\x1b[0m', '  EMERGENCY ADMIN ACCOUNT CREATED  ');
        console.log('='.repeat(50));
        console.log('\x1b[33m%s\x1b[0m', 'Since you forgot your admin password and there is only one admin,');
        console.log('\x1b[33m%s\x1b[0m', 'a new admin account has been created with the following credentials:');
        console.log('\n');
        console.log('\x1b[36m%s\x1b[0m', 'Email:    ', newAdminEmail);
        console.log('\x1b[36m%s\x1b[0m', 'Password: ', newAdminPassword);
        console.log('\n');
        console.log('\x1b[31m%s\x1b[0m', 'IMPORTANT: Please login with these credentials immediately');
        console.log('\x1b[31m%s\x1b[0m', 'and create a new admin account that you will remember.');
        console.log('='.repeat(50));
        console.log('\n');
        
        // Still return invalid credentials to avoid revealing too much information
        return res.status(401).json({ message: 'Invalid email or password. Check server console for emergency access.' });
      }
      
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

// Create new admin (admin registration)
const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
    });

    // Return new admin with token
    res.status(201).json({
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

// Login warden
const loginWarden = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for warden email
    const warden = await Warden.findOne({ email }).populate('hostel');

    if (!warden) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if approved
    if (!warden.isApproved) {
      return res.status(403).json({ message: 'Your account is pending approval' });
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
    
    // Generate hostel ID
    const hostelId = generateHotelId();

    // Create a new hostel (pending approval)
    const hostel = await Hostel.create({
      name: hostelName,
      hostelId,
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
const loginHosteller = async (req, res) => {
  try {
    const { username, password, hostelId } = req.body;

    // Check for hosteller username
    const hosteller = await Hosteller.findOne({ username }).populate('hostel', 'name hostelId');

    if (!hosteller) {
      return res.status(401).json({ message: 'Invalid username or password' });
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
      return res.status(401).json({ message: 'Invalid username or password' });
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

module.exports = { 
  loginAdmin,
  createAdmin, 
  loginWarden, 
  registerWardenRequest, 
  loginHosteller
};