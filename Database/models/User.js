const mongoose = require("mongoose");

module.exports = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      username: String,
      password: String,
      role: { type: String, default: "admin" },
      email: String,
      displayName: String,
    },
    { timestamps: true, strict: false },
  ),
);
