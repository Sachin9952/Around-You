const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide a booking date'],
    },
    time: {
      type: String,
      required: [true, 'Please provide a time slot'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Please provide a service address'],
    },
    // Snapshot fields — preserved even if referenced docs are deleted
    customerName: { type: String, default: '' },
    providerName: { type: String, default: '' },
    serviceTitle: { type: String, default: '' },
    serviceCategory: { type: String, default: '' },
    servicePrice: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Index for common queries
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
