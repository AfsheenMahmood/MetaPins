const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    avatarUrl: {
      type: String,
      default: ""
    },
    savedPins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pin"
      }
    ],
    uploaded: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pin"
      }
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pin"
      }
    ],
    moodBoard: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pin"
      }
    ],
    interests: {
      type: Map,
      of: Number,
      default: {}
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    followersCount: {
      type: Number,
      default: 0
    },
    followingCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);