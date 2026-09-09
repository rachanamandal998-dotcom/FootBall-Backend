const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Training",
  new mongoose.Schema(
    {
      date: String,
      duration: Number,
      type: String,
      coach: String,
      teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    },
    { timestamps: true },
  ),
);
