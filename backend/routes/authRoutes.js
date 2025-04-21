const express = require('express');
const router = express.Router();
const { 
  loginAdmin, 
  createAdmin, 
  loginWarden,
  registerWardenRequest,
  loginHosteller
} = require('../controllers/authController');

// Admin routes
router.post('/admin/login', loginAdmin);
router.post('/admin/register', createAdmin);

// Warden routes
router.post('/warden/login', loginWarden);
router.post('/warden/register', registerWardenRequest);

// Hosteller routes
router.post('/hosteller/login', loginHosteller);

module.exports = router;