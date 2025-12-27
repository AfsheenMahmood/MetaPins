const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

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

// Get user profile by username
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate("savedPins")
      .populate("uploaded")
      .populate("likes")
      .populate("moodBoard")
      .select("-password"); // Don't send password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      savedPins: (user.savedPins || []).map(p => p?._id || p),
      uploaded: (user.uploaded || []).map(p => p?._id || p),
      likes: (user.likes || []).map(p => p?._id || p),
      moodBoard: (user.moodBoard || []).map(p => p?._id || p),
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Update user profile (avatar, name, etc.)
router.put("/:username", auth, async (req, res) => {
  try {
    // Ensure user can only update their own profile
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }

    // Update allowed fields
    const { name, avatarUrl } = req.body;

    if (name) user.name = name;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Upload avatar
router.post("/:username/avatar", auth, upload.single("image"), async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    user.avatarUrl = result.secure_url;
    await user.save();

    res.json({ message: "Avatar updated", avatarUrl: user.avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload avatar" });
  }
});

// Toggle like on a pin
router.post("/:username/like/:pinId", auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const pinId = req.params.pinId;
    const index = user.likes.findIndex(id => id.toString() === pinId);

    if (index > -1) {
      // Unlike
      user.likes.splice(index, 1);
    } else {
      // Like
      user.likes.push(pinId);
    }

    await user.save();
    res.json({ message: "Like toggled", likes: user.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle like" });
  }
});

// Toggle save on a pin
router.post("/:username/save/:pinId", auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const pinId = req.params.pinId;
    const index = user.savedPins.findIndex(id => id.toString() === pinId);

    if (index > -1) {
      // Unsave
      user.savedPins.splice(index, 1);
    } else {
      // Save
      user.savedPins.push(pinId);
    }

    await user.save();
    res.json({ message: "Save toggled", savedPins: user.savedPins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle save" });
  }
});

// Toggle mood board
router.post("/:username/moodboard/:pinId", auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const pinId = req.params.pinId;
    const index = user.moodBoard.findIndex(id => id.toString() === pinId);

    if (index > -1) {
      // Remove from mood board
      user.moodBoard.splice(index, 1);
    } else {
      // Add to mood board
      user.moodBoard.push(pinId);
    }

    await user.save();
    res.json({ message: "Mood board toggled", moodBoard: user.moodBoard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle mood board" });
  }
});

module.exports = router;