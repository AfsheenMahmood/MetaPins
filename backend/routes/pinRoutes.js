const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const Pin = require("../models/Pin");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Board = require("../models/Board");
const { calculateSimilarityScore } = require("../utils/analytics");
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
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Create pin
    const pin = new Pin({
      title: req.body.title,
      description: req.body.description || "",
      category: req.body.category || "",
      tags: req.body.tags ? req.body.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      color: req.body.color || "",
      imageUrl: result.secure_url,
      user: req.user.id
    });

    await pin.save();

    // Add pin to user's uploaded array
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { uploaded: pin._id } }
    );

    // Populate user info before sending response
    await pin.populate("user", "username name email");

    res.status(201).json(pin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    let pins = await Pin.find()
      .populate("user", "username name email avatarUrl")
      .sort({ createdAt: -1 });

    if (userId) {
      const user = await User.findById(userId);
      if (user && user.interests && user.interests.size > 0) {
        // Rank pins based on user interests
        pins = pins.sort((a, b) => {
          const scoreA = user.interests.get(a.category) || 0;
          const scoreB = user.interests.get(b.category) || 0;
          if (scoreA !== scoreB) return scoreB - scoreA;
          return 0; // Maintain date sort for equal interest
        });
      }
    }

    res.json(pins);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pins" });
  }
});

// Get pins by specific user (Profile page)
router.get("/user/:userId", async (req, res) => {
  try {
    const pins = await Pin.find({ user: req.params.userId })
      .populate("user", "username name email avatarUrl")
      .sort({ createdAt: -1 });

    res.json(pins);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user pins" });
  }
});

// Save a pin (deprecated - use userRoutes instead)
router.post("/save/:pinId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

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

// Get saved pins (deprecated - use userRoutes instead)
router.get("/saved", auth, async (req, res) => {
  try {
    const user = await User
      .findById(req.user.id)
      .populate("savedPins");

    res.json(user.savedPins);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch saved pins" });
  }
});

// Post a comment
router.post("/:pinId/comments", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const comment = new Comment({
      pin: req.params.pinId,
      user: req.user.id,
      text
    });

    await comment.save();

    // Populate user info
    await comment.populate("user", "username avatarUrl");

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to post comment" });
  }
});

// Get comments for a pin
router.get("/:pinId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ pin: req.params.pinId })
      .populate("user", "username avatarUrl")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// Advanced Analytics: Get similar pins
router.get("/:pinId/similar", async (req, res) => {
  try {
    const targetPin = await Pin.findById(req.params.pinId).populate("user", "username name email avatarUrl");
    if (!targetPin) return res.status(404).json({ message: "Pin not found" });

    // Fetch all pins to perform analytics/ranking
    const allPins = await Pin.find().populate("user", "username name email avatarUrl");

    const results = calculateSimilarityScore(targetPin, allPins);

    // Return the top 10 pins
    res.json(results.slice(0, 10).map(r => r.pin));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Analytics search failed" });
  }
});

// Delete a pin
router.delete("/:pinId", auth, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.pinId);
    if (!pin) return res.status(404).json({ message: "Pin not found" });

    // Check ownership
    if (pin.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this pin" });
    }

    // 1. Delete associated comments
    await Comment.deleteMany({ pin: pin._id });

    // 2. Remove pin from creator's uploaded list
    await User.findByIdAndUpdate(pin.user, {
      $pull: { uploaded: pin._id }
    });

    // 3. Remove pin from all boards
    await Board.updateMany(
      { pins: pin._id },
      { $pull: { pins: pin._id } }
    );

    // 4. Remove pin from all users' savedPins and moodBoards
    await User.updateMany(
      { $or: [{ savedPins: pin._id }, { moodBoard: pin._id }] },
      { $pull: { savedPins: pin._id, moodBoard: pin._id } }
    );

    // 5. Delete from Cloudinary
    try {
      const urlParts = pin.imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const publicId = fileName.split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    } catch (cloudinaryErr) {
      console.warn("Failed to delete from Cloudinary:", cloudinaryErr.message);
    }

    // 6. Delete from MongoDB
    await Pin.findByIdAndDelete(req.params.pinId);

    res.json({ message: "Pin deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete pin" });
  }
});

module.exports = router;