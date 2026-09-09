const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Team",
  new mongoose.Schema(
    {
      name: String,
      shortName: String,
      location: String,
      stadium: String,
      coach: String,
      founded: Number,
      status: { type: String, default: "Active" },
    },
    { timestamps: true },
  ),
);
