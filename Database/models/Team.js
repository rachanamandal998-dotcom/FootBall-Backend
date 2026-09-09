const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Team",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      name: String,
      shortName: String,
      location: String,
      stadium: String,
      coach: String,
      manager: String,
      founded: Number,
      status: { type: String, default: "Active" },
    },
    { timestamps: true, strict: false },
  ),
);
