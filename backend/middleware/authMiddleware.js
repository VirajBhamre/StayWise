const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const Warden = require('../models/wardenModel');
const Hosteller = require('../models/hostellerModel');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Set role in request
      req.userRole = decoded.role;

      // Get user based on role
      if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'warden') {
        req.user = await Warden.findById(decoded.id).select('-password');
      } else if (decoded.role === 'hosteller') {
        const hosteller = await Hosteller.findById(decoded.id).select('-password');
        
        // Check if hosteller's stay duration has expired
        if (hosteller && hosteller.endDate && new Date() > new Date(hosteller.endDate)) {
          return res.status(403).json({ 
            message: 'Your stay duration has expired. Please contact your warden.',
            expired: true
          });
        }
        
        req.user = hosteller;
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.userRole === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

const wardenOnly = (req, res, next) => {
  if (req.userRole === 'warden') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as warden' });
  }
};

const hostellerOnly = (req, res, next) => {
  if (req.userRole === 'hosteller') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as hosteller' });
  }
};

module.exports = { protect, adminOnly, wardenOnly, hostellerOnly };