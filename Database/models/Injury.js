const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Injury",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      playerId: String,
      type: String,
      date: String,
      expectedReturn: String,
      status: String,
    },
    { timestamps: true, strict: false },
  ),
);
