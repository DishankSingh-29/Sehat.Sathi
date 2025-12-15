/**
 * Appointment Routes
 * Appointment endpoints
 */

const express = require('express');
const router = express.Router();
const appointmentController = require('./appointment.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Patient routes
router.post('/', authorize('patient'), appointmentController.bookAppointment);
router.get('/patient', authorize('patient'), appointmentController.getPatientAppointments);

// Doctor routes
router.get('/doctor', authorize('doctor'), appointmentController.getDoctorAppointments);

// Shared routes (both patient and doctor)
router.get('/:id', appointmentController.getAppointmentById);
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

module.exports = router;
