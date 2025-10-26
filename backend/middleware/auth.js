const database = require('../utils/database');

/**
 * Authentication middleware to verify user tokens
 * For now, we'll use a simple approach with user ID in headers
 * In production, this would use JWT tokens
 */
const authenticateUser = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    console.log('Auth middleware: Received user-id header:', userId);
    
    if (!userId) {
      console.log('Auth middleware: No user-id header found');
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.'
      });
    }

    // Verify user exists
    console.log('Auth middleware: Looking up user with ID:', userId);
    const user = await database.getUserById(userId);
    console.log('Auth middleware: Found user:', user);
    
    if (!user) {
      console.log('Auth middleware: User not found in database');
      return res.status(401).json({
        success: false,
        error: 'Invalid user. Please log in again.'
      });
    }

    // Add user info to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

module.exports = { authenticateUser };
