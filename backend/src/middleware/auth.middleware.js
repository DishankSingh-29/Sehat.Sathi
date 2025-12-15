/**
 * Authentication Middleware
 * JWT token verification and authorization
 */

const { verifyToken } = require('../utils/jwt.util');
const User = require('../models/User.model');
const { sendError } = require('../utils/response.util');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'No token provided, authorization denied');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return sendError(res, 401, 'User not found');
    }

    if (!user.isActive) {
      return sendError(res, 401, 'User account is inactive');
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;

    next();
  } catch (error) {
    return sendError(res, 401, error.message || 'Invalid token');
  }
};

/**
 * Authorize based on user role
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'Access denied. Insufficient permissions');
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
