/**
 * Doctor Routes
 * Doctor endpoints
 */

const express = require('express');
const router = express.Router();
const doctorController = require('./doctor.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// Public routes (must be before parameterized routes)
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);

// Protected routes - require doctor role
router.post('/profile', authenticate, authorize('doctor'), doctorController.createProfile);
router.get('/profile/me', authenticate, authorize('doctor'), doctorController.getDoctorProfile);
router.put('/profile', authenticate, authorize('doctor'), doctorController.updateProfile);

module.exports = router;
