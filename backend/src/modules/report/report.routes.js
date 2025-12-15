/**
 * Report Routes
 * Report endpoints
 */

const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

router.post('/generate', reportController.generateReport);
router.get('/', reportController.getUserReports);
router.get('/:id', reportController.getReportById);

module.exports = router;
