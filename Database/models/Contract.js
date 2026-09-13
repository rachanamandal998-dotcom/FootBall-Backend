const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Contract",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      playerId: { type: String, required: true },
      teamId: String,
      start: { type: String, required: true },
      end: { type: String, required: true },
      status: {
        type: String,
        enum: ["Active", "Expiring", "Expired", "Terminated"],
        default: "Active",
      },
      notes: String,
    },
    { timestamps: true },
  ),
);
