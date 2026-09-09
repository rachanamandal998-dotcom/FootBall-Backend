const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Competition",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      name: String,
      shortName: String,
      season: String,
      type: { type: String, default: "League" },
      description: String,
      pointsWin: { type: Number, default: 3 },
      pointsDraw: { type: Number, default: 1 },
      pointsLoss: { type: Number, default: 0 },
      teamIds: { type: [String], default: [] },
    },
    { timestamps: true, strict: false },
  ),
);
