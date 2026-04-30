const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Please add a subject for your request'],
      trim: true,
      maxlength: [100, 'Subject cannot be more than 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Please add a detailed message'],
      maxlength: [1000, 'Message cannot be more than 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'in-review', 'resolved'],
      default: 'pending',
    },
    adminReply: {
      type: String,
      maxlength: [1000, 'Reply cannot be more than 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
