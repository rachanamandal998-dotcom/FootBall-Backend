const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Match",
  new mongoose.Schema(
    {
      compId: { type: mongoose.Schema.Types.ObjectId, ref: "Competition" },
      season: String,
      homeTeamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
      awayTeamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
      date: String,
      time: String,
      stadium: String,
      referee: String,
      status: { type: String, default: "Scheduled" },
      homeScore: Number,
      awayScore: Number,
      events: [
        { minute: Number, type: String, team: String, scorerId: String },
      ],
      lineups: Object,
      stats: Object,
    },
    { timestamps: true },
  ),
);
