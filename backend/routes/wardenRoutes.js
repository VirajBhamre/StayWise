const express = require('express');
const router = express.Router();
const { 
  getHostelInfo,
  addHosteller,
  getHostellerDetails,
  resetHostellerPassword,
  updateHosteller,
  removeHosteller,
  exchangeRooms,
  getAllHostellers,
  getComplaints,
  respondToComplaint,
  getMaintenanceRequests,
  respondToMaintenance,
  createEvent,
  getEvents,
  getRentPaymentStatus,
  getWardenStats,
  checkRoomArchitecture,
  defineRoomArchitecture
} = require('../controllers/wardenController');
const { protect, wardenOnly } = require('../middleware/authMiddleware');

// Apply protection middleware to all routes
router.use(protect);
router.use(wardenOnly);

// Warden Dashboard
router.get('/stats', getWardenStats);
router.get('/hostel', getHostelInfo);

// Room Architecture routes
router.get('/room-architecture', checkRoomArchitecture);
router.post('/room-architecture', defineRoomArchitecture);

// Hosteller management
router.post('/hostellers', addHosteller);
router.get('/hostellers/:hostellerId', getHostellerDetails);
router.post('/hostellers/:hostellerId/reset-password', resetHostellerPassword);
router.put('/hostellers/:hostellerId', updateHosteller);
router.delete('/hostellers/:hostellerId', removeHosteller);
router.post('/exchange-rooms', exchangeRooms);
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

// Rent status
router.get('/rent-status', getRentPaymentStatus);

module.exports = router;