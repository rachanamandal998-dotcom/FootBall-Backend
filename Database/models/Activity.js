const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Activity",
  new mongoose.Schema(
    {
      message: String,
      type: String,
      actor: String,
    },
    { timestamps: true },
  ),
);
