/**
 * Patient Service
 * Business logic for patient operations
 */

const User = require('../../models/User.model');

/**
 * Get patient profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Patient object
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('Patient not found');
  }

  if (user.role !== 'patient') {
    throw new Error('User is not a patient');
  }

  return user;
};

/**
 * Update patient profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated patient object
 */
const updateProfile = async (userId, updateData) => {
  const { name, phone, address, dateOfBirth, gender } = updateData;

  // Fields that can be updated
  const allowedFields = { name, phone, address, dateOfBirth, gender };
  
  // Remove undefined fields
  Object.keys(allowedFields).forEach(key => {
    if (allowedFields[key] === undefined) {
      delete allowedFields[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: allowedFields },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new Error('Patient not found');
  }

  if (user.role !== 'patient') {
    throw new Error('User is not a patient');
  }

  return user;
};

module.exports = {
  getProfile,
  updateProfile
};
