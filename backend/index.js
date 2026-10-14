require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const customerRoutes = require('./routes/customer.routes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopkart';

// Middlewares
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Base Route / Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ShopKart Customer Authentication Service API is running',
  });
});

// API Routes
app.use('/customers', customerRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Connect to MongoDB & Start Server
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('Successfully connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
    });
}

module.exports = app;
