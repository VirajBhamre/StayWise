const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const Warden = require('../models/wardenModel');
const Hosteller = require('../models/hostellerModel');

// Protect routes - verify token for all users
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check user type from token and set user
      if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
        req.userRole = 'admin';
      } else if (decoded.role === 'warden') {
        req.user = await Warden.findById(decoded.id).select('-password');
        req.userRole = 'warden';
      } else if (decoded.role === 'hosteller') {
        req.user = await Hosteller.findById(decoded.id).select('-password');
        req.userRole = 'hosteller';
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.userRole === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// Warden only middleware
const wardenOnly = (req, res, next) => {
  if (req.userRole === 'warden') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Warden only.' });
  }
};

// Hosteller only middleware
const hostellerOnly = (req, res, next) => {
  if (req.userRole === 'hosteller') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Hosteller only.' });
  }
};

// Warden and admin only middleware
const wardenAndAdminOnly = (req, res, next) => {
  if (req.userRole === 'warden' || req.userRole === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Warden or Admin only.' });
  }
};

module.exports = { 
  protect, 
  adminOnly,
  wardenOnly,
  hostellerOnly,
  wardenAndAdminOnly 
};