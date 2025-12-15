/**
 * Doctor Controller
 * Request handlers for doctor routes
 */

const doctorService = require('./doctor.service');
const { sendSuccess, sendError } = require('../../utils/response.util');

/**
 * Create doctor profile
 * POST /api/doctors/profile
 */
const createProfile = async (req, res) => {
  try {
    const profile = await doctorService.createProfile(req.userId, req.body);

    return sendSuccess(res, 201, 'Doctor profile created successfully', profile);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

/**
 * Get all doctors
 * GET /api/doctors
 */
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorService.getAllDoctors(req.query);

    return sendSuccess(res, 200, 'Doctors retrieved successfully', doctors);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * Get doctor by ID
 * GET /api/doctors/:id
 */
const getDoctorById = async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);

    return sendSuccess(res, 200, 'Doctor retrieved successfully', doctor);
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

/**
 * Get doctor profile (current doctor)
 * GET /api/doctors/profile
 */
const getDoctorProfile = async (req, res) => {
  try {
    const profile = await doctorService.getDoctorProfile(req.userId);

    return sendSuccess(res, 200, 'Profile retrieved successfully', profile);
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

/**
 * Update doctor profile
 * PUT /api/doctors/profile
 */
const updateProfile = async (req, res) => {
  try {
    const profile = await doctorService.updateProfile(req.userId, req.body);

    return sendSuccess(res, 200, 'Profile updated successfully', profile);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

module.exports = {
  createProfile,
  getAllDoctors,
  getDoctorById,
  getDoctorProfile,
  updateProfile
};
