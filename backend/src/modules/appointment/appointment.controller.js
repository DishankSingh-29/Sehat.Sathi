/**
 * Appointment Controller
 * Request handlers for appointment routes
 */

const appointmentService = require('./appointment.service');
const { sendSuccess, sendError } = require('../../utils/response.util');

/**
 * Book an appointment
 * POST /api/appointments
 */
const bookAppointment = async (req, res) => {
  try {
    const appointmentData = {
      ...req.body,
      patientId: req.userId // Set patient ID from authenticated user
    };

    const appointment = await appointmentService.bookAppointment(appointmentData);

    return sendSuccess(res, 201, 'Appointment booked successfully', appointment);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

/**
 * Get patient's appointments
 * GET /api/appointments/patient
 */
const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAppointmentsByPatient(req.userId);

    return sendSuccess(res, 200, 'Appointments retrieved successfully', appointments);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * Get doctor's appointments
 * GET /api/appointments/doctor
 */
const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAppointmentsByDoctor(req.userId);

    return sendSuccess(res, 200, 'Appointments retrieved successfully', appointments);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * Get appointment by ID
 * GET /api/appointments/:id
 */
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);

    return sendSuccess(res, 200, 'Appointment retrieved successfully', appointment);
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

/**
 * Update appointment status
 * PATCH /api/appointments/:id/status
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;

    if (!status) {
      return sendError(res, 400, 'Status is required');
    }

    const appointment = await appointmentService.updateAppointmentStatus(
      req.params.id,
      status,
      req.userId,
      req.userRole,
      cancellationReason
    );

    return sendSuccess(res, 200, 'Appointment status updated successfully', appointment);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

module.exports = {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus
};
