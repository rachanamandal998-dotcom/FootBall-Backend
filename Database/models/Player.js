const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Player",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      photo: String,
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, default: "", trim: true },
      displayName: String,
      name: String,
      dob: String,
      nationality: { type: String, default: "Nepal" },
      countryOfBirth: { type: String, default: "Nepal" },
      height: Number,
      weight: Number,
      preferredFoot: { type: String, enum: ["Right", "Left", "Both", ""], default: "Right" },
      position: { type: String, required: true },
      secondaryPosition: String,
      jersey: { type: Number, min: 1, max: 99 },
      teamId: { type: String, required: true },
      squad: { type: String, default: "First Team" },
      status: {
        type: String,
        enum: ["Active", "Injured", "Suspended", "Unavailable", "On Loan", "Retired", "Fit"],
        default: "Active",
      },
      dateJoined: String,
      contractStart: String,
      contractEnd: String,
      contractStatus: { type: String, default: "Active" },
    },
    { timestamps: true },
  ),
);
