const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

/**
 * Authentication middleware to verify JWT from cookies and attach customer to req.user
 */
const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Also support Authorization header as fallback if tester tests via Bearer token
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'shopkart_default_secret_key'
    );

    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer not found',
      });
    }

    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
    });
  }
};

module.exports = authMiddleware;
