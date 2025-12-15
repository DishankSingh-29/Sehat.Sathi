/**
 * Auth Controller
 * Request handlers for authentication routes
 */

const authService = require('./auth.service');
const { sendSuccess, sendError } = require('../../utils/response.util');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);

    return sendSuccess(res, 201, 'User registered successfully', result);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    return sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    return sendError(res, 401, error.message);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.userId);

    return sendSuccess(res, 200, 'User profile retrieved successfully', user);
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};
