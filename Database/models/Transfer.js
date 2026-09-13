const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Transfer",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      playerId: { type: String, required: true },
      previousTeamId: String,
      newTeamId: String,
      type: {
        type: String,
        enum: ["Permanent", "Loan", "Free Transfer", "Loan Return"],
        default: "Permanent",
      },
      date: String,
      fee: String,
      contractExpiry: String,
    },
    { timestamps: true },
  ),
);
