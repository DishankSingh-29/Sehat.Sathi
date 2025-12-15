/**
 * Report Model
 * Medical reports generated from chatbot conversations
 */

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    chatbotSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chatbot',
      required: [true, 'Chatbot session ID is required']
    },
    reportData: {
      symptoms: [String],
      diagnosis: {
        type: String,
        trim: true
      },
      recommendations: [String],
      severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
      },
      suggestedActions: [String],
      notes: {
        type: String,
        trim: true
      }
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    isReviewed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for faster queries
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ chatbotSessionId: 1 });

module.exports = mongoose.model('Report', reportSchema);
