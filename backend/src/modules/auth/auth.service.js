/**
 * Auth Service
 * Business logic for authentication
 */

const User = require('../../models/User.model');
const { generateToken } = require('../../utils/jwt.util');

/**
 * Register a new user (patient or doctor)
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User object and token
 */
const register = async (userData) => {
  const { name, email, password, role, phone, address, dateOfBirth, gender } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    address,
    dateOfBirth,
    gender
  });

  // Generate token
  const token = generateToken(user._id, user.role);

  // Return user without password
  const userResponse = user.toObject();
  delete userResponse.password;

  return {
    user: userResponse,
    token
  };
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object and token
 */
const login = async (email, password) => {
  // Find user with password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Account is inactive. Please contact support');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user._id, user.role);

  // Return user without password
  const userResponse = user.toObject();
  delete userResponse.password;

  return {
    user: userResponse,
    token
  };
};

/**
 * Get current user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

module.exports = {
  register,
  login,
  getCurrentUser
};
