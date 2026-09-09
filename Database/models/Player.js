const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Player",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      firstName: String,
      lastName: String,
      displayName: String,
      name: String,
      dob: String,
      nationality: String,
      height: Number,
      weight: Number,
      position: String,
      jersey: Number,
      teamId: String,
      status: { type: String, default: "Fit" },
      contractEnd: String,
    },
    { timestamps: true, strict: false },
  ),
);
