const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/dbConfig');
const { scheduleExpiryCheck } = require('./cron/expiryCheck');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const wardenRoutes = require('./routes/wardenRoutes');
const hostellerRoutes = require('./routes/hostellerRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});