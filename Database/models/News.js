const mongoose = require("mongoose");

module.exports = mongoose.model(
  "News",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      title: { type: String, required: true, trim: true },
      image: String,
      content: { type: String, required: true },
      excerpt: String,
      author: { type: String, default: "Sports Desk" },
      category: {
        type: String,
        enum: ["Match", "Team", "Player", "Transfer", "Competition", "Community"],
        default: "Community",
      },
      date: String,
      status: { type: String, enum: ["Draft", "Published", "Unpublished"], default: "Published" },
    },
    { timestamps: true },
  ),
);
