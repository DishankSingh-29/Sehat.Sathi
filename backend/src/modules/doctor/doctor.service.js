/**
 * Doctor Service
 * Business logic for doctor operations
 */

const User = require('../../models/User.model');
const Doctor = require('../../models/Doctor.model');

/**
 * Create doctor profile
 * @param {string} userId - User ID
 * @param {Object} doctorData - Doctor profile data
 * @returns {Promise<Object>} Doctor profile object
 */
const createProfile = async (userId, doctorData) => {
  // Verify user exists and is a doctor
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  if (user.role !== 'doctor') {
    throw new Error('User is not a doctor');
  }

  // Check if doctor profile already exists
  const existingDoctor = await Doctor.findOne({ userId });
  if (existingDoctor) {
    throw new Error('Doctor profile already exists');
  }

  // Create doctor profile
  const doctor = await Doctor.create({
    userId,
    ...doctorData
  });

  // Populate user details
  await doctor.populate('userId', 'name email phone');

  return doctor;
};

/**
 * Get all doctors with optional filtering
 * @param {Object} filters - Filter options (specialization)
 * @returns {Promise<Array>} Array of doctor objects
 */
const getAllDoctors = async (filters = {}) => {
  const { specialization } = filters;
  
  const query = {};
  if (specialization) {
    query.specialization = new RegExp(specialization, 'i'); // Case-insensitive search
  }

  const doctors = await Doctor.find(query)
    .populate('userId', 'name email phone address dateOfBirth gender')
    .sort({ createdAt: -1 });

  return doctors;
};

/**
 * Get doctor by ID
 * @param {string} doctorId - Doctor ID
 * @returns {Promise<Object>} Doctor object
 */
const getDoctorById = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId)
    .populate('userId', 'name email phone address dateOfBirth gender');

  if (!doctor) {
    throw new Error('Doctor not found');
  }

  return doctor;
};

/**
 * Get doctor profile by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Doctor profile object
 */
const getDoctorProfile = async (userId) => {
  const doctor = await Doctor.findOne({ userId })
    .populate('userId', 'name email phone address dateOfBirth gender');

  if (!doctor) {
    throw new Error('Doctor profile not found');
  }

  return doctor;
};

/**
 * Update doctor profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated doctor object
 */
const updateProfile = async (userId, updateData) => {
  const doctor = await Doctor.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('userId', 'name email phone address dateOfBirth gender');

  if (!doctor) {
    throw new Error('Doctor profile not found');
  }

  return doctor;
};

module.exports = {
  createProfile,
  getAllDoctors,
  getDoctorById,
  getDoctorProfile,
  updateProfile
};
