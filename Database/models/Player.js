const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Player",
  new mongoose.Schema(
    {
      firstName: String,
      lastName: String,
      displayName: String,
      dob: String,
      nationality: String,
      height: Number,
      weight: Number,
      position: String,
      jersey: Number,
      teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
      status: { type: String, default: "Active" },
    },
    { timestamps: true },
  ),
);
