const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// ─── 1. Load environment variables FIRST (before anything uses them) ───
dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const Message = require('./models/Message');
const User = require('./models/User');

// ─── 2. Connect to MongoDB BEFORE starting the server ───
connectDB();

const app = express();
const server = http.createServer(app);

// ─── 3. Body parser & CORS (BEFORE routes) ───
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://around-you-ten.vercel.app",
  "https://around-ml4ffvu34-sachin-singh-akhawats-projects.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // In production, we allow specific origins or any vercel.app subdomain
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Explicitly handle preflight requests
app.options('*', cors());

// ─── 4. Socket.IO setup ───
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const isVercel = origin.endsWith(".vercel.app");
      if (allowedOrigins.indexOf(origin) !== -1 || isVercel) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

const jwt = require('jsonwebtoken');

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.user = decoded; // Attach user info to socket
    next();
  });
});

// Make io accessible in routes (optional advanced)
app.set("io", io);

// Keep track of active users to handle presence mapping
const userSocketMap = new Map();

io.on("connection", async (socket) => {
  const userId = socket.user.id.toString(); // Ensure userId is a string
  userSocketMap.set(userId, socket.id);

  console.log(`User connected: ${userId} -> Socket: ${socket.id}`);
  
  // Join a personal room to handle multiple tabs/sessions
  socket.join(`user_${userId}`);

  // Mark user as online in DB and broadcast
  await User.findByIdAndUpdate(userId, { isOnline: true });
  socket.broadcast.emit("user_online", { userId });

  socket.on("join_room", (room) => {
    socket.join(room);
  });

  // Handle incoming message sending dynamically
  socket.on("send_message", async (data) => {
    try {
      // 1. Create DB entry securely. Trusting server auth for sender.
      const newMsg = await Message.create({
        conversationId: data.room,
        sender: userId,
        receiver: data.receiverId,
        type: data.type || 'text',
        content: data.message,
        fileUrl: data.fileUrl,
        status: "sent"
      });

      const populatedMsg = await Message.findById(newMsg._id).populate('sender', 'name avatar');
      
      const payload = {
        _id: populatedMsg._id,
        conversationId: data.room,
        senderId: userId,
        receiverId: data.receiverId,
        type: populatedMsg.type,
        message: populatedMsg.content,
        fileUrl: populatedMsg.fileUrl,
        status: populatedMsg.status,
        time: new Date(populatedMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      // 2. Deliver physically to all active sessions of the receiver
      io.to(`user_${data.receiverId}`).emit("receive_message", payload);

      // 3. Emit back to all active sessions of the sender (handles multiple tabs)
      io.to(`user_${userId}`).emit("receive_message", payload);

      // Auto-mark as delivered if receiver is online
      if (userSocketMap.has(data.receiverId)) {
        populatedMsg.status = "delivered";
        await populatedMsg.save();
        // and notify sender(s)
        io.to(`user_${userId}`).emit("update_message_status", { messageId: populatedMsg._id, status: "delivered" });
      }
      
      // Secondary fallback (legacy support): Emit to the whole room in case they use multiple tabs
      // io.to(data.room).emit("receive_message", payload);

    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // Read receipts flow
  socket.on("message_delivered", async ({ messageId, senderId }) => {
    await Message.findByIdAndUpdate(messageId, { status: "delivered" });
    const senderSocketId = userSocketMap.get(senderId);
    if (senderSocketId) io.to(senderSocketId).emit("update_message_status", { messageId, status: "delivered" });
  });

  socket.on("message_seen", async ({ messageId, senderId }) => {
    await Message.findByIdAndUpdate(messageId, { status: "seen" });
    const senderSocketId = userSocketMap.get(senderId);
    if (senderSocketId) io.to(senderSocketId).emit("update_message_status", { messageId, status: "seen" });
  });

  // Batch seen (for opening the chat tab)
  socket.on("messages_seen_batch", async ({ room, partnerId }) => {
    await Message.updateMany(
      { conversationId: room, sender: partnerId, status: { $ne: "seen" } },
      { $set: { status: "seen" } }
    );
    const partnerSocketId = userSocketMap.get(partnerId);
    if (partnerSocketId) io.to(partnerSocketId).emit("batch_update_status", { room, status: "seen" });
  });

  // Typing events
  socket.on("typing", (data) => {
    socket.to(data.room).emit("user_typing", data);
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.room).emit("user_stop_typing", data);
  });

  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${userId}`);
    userSocketMap.delete(userId);
    
    // Fallback: Check if they have other tabs open? For simplicity, we assume completely offline
    await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
    socket.broadcast.emit("user_offline", { userId, lastSeen: new Date() });
  });
});

// ─── 5. Mount Routes ───
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Around-You API is running' });
});

app.get("/", (req, res) => {
  res.send("API is live ");
});

// Global error handler (must be after route mounting)
app.use(errorHandler);

// ─── 6. Start server LAST ───
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
