const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['text', 'image', 'pdf', 'voice', 'booking_prompt', 'booking_update'], default: 'text' },
  content: { type: String },
  fileUrl: { type: String }, // Used for image, pdf, voice
  status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);