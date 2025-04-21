const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/wardenController');
const { protect, wardenOnly } = require('../middleware/authMiddleware');

// Apply protection middleware to all routes
router.use(protect);
router.use(wardenOnly);

// Warden Dashboard
router.get('/stats', getWardenStats);
router.get('/hostel', getHostelInfo);

// Hosteller management
router.post('/hostellers', addHosteller);
router.put('/hostellers/:hostellerId', updateHosteller);
router.delete('/hostellers/:hostellerId', removeHosteller);
router.get('/hostellers', getAllHostellers);

// Complaints
router.get('/complaints', getComplaints);
router.put('/complaints/:complaintId', respondToComplaint);

// Maintenance
router.get('/maintenance', getMaintenanceRequests);
router.put('/maintenance/:requestId', respondToMaintenance);

// Events
router.post('/events', createEvent);
router.get('/events', getEvents);

// Rent
router.get('/rent-status', getRentPaymentStatus);

module.exports = router;