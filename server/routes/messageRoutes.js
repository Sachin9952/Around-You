const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const mongoose = require("mongoose");
const { protect } = require("../middleware/auth");

// Get inbox (all conversations for logged in user)
router.get("/inbox", protect, async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();

    // 1. Find all messages where conversationId contains the current user's ID
    const userMessages = await Message.find({ conversationId: { $regex: currentUserId } })
      .sort({ createdAt: -1 });

    // 2. Group by conversationId, keeping only the latest message per conversation
    const uniqueRooms = new Map();
    userMessages.forEach(msg => {
      if (!uniqueRooms.has(msg.conversationId)) {
        uniqueRooms.set(msg.conversationId, msg);
      }
    });

    // 3. Extract partner IDs and wait for User queries
    const inbox = await Promise.all(
      Array.from(uniqueRooms.values()).map(async (latestMessage) => {
        // conversationId is of format "userId1_userId2"
        const ids = latestMessage.conversationId.split('_');
        const partnerId = ids.find(id => id !== currentUserId) || currentUserId; // Fallback to SELF if chatting with self
        
        let partnerData = null;
        if (partnerId && mongoose.Types.ObjectId.isValid(partnerId)) {
          const partner = await User.findById(partnerId).select('name avatar role isOnline lastSeen');
          if (partner) {
            partnerData = {
              _id: partner._id,
              name: partner.name,
              avatar: partner.avatar,
              role: partner.role,
              isOnline: partner.isOnline,
              lastSeen: partner.lastSeen
            };
          }
        }

        let previewText = latestMessage.content || '';
        if (latestMessage.type === 'image') previewText = 'Shared an image';
        if (latestMessage.type === 'pdf') previewText = 'Shared a document';
        if (latestMessage.type === 'voice') previewText = '🎤 Voice message';
        if (latestMessage.type === 'booking_prompt') previewText = '📅 Booking Request';

        return {
          room: latestMessage.conversationId,
          latestMessage: previewText,
          time: new Date(latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: latestMessage.status,
          sender: latestMessage.sender,
          createdAt: latestMessage.createdAt,
          partner: partnerData || { _id: partnerId, name: "Unknown User" }
        };
      })
    );

    // Sort the final inbox by createdAt descending (newest first)
    inbox.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ success: true, count: inbox.length, data: inbox });
  } catch (error) {
    console.error("Inbox Error:", error);
    res.status(500).json({ success: false, error: 'Server error fetching inbox' });
  }
});

// Get messages of a room
router.get("/:roomId", protect, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.roomId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;