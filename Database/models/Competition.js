const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Competition",
  new mongoose.Schema({
    name: String,
    season: String,
    description: String,
    pointsWin: { type: Number, default: 3 },
    pointsDraw: { type: Number, default: 1 },
    teamIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  }),
);
