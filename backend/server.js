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

// Default admin credentials for seeding (when no admins exist)
const DEFAULT_ADMIN_EMAIL = 'virajbhamre55@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123';
const DEFAULT_ADMIN_NAME = 'System Admin';

// Seed default admin when no admins exist in database
const seedDefaultAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: DEFAULT_ADMIN_EMAIL });
    if (existingAdmin) return existingAdmin;

    const admin = await Admin.create({
      name: DEFAULT_ADMIN_NAME,
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD
    });

    console.log('\x1b[32m%s\x1b[0m', '✓ Default admin account created successfully!');
    console.log('\x1b[33m%s\x1b[0m', `  Email: ${DEFAULT_ADMIN_EMAIL}`);
    console.log('\x1b[33m%s\x1b[0m', `  Password: ${DEFAULT_ADMIN_PASSWORD}`);
    return admin;
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '✗ Error seeding default admin:');
    console.error(error);
    throw error;
  }
};

// Function to check for existing admins and seed if none exist
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
      
      console.log('\n\x1b[33m%s\x1b[0m', 'LOGIN CREDENTIALS:');
      console.log('\x1b[33m%s\x1b[0m', 'Email: Use the email shown above');
      
      const hasDefaultAdmin = admins.some(admin => admin.email === DEFAULT_ADMIN_EMAIL);
      
      if (hasDefaultAdmin) {
        console.log('\x1b[33m%s\x1b[0m', 'Password: Use default password "admin123" if you have not changed it');
      } else {
        console.log('\x1b[33m%s\x1b[0m', 'Password: Use the password you set during registration.');
      }
    } else {
      console.log('\x1b[31m%s\x1b[0m', '✗ No admin accounts found in database.');
      console.log('\x1b[33m%s\x1b[0m', 'Seeding default admin account...');
      await seedDefaultAdmin();
      console.log('\x1b[33m%s\x1b[0m', 'You can now login with the credentials above.');
    }
    console.log('=======================================\n');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '✗ Error checking admin credentials:');
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