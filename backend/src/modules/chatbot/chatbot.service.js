/**
 * Chatbot Service
 * Business logic for chatbot operations
 */

const Chatbot = require('../../models/Chatbot.model');
const User = require('../../models/User.model');

/**
 * Get or create chatbot session for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Chatbot session object
 */
const getOrCreateSession = async (userId) => {
  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Find active session or create new one
  let session = await Chatbot.findOne({ userId, isActive: true })
    .sort({ createdAt: -1 });

  if (!session) {
    session = await Chatbot.create({
      userId,
      messages: [],
      isActive: true
    });
  }

  return session;
};

/**
 * Add message to chatbot session
 * @param {string} userId - User ID
 * @param {string} userMessage - User message content
 * @returns {Promise<Object>} Updated chatbot session with AI response
 */
const addMessage = async (userId, userMessage) => {
  // Get or create session
  const session = await getOrCreateSession(userId);

  // Add user message
  session.messages.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  });

  // Generate AI response (mock logic - replace with actual AI integration)
  const aiResponse = generateAIResponse(userMessage, session.messages);

  // Add AI response
  session.messages.push({
    role: 'assistant',
    content: aiResponse,
    timestamp: new Date()
  });

  await session.save();

  return session;
};

/**
 * Generate AI response (mock implementation)
 * In production, integrate with actual AI service (OpenAI, etc.)
 * @param {string} userMessage - User's message
 * @param {Array} conversationHistory - Previous messages
 * @returns {string} AI response
 */
const generateAIResponse = (userMessage, conversationHistory) => {
  // Mock AI response logic
  // In production, replace with actual AI API call
  
  const lowerMessage = userMessage.toLowerCase();

  // Simple keyword-based responses (mock)
  if (lowerMessage.includes('headache') || lowerMessage.includes('head pain')) {
    return 'Headaches can have various causes. Common remedies include rest, hydration, and over-the-counter pain relievers. If headaches persist or are severe, please consult a doctor. Would you like to book an appointment?';
  }

  if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
    return 'Fever is often a sign of infection. Stay hydrated, rest, and monitor your temperature. If fever persists for more than 3 days or exceeds 103°F, seek medical attention. Would you like more information or book an appointment?';
  }

  if (lowerMessage.includes('cough') || lowerMessage.includes('cold')) {
    return 'Coughs and colds are common. Rest, stay hydrated, and consider over-the-counter remedies. If symptoms persist for more than a week or worsen, consult a healthcare provider.';
  }

  if (lowerMessage.includes('pain') || lowerMessage.includes('ache')) {
    return 'Pain can indicate various conditions. Please describe the location, intensity, and duration. For persistent or severe pain, I recommend consulting with a doctor. Would you like to book an appointment?';
  }

  if (lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
    return 'To book an appointment, please visit the appointments section and select a doctor. You can also specify your preferred date and time. Is there anything else I can help you with?';
  }

  // Default response
  return 'Thank you for your query. I understand you\'re seeking medical guidance. For accurate diagnosis and treatment, I recommend consulting with a qualified healthcare professional. Would you like to book an appointment with a doctor, or do you have more specific symptoms to discuss?';
};

/**
 * Get chatbot session history
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of chatbot sessions
 */
const getSessionHistory = async (userId) => {
  const sessions = await Chatbot.find({ userId })
    .sort({ createdAt: -1 });

  return sessions;
};

/**
 * Close chatbot session
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated session object
 */
const closeSession = async (userId) => {
  const session = await Chatbot.findOne({ userId, isActive: true })
    .sort({ createdAt: -1 });

  if (!session) {
    throw new Error('No active session found');
  }

  session.isActive = false;
  await session.save();

  return session;
};

module.exports = {
  getOrCreateSession,
  addMessage,
  getSessionHistory,
  closeSession
};
