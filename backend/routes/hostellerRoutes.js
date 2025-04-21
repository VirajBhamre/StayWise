const express = require('express');
const router = express.Router();
const { 
  getProfile,
  updateProfile,
  createComplaint,
  getComplaints,
  createMaintenanceRequest,
  getMaintenanceRequests,
  payRent,
  getRentPaymentHistory,
  getEvents,
  registerForEvent
} = require('../controllers/hostellerController');
const { protect, hostellerOnly } = require('../middleware/authMiddleware');

// Apply protection middleware to all routes
router.use(protect);
router.use(hostellerOnly);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Complaints
router.post('/complaints', createComplaint);
router.get('/complaints', getComplaints);

// Maintenance
router.post('/maintenance', createMaintenanceRequest);
router.get('/maintenance', getMaintenanceRequests);

// Rent
router.post('/pay-rent', payRent);
router.get('/rent-history', getRentPaymentHistory);

// Events
router.get('/events', getEvents);
router.post('/events/:eventId/register', registerForEvent);

module.exports = router;