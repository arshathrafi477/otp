require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const otpRoutes = require('./routes/otp');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static HTML frontend
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/otp', otpRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'OTP Verification Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
