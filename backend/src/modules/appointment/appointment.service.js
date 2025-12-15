/**
 * Appointment Service
 * Business logic for appointment operations
 */

const Appointment = require('../../models/Appointment.model');
const User = require('../../models/User.model');
const Doctor = require('../../models/Doctor.model');

/**
 * Book an appointment
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} Appointment object
 */
const bookAppointment = async (appointmentData) => {
  const { patientId, doctorId, appointmentDate, appointmentTime, duration, reason, notes } = appointmentData;

  // Verify patient exists
  const patient = await User.findById(patientId);
  if (!patient || patient.role !== 'patient') {
    throw new Error('Patient not found');
  }

  // Verify doctor exists
  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'doctor') {
    throw new Error('Doctor not found');
  }

  // Check if appointment slot is already taken
  const existingAppointment = await Appointment.findOne({
    doctorId,
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (existingAppointment) {
    throw new Error('This time slot is already booked');
  }

  // Check if appointment date is in the past
  const appointmentDateTime = new Date(appointmentDate);
  if (appointmentDateTime < new Date()) {
    throw new Error('Cannot book appointment in the past');
  }

  // Create appointment
  const appointment = await Appointment.create({
    patientId,
    doctorId,
    appointmentDate: appointmentDateTime,
    appointmentTime,
    duration: duration || 30,
    reason,
    notes,
    status: 'pending'
  });

  // Populate patient and doctor details
  await appointment.populate('patientId', 'name email phone');
  await appointment.populate('doctorId', 'name email phone');

  return appointment;
};

/**
 * Get appointments by patient ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<Array>} Array of appointment objects
 */
const getAppointmentsByPatient = async (patientId) => {
  const appointments = await Appointment.find({ patientId })
    .populate('doctorId', 'name email phone')
    .sort({ appointmentDate: -1, appointmentTime: -1 });

  return appointments;
};

/**
 * Get appointments by doctor ID
 * @param {string} doctorId - Doctor ID
 * @returns {Promise<Array>} Array of appointment objects
 */
const getAppointmentsByDoctor = async (doctorId) => {
  const appointments = await Appointment.find({ doctorId })
    .populate('patientId', 'name email phone')
    .sort({ appointmentDate: -1, appointmentTime: -1 });

  return appointments;
};

/**
 * Get appointment by ID
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<Object>} Appointment object
 */
const getAppointmentById = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name email phone');

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  return appointment;
};

/**
 * Update appointment status
 * @param {string} appointmentId - Appointment ID
 * @param {string} status - New status
 * @param {string} userId - User ID making the update
 * @param {string} userRole - Role of user making the update
 * @param {string} cancellationReason - Reason for cancellation (if applicable)
 * @returns {Promise<Object>} Updated appointment object
 */
const updateAppointmentStatus = async (appointmentId, status, userId, userRole, cancellationReason = null) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  // Verify user has permission to update
  if (userRole === 'patient' && appointment.patientId.toString() !== userId) {
    throw new Error('Unauthorized to update this appointment');
  }

  if (userRole === 'doctor' && appointment.doctorId.toString() !== userId) {
    throw new Error('Unauthorized to update this appointment');
  }

  // Update status
  appointment.status = status;

  if (status === 'cancelled' && cancellationReason) {
    appointment.cancelledBy = userRole;
    appointment.cancellationReason = cancellationReason;
  }

  await appointment.save();

  // Populate details
  await appointment.populate('patientId', 'name email phone');
  await appointment.populate('doctorId', 'name email phone');

  return appointment;
};

module.exports = {
  bookAppointment,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  getAppointmentById,
  updateAppointmentStatus
};
