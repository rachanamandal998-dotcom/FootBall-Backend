const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Match",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      compId: String,
      season: String,
      homeTeamId: String,
      awayTeamId: String,
      date: String,
      time: String,
      stadium: String,
      referee: String,
      status: { type: String, default: "Scheduled" },
      homeScore: { type: Number, default: 0 },
      awayScore: { type: Number, default: 0 },
      events: { type: Array, default: [] },
      lineups: { type: Object, default: {} },
      stats: { type: Object, default: {} },
    },
    { timestamps: true, strict: false },
  ),
);
