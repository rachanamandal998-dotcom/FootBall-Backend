const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Setting",
  new mongoose.Schema(
    {
      key: { type: String, unique: true, default: "site" },
      clubName: { type: String, default: "Sindhuli Football Clubhouse" },
      tagline: { type: String, default: "Manage. Play. Connect." },
      heroText: { type: String, default: "Your home for football in Sindhuli." },
      about: String,
    },
    { timestamps: true },
  ),
);
