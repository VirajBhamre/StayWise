const Hostel = require('../models/hostelModel');

// Middleware to check if hostel architecture is defined
const architectureRequired = async (req, res, next) => {
  try {
    // Skip for architecture endpoints themselves
    if (req.path === '/room-architecture') {
      return next();
    }
    
    const hostel = await Hostel.findById(req.user.hostel);
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    if (!hostel.isRoomArchitectureDefined) {
      return res.status(403).json({
        message: 'Room architecture must be defined first',
        architectureRequired: true
      });
    }
    
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { architectureRequired };