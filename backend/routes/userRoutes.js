const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Pin = require("../models/Pin");
const Board = require("../models/Board");
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
      .populate("followers", "username name avatarUrl")
      .populate("following", "username name avatarUrl")
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
      followers: (user.followers || []).map(u => typeof u === "object" ? u : { _id: u }),
      following: (user.following || []).map(u => typeof u === "object" ? u : { _id: u }),
      followersCount: user.followersCount || 0,
      followingCount: user.followingCount || 0,
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

    // Analytics: Update user interests based on pin category
    const pin = await Pin.findById(pinId);
    if (pin && pin.category) {
      const currentScore = user.interests.get(pin.category) || 0;
      const points = index > -1 ? -1 : 1;
      user.interests.set(pin.category, Math.max(0, currentScore + points));
      await user.save();
    }

    // Update Pin model likesCount
    await Pin.findByIdAndUpdate(pinId, {
      $inc: { likesCount: index > -1 ? -1 : 1 }
    });

    res.json({ message: "Like toggled", likes: user.likes, interests: user.interests });
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

    // Analytics: Update user interests based on pin category
    const pin = await Pin.findById(pinId);
    if (pin && pin.category) {
      const currentScore = user.interests.get(pin.category) || 0;
      const points = index > -1 ? -1 : 2; // Saving gives more interest points
      user.interests.set(pin.category, Math.max(0, currentScore + points));
      await user.save();
    }

    // Update Pin model savedCount
    await Pin.findByIdAndUpdate(pinId, {
      $inc: { savedCount: index > -1 ? -1 : 1 }
    });

    res.json({ message: "Save toggled", savedPins: user.savedPins, interests: user.interests });
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

// Board Routes
// Create a new board
router.post("/:username/boards", auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    const board = new Board({
      title,
      description,
      user: req.user.id
    });
    await board.save();
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ message: "Failed to create board" });
  }
});

// Get user boards
router.get("/:username/boards", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const boards = await Board.find({ user: user._id }).populate("pins");
    res.json(boards);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch boards" });
  }
});

// Add pin to board
router.post("/:username/boards/:boardId/add/:pinId", auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });

    if (board.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!board.pins.includes(req.params.pinId)) {
      board.pins.push(req.params.pinId);
      await board.save();
    }

    res.json(board);
  } catch (err) {
    res.status(500).json({ message: "Failed to add to board" });
  }
});

// Toggle follow/unfollow
router.post("/:username/follow/:targetUsername", auth, async (req, res) => {
  try {
    console.log(`Follow request: ${req.params.username} -> ${req.params.targetUsername}`);
    const currentUser = await User.findOne({ username: req.params.username });
    const targetUser = await User.findOne({ username: req.params.targetUsername });

    if (!currentUser || !targetUser) {
      console.log(`User not found: currentUser=${!!currentUser}, targetUser=${!!targetUser}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`Comparing: currentUser._id=${currentUser._id} vs req.user.id=${req.user.id}`);
    if (currentUser._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (currentUser._id.toString() === targetUser._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    if (!currentUser.following) currentUser.following = [];
    if (!targetUser.followers) targetUser.followers = [];

    const followingIndex = currentUser.following.findIndex(id => id.toString() === targetUser._id.toString());
    const followersIndex = targetUser.followers.findIndex(id => id.toString() === currentUser._id.toString());

    if (followingIndex > -1) {
      // Unfollow
      currentUser.following.splice(followingIndex, 1);
      if (followersIndex > -1) targetUser.followers.splice(followersIndex, 1);
    } else {
      // Follow
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
    }

    await currentUser.save();
    await targetUser.save();

    // Update counts
    currentUser.followingCount = currentUser.following.length;
    targetUser.followersCount = targetUser.followers.length;

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: followingIndex > -1 ? "Unfollowed" : "Followed",
      following: currentUser.following,
      followersCount: targetUser.followersCount,
      followingCount: currentUser.followingCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle follow" });
  }
});

module.exports = router;