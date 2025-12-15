/**
 * Patient Routes
 * Patient endpoints
 */

const express = require('express');
const router = express.Router();
const patientController = require('./patient.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// All routes require authentication and patient role
router.use(authenticate);
router.use(authorize('patient'));

router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);

module.exports = router;
