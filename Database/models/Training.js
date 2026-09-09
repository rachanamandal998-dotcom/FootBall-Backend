const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Training",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      date: String,
      duration: Number,
      type: String,
      coach: String,
      teamId: String,
      notes: String,
    },
    { timestamps: true, strict: false },
  ),
);
