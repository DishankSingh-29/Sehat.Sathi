/**
 * Patient Controller
 * Request handlers for patient routes
 */

const patientService = require('./patient.service');
const { sendSuccess, sendError } = require('../../utils/response.util');

/**
 * Get patient profile
 * GET /api/patients/profile
 */
const getProfile = async (req, res) => {
  try {
    const profile = await patientService.getProfile(req.userId);

    return sendSuccess(res, 200, 'Profile retrieved successfully', profile);
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

/**
 * Update patient profile
 * PUT /api/patients/profile
 */
const updateProfile = async (req, res) => {
  try {
    const profile = await patientService.updateProfile(req.userId, req.body);

    return sendSuccess(res, 200, 'Profile updated successfully', profile);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
