const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// Get inbox (all conversations for logged in user)
router.get("/inbox", protect, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // 1. Find all messages where room contains the current user's ID
    const userMessages = await Message.find({ room: { $regex: currentUserId } })
      .sort({ createdAt: -1 });

    // 2. Group by room, keeping only the latest message per room
    const uniqueRooms = new Map();
    userMessages.forEach(msg => {
      if (!uniqueRooms.has(msg.room)) {
        uniqueRooms.set(msg.room, msg);
      }
    });

    // 3. Extract partner IDs and wait for User queries
    const inbox = await Promise.all(
      Array.from(uniqueRooms.values()).map(async (latestMessage) => {
        // Room is of format "userId1_userId2"
        const ids = latestMessage.room.split('_');
        const partnerId = ids.find(id => id !== currentUserId) || currentUserId; // Fallback to SELF if chatting with self
        
        let partnerData = null;
        if (partnerId) {
          const partner = await User.findById(partnerId).select('name avatar role');
          if (partner) {
            partnerData = {
              _id: partner._id,
              name: partner.name,
              avatar: partner.avatar,
              role: partner.role
            };
          }
        }

        return {
          room: latestMessage.room,
          latestMessage: latestMessage.message || "Shared an image",
          time: latestMessage.time,
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
    const messages = await Message.find({ room: req.params.roomId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;