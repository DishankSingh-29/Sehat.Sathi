/**
 * Chatbot Controller
 * Request handlers for chatbot routes
 */

const chatbotService = require('./chatbot.service');
const { sendSuccess, sendError } = require('../../utils/response.util');

/**
 * Get or create chatbot session
 * GET /api/chatbot/session
 */
const getSession = async (req, res) => {
  try {
    const session = await chatbotService.getOrCreateSession(req.userId);

    return sendSuccess(res, 200, 'Session retrieved successfully', session);
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

/**
 * Send message to chatbot
 * POST /api/chatbot/message
 */
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return sendError(res, 400, 'Message is required');
    }

    const session = await chatbotService.addMessage(req.userId, message.trim());

    return sendSuccess(res, 200, 'Message sent successfully', session);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * Get chat history
 * GET /api/chatbot/history
 */
const getHistory = async (req, res) => {
  try {
    const sessions = await chatbotService.getSessionHistory(req.userId);

    return sendSuccess(res, 200, 'Chat history retrieved successfully', sessions);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * Close chatbot session
 * POST /api/chatbot/close
 */
const closeSession = async (req, res) => {
  try {
    const session = await chatbotService.closeSession(req.userId);

    return sendSuccess(res, 200, 'Session closed successfully', session);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

module.exports = {
  getSession,
  sendMessage,
  getHistory,
  closeSession
};
