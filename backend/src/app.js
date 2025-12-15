/**
 * Express App Configuration
 * Main application setup and middleware configuration
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const envConfig = require('./config/env.config');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const patientRoutes = require('./modules/patient/patient.routes');
const doctorRoutes = require('./modules/doctor/doctor.routes');
const appointmentRoutes = require('./modules/appointment/appointment.routes');
const chatbotRoutes = require('./modules/chatbot/chatbot.routes');
const reportRoutes = require('./modules/report/report.routes');

// Import error middleware
const { errorHandler, notFound } = require('./middleware/error.middleware');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: envConfig.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (envConfig.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
