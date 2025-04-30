const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/dbConfig');
const { scheduleExpiryCheck } = require('./cron/expiryCheck');
const Admin = require('./models/adminModel');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const wardenRoutes = require('./routes/wardenRoutes');
const hostellerRoutes = require('./routes/hostellerRoutes');

// Connect to MongoDB
connectDB();

// Function to check for existing admins
const checkAdminCredentials = async () => {
  try {
    console.log('\n=== Checking for existing admin accounts ===');
    const admins = await Admin.find({}).select('-__v');
    
    if (admins.length > 0) {
      console.log('\x1b[32m%s\x1b[0m', '✓ Admin account(s) found in database:');
      admins.forEach((admin, index) => {
        console.log('\x1b[36m%s\x1b[0m', `\nAdmin #${index + 1}:`);
        console.log('- Name:', admin.name);
        console.log('- Email:', admin.email);
        console.log('- ID:', admin._id);
        console.log('- Created:', admin.createdAt);
      });
      
      // Add a note with login credentials
      console.log('\n\x1b[33m%s\x1b[0m', 'LOGIN CREDENTIALS:');
      console.log('\x1b[33m%s\x1b[0m', 'Email: Use the email shown above');
      
      // Check if email matches the default admin email from adminController.js
      const defaultAdminEmail = 'virajbhamre55@gmail.com';
      const hasDefaultAdmin = admins.some(admin => admin.email === defaultAdminEmail);
      
      if (hasDefaultAdmin) {
        console.log('\x1b[33m%s\x1b[0m', 'Password: Use default password "admin123" if you have not changed it');
      } else {
        console.log('\x1b[33m%s\x1b[0m', 'Password: For security, passwords are hashed. Use the password you set during registration.');
        console.log('\x1b[33m%s\x1b[0m', 'If you forgot your password, you will need to modify the database directly or create a new admin account.');
      }
      
      // Create a new admin account with a complex password since the user forgot the password
      await createNewAdminAccount();
    } else {
      console.log('\x1b[31m%s\x1b[0m', '✗ No admin accounts found in database.');
      console.log('\x1b[33m%s\x1b[0m', 'Please register an admin account to access the admin panel.');
      console.log('\x1b[33m%s\x1b[0m', 'Alternatively, you can use these default credentials after registration:');
      console.log('\x1b[33m%s\x1b[0m', '- Email: virajbhamre55@gmail.com');
      console.log('\x1b[33m%s\x1b[0m', '- Default Password: admin123');
    }
    console.log('=======================================\n');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '✗ Error checking admin credentials:');
    console.error(error);
  }
};

// Function to create a new admin account with a complex password
const createNewAdminAccount = async () => {
  try {
    // Generate a secure random email and password
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const newAdminEmail = `admin.recovery${timestamp}@staywise.com`;
    
    // Create a complex password with uppercase, lowercase, numbers and special characters
    const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz';
    const numberChars = '23456789';
    const specialChars = '!@#$%^&*_-+=';
    
    let complexPassword = '';
    // Add at least one character from each character set
    complexPassword += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    complexPassword += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
    complexPassword += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
    complexPassword += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    
    // Add more random characters to reach desired length (12 characters)
    const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
    for (let i = 0; i < 8; i++) {
      complexPassword += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password characters (Fisher-Yates algorithm)
    complexPassword = complexPassword.split('').sort(() => 0.5 - Math.random()).join('');
    
    // Check if an admin with this email already exists
    const existingAdmin = await Admin.findOne({ email: newAdminEmail });
    if (existingAdmin) {
      // If email already exists (very unlikely), just return without creating
      return;
    }
    
    // Create the new admin account
    const newAdmin = await Admin.create({
      name: "Emergency Admin",
      email: newAdminEmail,
      password: complexPassword // Will be hashed by the model's pre-save hook
    });
    
    if (newAdmin) {
      // Display the credentials in the console with attention-grabbing formatting
      console.log('\n');
      console.log('='.repeat(80));
      console.log('\x1b[41m%s\x1b[0m', '                     NEW EMERGENCY ADMIN ACCOUNT CREATED                      ');
      console.log('='.repeat(80));
      console.log('\x1b[33m%s\x1b[0m', 'Since you forgot your admin password, a new admin account has been created');
      console.log('\x1b[33m%s\x1b[0m', 'with the following credentials. USE THESE TO LOGIN:');
      console.log('\n');
      console.log('\x1b[36m%s\x1b[0m', 'Email:    ', newAdminEmail);
      console.log('\x1b[36m%s\x1b[0m', 'Password: ', complexPassword);
      console.log('\n');
      console.log('\x1b[31m%s\x1b[0m', 'IMPORTANT: These credentials are shown ONLY ONCE in this console.');
      console.log('\x1b[31m%s\x1b[0m', 'Please save them immediately in a secure location.');
      console.log('='.repeat(80));
      console.log('\n');
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '✗ Error creating new admin account:');
    console.error(error);
  }
};

const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/warden', wardenRoutes);
app.use('/api/hosteller', hostellerRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Hostel Management API is running');
});

// Schedule cron jobs
scheduleExpiryCheck();

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Check for admin credentials when server starts
  await checkAdminCredentials();
});