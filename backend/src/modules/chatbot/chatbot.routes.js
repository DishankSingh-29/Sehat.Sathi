/**
 * Chatbot Routes
 * Chatbot endpoints
 */

const express = require('express');
const router = express.Router();
const chatbotController = require('./chatbot.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

router.get('/session', chatbotController.getSession);
router.post('/message', chatbotController.sendMessage);
router.get('/history', chatbotController.getHistory);
router.post('/close', chatbotController.closeSession);

module.exports = router;
