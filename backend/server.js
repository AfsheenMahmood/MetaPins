// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Connect Database
const connectDB = require("./config/db");
connectDB();

const app = express();

// CORS Configuration - UPDATED
app.use(cors({
  origin: [
    "http://localhost:5173",           // Local development
    "http://localhost:5174",           // Backup local port
    "http://localhost:3000",           // Alternative local port
    "https://metapins-production.up.railway.app" // Production domain (if you have one)
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend working ✅" });
});

// Routes
const authRoutes = require("./routes/authRoutes");
const pinRoutes = require("./routes/pinRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/pins", pinRoutes);
app.use("/api/users", userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});