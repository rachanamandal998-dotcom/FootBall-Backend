const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Competition",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      name: { type: String, required: true },
      shortName: String,
      logo: String,
      season: { type: String, default: "2025/26" },
      type: {
        type: String,
        enum: ["League", "Cup", "Youth", "Local Tournament", "Community", "Tournament"],
        default: "League",
      },
      description: String,
      pointsWin: { type: Number, default: 3 },
      pointsDraw: { type: Number, default: 1 },
      pointsLoss: { type: Number, default: 0 },
      teamIds: { type: [String], default: [] },
      status: { type: String, default: "Active" },
    },
    { timestamps: true },
  ),
);
