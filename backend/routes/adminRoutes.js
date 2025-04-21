const express = require('express');
const router = express.Router();
const { 
  getHostelRequests, 
  approveHostel, 
  rejectHostel, 
  getAllHostels,
  getAdminStats 
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Apply protection middleware to all routes
router.use(protect);
router.use(adminOnly);

// Admin Dashboard
router.get('/stats', getAdminStats);

// Hostel management
router.get('/hostel-requests', getHostelRequests);
router.put('/hostel-requests/:hostelId/approve', approveHostel);
router.delete('/hostel-requests/:hostelId/reject', rejectHostel);
router.get('/hostels', getAllHostels);

module.exports = router;