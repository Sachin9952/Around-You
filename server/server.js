const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: ["http://localhost:5173", "https://your-frontend.vercel.app"],
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
