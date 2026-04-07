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

// ─── 2. Connect to MongoDB BEFORE starting the server ───
connectDB();

const app = express();
const server = http.createServer(app);

// ─── 3. Body parser & CORS (BEFORE routes) ───
app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://around-you-ten.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ─── 4. Socket.IO setup ───
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://around-you-ten.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io accessible in routes (optional advanced)
app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (room) => {
    socket.join(room);
  });

  socket.on("send_message", async (data) => {
    try {
      // Save to DB
      const saved = await Message.create(data);
      // Emit to all clients in the room (including sender)
      io.to(data.room).emit("receive_message", {
        ...data,
        _id: saved._id,
      });
    } catch (err) {
      console.error("Error saving message:", err);
      // Still emit so the sender sees it (best effort)
      io.to(data.room).emit("receive_message", data);
    }
  });

  // Typing events
  socket.on("typing", (data) => {
    socket.to(data.room).emit("user_typing", data);
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.room).emit("user_stop_typing", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
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
