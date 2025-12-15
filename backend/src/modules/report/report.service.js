/**
 * Report Service
 * Business logic for report operations
 */

const Report = require('../../models/Report.model');
const Chatbot = require('../../models/Chatbot.model');
const User = require('../../models/User.model');

/**
 * Generate report from chatbot session
 * @param {string} userId - User ID
 * @param {string} chatbotSessionId - Chatbot session ID
 * @returns {Promise<Object>} Generated report object
 */
const generateReport = async (userId, chatbotSessionId) => {
  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Get chatbot session
  const session = await Chatbot.findById(chatbotSessionId);
  if (!session) {
    throw new Error('Chatbot session not found');
  }

  // Verify session belongs to user
  if (session.userId.toString() !== userId) {
    throw new Error('Unauthorized access to this session');
  }

  // Check if report already exists for this session
  const existingReport = await Report.findOne({ chatbotSessionId });
  if (existingReport) {
    return existingReport;
  }

  // Analyze conversation and generate report data
  const reportData = analyzeConversation(session.messages);

  // Create report
  const report = await Report.create({
    userId,
    chatbotSessionId,
    reportData,
    generatedAt: new Date()
  });

  return report;
};

/**
 * Analyze conversation and extract medical information
 * @param {Array} messages - Array of message objects
 * @returns {Object} Report data object
 */
const analyzeConversation = (messages) => {
  // Extract user messages for analysis
  const userMessages = messages
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content.toLowerCase());

  const allText = userMessages.join(' ');

  // Extract symptoms (mock implementation)
  const symptoms = [];
  const symptomKeywords = {
    'headache': 'Headache',
    'fever': 'Fever',
    'cough': 'Cough',
    'cold': 'Cold',
    'pain': 'Pain',
    'nausea': 'Nausea',
    'vomiting': 'Vomiting',
    'diarrhea': 'Diarrhea',
    'fatigue': 'Fatigue',
    'dizziness': 'Dizziness',
    'chest pain': 'Chest Pain',
    'shortness of breath': 'Shortness of Breath',
    'sore throat': 'Sore Throat',
    'rash': 'Rash',
    'swelling': 'Swelling'
  };

  Object.keys(symptomKeywords).forEach(keyword => {
    if (allText.includes(keyword)) {
      symptoms.push(symptomKeywords[keyword]);
    }
  });

  // Remove duplicates
  const uniqueSymptoms = [...new Set(symptoms)];

  // Generate diagnosis (mock)
  let diagnosis = 'General consultation';
  let severity = 'low';
  let suggestedActions = [
    'Monitor symptoms closely',
    'Maintain adequate hydration',
    'Get adequate rest'
  ];

  if (uniqueSymptoms.includes('Chest Pain') || uniqueSymptoms.includes('Shortness of Breath')) {
    diagnosis = 'Possible cardiovascular or respiratory issue';
    severity = 'high';
    suggestedActions = [
      'Seek immediate medical attention',
      'Monitor vital signs',
      'Do not delay consultation'
    ];
  } else if (uniqueSymptoms.includes('Fever') && uniqueSymptoms.length > 2) {
    diagnosis = 'Possible infection';
    severity = 'medium';
    suggestedActions = [
      'Consult with a healthcare provider',
      'Monitor temperature regularly',
      'Stay hydrated and rest'
    ];
  } else if (uniqueSymptoms.length > 0) {
    diagnosis = 'Symptomatic presentation requiring evaluation';
    severity = uniqueSymptoms.length > 3 ? 'medium' : 'low';
  }

  // Generate recommendations
  const recommendations = [
    'Follow up with a healthcare provider if symptoms persist',
    'Maintain a symptom diary',
    'Follow prescribed medications if any'
  ];

  return {
    symptoms: uniqueSymptoms.length > 0 ? uniqueSymptoms : ['General consultation'],
    diagnosis,
    recommendations,
    severity,
    suggestedActions,
    notes: `Report generated from chatbot conversation on ${new Date().toLocaleDateString()}. This is a preliminary analysis based on reported symptoms. Please consult with a qualified healthcare professional for accurate diagnosis and treatment.`
  };
};

/**
 * Get all reports for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of report objects
 */
const getUserReports = async (userId) => {
  const reports = await Report.find({ userId })
    .populate('chatbotSessionId')
    .sort({ createdAt: -1 });

  return reports;
};

/**
 * Get report by ID
 * @param {string} reportId - Report ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Report object
 */
const getReportById = async (reportId, userId) => {
  const report = await Report.findById(reportId)
    .populate('chatbotSessionId');

  if (!report) {
    throw new Error('Report not found');
  }

  // Verify report belongs to user
  if (report.userId.toString() !== userId) {
    throw new Error('Unauthorized access to this report');
  }

  return report;
};

module.exports = {
  generateReport,
  getUserReports,
  getReportById
};
