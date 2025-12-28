const mongoose = require("mongoose");

const pinSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    imageUrl: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: ""
    },
    tags: {
      type: [String],
      default: []
    },
    color: {
      type: String,
      default: ""
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    likesCount: {
      type: Number,
      default: 0
    },
    savedCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pin", pinSchema);