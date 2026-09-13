const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Staff",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      name: { type: String, required: true },
      photo: String,
      role: {
        type: String,
        enum: [
          "Manager",
          "Coach",
          "Assistant Coach",
          "Goalkeeping Coach",
          "Fitness Coach",
          "Medical Staff",
          "Physiotherapist",
          "Team Administrator",
        ],
        default: "Coach",
      },
      nationality: { type: String, default: "Nepal" },
      email: String,
      phone: String,
      teamId: String,
      joinDate: String,
    },
    { timestamps: true },
  ),
);
