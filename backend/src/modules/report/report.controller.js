/**
 * Report Controller
 * Request handlers for report routes
 */

const reportService = require('./report.service');
const { sendSuccess, sendError } = require('../../utils/response.util');

/**
 * Generate report from chatbot session
 * POST /api/reports/generate
 */
const generateReport = async (req, res) => {
  try {
    const { chatbotSessionId } = req.body;

    if (!chatbotSessionId) {
      return sendError(res, 400, 'Chatbot session ID is required');
    }

    const report = await reportService.generateReport(req.userId, chatbotSessionId);

    return sendSuccess(res, 201, 'Report generated successfully', report);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

/**
 * Get all user reports
 * GET /api/reports
 */
const getUserReports = async (req, res) => {
  try {
    const reports = await reportService.getUserReports(req.userId);

    return sendSuccess(res, 200, 'Reports retrieved successfully', reports);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * Get report by ID
 * GET /api/reports/:id
 */
const getReportById = async (req, res) => {
  try {
    const report = await reportService.getReportById(req.params.id, req.userId);

    return sendSuccess(res, 200, 'Report retrieved successfully', report);
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

module.exports = {
  generateReport,
  getUserReports,
  getReportById
};
