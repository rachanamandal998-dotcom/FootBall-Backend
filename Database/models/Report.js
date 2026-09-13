const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Report",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: String,
      subject: { type: String, required: true, trim: true },
      message: { type: String, required: true, trim: true },
      category: {
        type: String,
        enum: [
          "General Contact",
          "Match Report",
          "Player Report",
          "Team Report",
          "Website Issue",
          "Correction Request",
          "Community Feedback",
          "Other",
        ],
        default: "General Contact",
      },
      status: {
        type: String,
        enum: ["New", "In Review", "Resolved", "Archived"],
        default: "New",
      },
      managerNotes: { type: String, default: "" },
      reviewedAt: Date,
    },
    { timestamps: true },
  ),
);
