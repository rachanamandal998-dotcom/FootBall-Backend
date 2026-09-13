const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Stadium",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      name: { type: String, required: true },
      location: String,
      capacity: Number,
      image: String,
    },
    { timestamps: true },
  ),
);
