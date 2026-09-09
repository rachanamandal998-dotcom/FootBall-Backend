const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Injury",
  new mongoose.Schema(
    {
      playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
      type: String,
      date: String,
      expectedReturn: String,
      status: String,
    },
    { timestamps: true },
  ),
);
