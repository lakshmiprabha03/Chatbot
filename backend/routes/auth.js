const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: Validate email
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Register attempt:', req.body);
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      console.log('Missing fields error');
      return res.status(400).json({ success: false, error: 'All fields (username, email, password) are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('User  already exists:', email);
      return res.status(400).json({ success: false, error: 'User  with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({ username, email, password: hashedPassword });
    await user.save();
    console.log('User  saved to DB:', user._id);

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Format response to match frontend
    const userData = {
      id: user._id,  // Map _id to id
      username: user.username,
      email: user.email
    };

    res.status(201).json({
      success: true,
      data: {
        token,
        user: userData
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, error: 'Server error during registration: ' + error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing email/password');
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User  not found:', email);
      return res.status(400).json({ success: false, error: 'User  not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password for:', email);
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful for:', email);

    // Format response to match frontend (wrap in success/data, map _id to id)
    const userData = {
      id: user._id,  // Map _id to id
      username: user.username,
      email: user.email
    };

    // FIXED: Wrap response for logging
    const response = {
      success: true,
      data: {
        token,
        user: userData
      }
    };

    // FIXED: Add log before res.json (truncate token for security)
    console.log('🔥 BACKEND: Login successful - Token generated, Response:', {
      success: response.success,
      data: {
        token: response.data.token.substring(0, 20) + '...',  // Truncate first 20 chars
        user: response.data.user
      }
    });

    res.json(response);
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, error: 'Server error during login: ' + error.message });
  }
});

module.exports = router;