const mongoose = require("mongoose");

module.exports = mongoose.model(
  "News",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      title: String,
      content: String,
      category: String,
      author: String,
      date: String,
      status: { type: String, default: "Published" },
    },
    { timestamps: true, strict: false },
  ),
);
