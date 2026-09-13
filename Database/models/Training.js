const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Training",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      date: { type: String, required: true },
      time: String,
      type: {
        type: String,
        enum: ["Fitness", "Tactical", "Technical", "Recovery", "Match Preparation"],
        default: "Technical",
      },
      duration: Number,
      coach: String,
      teamId: String,
      notes: String,
      attendance: {
        type: [
          new mongoose.Schema(
            {
              playerId: String,
              status: { type: String, enum: ["Present", "Absent", "Excused"], default: "Present" },
            },
            { _id: false },
          ),
        ],
        default: [],
      },
    },
    { timestamps: true },
  ),
);
