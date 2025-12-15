/**
 * Appointment Model
 * Appointment booking and management
 */

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required']
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required']
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required']
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time is required']
    },
    duration: {
      type: Number,
      default: 30, // minutes
      min: [15, 'Minimum appointment duration is 15 minutes']
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    notes: {
      type: String,
      trim: true
    },
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'system']
    },
    cancellationReason: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for faster queries
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
// Compound index to prevent duplicate appointments
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 }, { unique: true });

// Populate patient and doctor details
appointmentSchema.virtual('patient', {
  ref: 'User',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

appointmentSchema.virtual('doctor', {
  ref: 'User',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true
});

// Validate appointment date is not in the past
appointmentSchema.pre('save', function (next) {
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  
  if (appointmentDateTime < now) {
    return next(new Error('Appointment date cannot be in the past'));
  }
  
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
