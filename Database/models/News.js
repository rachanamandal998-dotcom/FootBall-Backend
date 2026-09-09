const mongoose = require("mongoose");
module.exports = mongoose.model(
  "News",
  new mongoose.Schema(
    {
      title: String,
      content: String,
      category: String,
      author: String,
      date: String,
      status: String,
    },
    { timestamps: true },
  ),
);
