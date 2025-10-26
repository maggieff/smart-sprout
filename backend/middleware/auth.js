const database = require('../utils/database');

/**
 * Authentication middleware to verify user tokens
 * For now, we'll use a simple approach with user ID in headers
 * In production, this would use JWT tokens
 */
const authenticateUser = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.'
      });
    }

    // Verify user exists
    const user = await database.getUserById(userId);
    if (!user) {
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
