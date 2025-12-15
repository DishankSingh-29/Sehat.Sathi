/**
 * JWT Utility
 * Token generation and verification
 */

const jwt = require('jsonwebtoken');
const envConfig = require('../config/env.config');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} role - User role (patient/doctor)
 * @returns {string} JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    envConfig.jwtSecret,
    { expiresIn: envConfig.jwtExpire }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, envConfig.jwtSecret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  verifyToken
};
