const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const http = require('http');
const {Server} = require('socket.io');
const server = http.createServer(app);
const app = express();

// 🔥 Attach socket to your existing backend
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "https://around-you-ten.vercel.app" // your frontend
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
    // Save to DB (we’ll create schema next)
    await Message.create(data);

    io.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// ❗ IMPORTANT: use server.listen not app.listen
server.listen(5000, () => console.log("Server running"));

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();


// Body parser
app.use(express.json());

// Enable CORS

app.use(cors({
  origin: [
   "http://localhost:5173", 
    "https://around-you-ten.vercel.app"

  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ---------- Mount Routes ----------
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

// Global error handler (must be after route mounting)
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("API is live ");
});

// Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
