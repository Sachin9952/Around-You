const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  room: String,
  senderId: String,
  message: String,
  image: String,
  time: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", messageSchema);