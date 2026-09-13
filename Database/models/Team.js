const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Team",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      name: { type: String, required: true, trim: true },
      shortName: { type: String, required: true, trim: true },
      logo: String,
      location: String,
      stadium: String,
      stadiumId: String,
      coach: String,
      manager: String,
      founded: Number,
      contactEmail: String,
      contactPhone: String,
      status: { type: String, default: "Active" },
      colors: { type: [String], default: [] },
      description: String,
    },
    { timestamps: true },
  ),
);
