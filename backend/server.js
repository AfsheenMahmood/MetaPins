// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Connect Database
const connectDB = require("./config/db");
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend working ✅" });
});

// Routes
const authRoutes = require("./routes/authRoutes");
const pinRoutes = require("./routes/pinRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/pins", pinRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

