const bcrypt = require('bcrypt');
const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

/**
 * Task 1: Register a new customer
 * POST /customers/register
 */
const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Check for missing fields
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Validate password length
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create customer in database
    const newCustomer = await Customer.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Task 2: Login customer
 * POST /customers/login
 */
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });

    // Do not reveal whether email or password was incorrect
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare password with bcrypt hash
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT and store in HttpOnly cookie
    generateToken(res, customer._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Task 3: My Profile
 * GET /customers/me
 */
const getProfile = async (req, res) => {
  try {
    // req.user is attached by authMiddleware and excludes password
    return res.status(200).json({
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Task 4: Logout customer
 * POST /customers/logout
 */
const logoutCustomer = async (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Bonus Challenge (+10 Marks): Change Password
 * PATCH /customers/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required',
      });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Fetch customer with password to verify
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Verify old password
    const isOldMatch = await bcrypt.compare(oldPassword, customer.password);
    if (!isOldMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: Old password is incorrect',
      });
    }

    // Hash new password
    const saltRounds = 10;
    customer.password = await bcrypt.hash(newPassword, saltRounds);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
  changePassword,
};
