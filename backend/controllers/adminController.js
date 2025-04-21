const Hostel = require('../models/hostelModel');
const Warden = require('../models/wardenModel');
const Hosteller = require('../models/hostellerModel');

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

// Approve hostel and warden
const approveHostel = async (req, res) => {
  try {
    const { hostelId } = req.params;
    
    const hostel = await Hostel.findById(hostelId);
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    // Update hostel status
    hostel.isApproved = true;
    await hostel.save();
    
    // Update warden status
    await Warden.findByIdAndUpdate(hostel.warden, { isApproved: true });
    
    res.json({ 
      message: 'Hostel approved successfully',
      hostel
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Reject hostel and warden
const rejectHostel = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const { reason } = req.body;
    
    const hostel = await Hostel.findById(hostelId);
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    
    // Delete warden and hostel
    await Warden.findByIdAndDelete(hostel.warden);
    await Hostel.findByIdAndDelete(hostelId);
    
    res.json({ message: 'Hostel registration rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all hostels
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

// Get stats for admin dashboard
const getAdminStats = async (req, res) => {
  try {
    const totalHostels = await Hostel.countDocuments({ isApproved: true });
    const pendingRequests = await Hostel.countDocuments({ isApproved: false });
    const totalHostellers = await Hosteller.countDocuments();
    const totalCapacity = await Hostel.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, total: { $sum: '$totalRooms' } } }
    ]);
    
    const totalRooms = totalCapacity.length > 0 ? totalCapacity[0].total : 0;
    
    res.json({
      totalHostels,
      pendingRequests,
      totalHostellers,
      totalRooms
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { 
  getHostelRequests, 
  approveHostel, 
  rejectHostel, 
  getAllHostels,
  getAdminStats 
};