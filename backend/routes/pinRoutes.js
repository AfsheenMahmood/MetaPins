const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const Pin = require("../models/Pin");
const jwt = require("jsonwebtoken");

// Simple auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Upload pin
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);

    const pin = new Pin({
      title: req.body.title,
      category: req.body.category,
      tags: req.body.tags?.split(","),
      imageUrl: result.secure_url,
      user: req.user.id
    });

    await pin.save();
    res.status(201).json(pin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});
// Get all pins (Home feed)
router.get("/", async (req, res) => {
  try {
    const pins = await Pin.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(pins);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pins" });
  }
});
// Get pins by specific user (Profile page)
router.get("/user/:userId", async (req, res) => {
  try {
    const pins = await Pin.find({ user: req.params.userId })
      .sort({ createdAt: -1 });

    res.json(pins);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user pins" });
  }
});
// Save a pin
router.post("/save/:pinId", auth, async (req, res) => {
  try {
    const user = await require("../models/User").findById(req.user.id);

    if (user.savedPins.includes(req.params.pinId)) {
      return res.status(400).json({ message: "Pin already saved" });
    }

    user.savedPins.push(req.params.pinId);
    await user.save();

    res.json({ message: "Pin saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to save pin" });
  }
});
// Get saved pins
router.get("/saved", auth, async (req, res) => {
  try {
    const user = await require("../models/User")
      .findById(req.user.id)
      .populate("savedPins");

    res.json(user.savedPins);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch saved pins" });
  }
});

module.exports = router;

