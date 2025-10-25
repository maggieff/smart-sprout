const express = require('express');
const router = express.Router();
const database = require('../utils/database');

// Sign in endpoint
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    const result = await database.authenticateUser(email, password);
    
    if (result.success) {
      res.json({
        success: true,
        user: result.user
      });
    } else {
      res.status(401).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Sign up endpoint
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email and password are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    const result = await database.createUser(name, email, password);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        user: result.user
      });
    } else {
      res.status(409).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Get current user endpoint
router.get('/me', async (req, res) => {
  try {
    // In a real app, this would check JWT token or session
    // For now, we'll return a mock response for demo purposes
    res.json({
      success: true,
      user: {
        id: 1,
        name: 'Demo User',
        email: 'demo@example.com'
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Sign out endpoint
router.post('/signout', (req, res) => {
  try {
    // In a real app, this would invalidate the JWT token or session
    res.json({
      success: true,
      message: 'Signed out successfully'
    });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;
