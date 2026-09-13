const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    id: String,
    minute: { type: Number, required: true },
    extra: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ["goal", "assist", "yellow", "red", "sub"],
      required: true,
    },
    teamId: String,
    playerId: String,
    scorerId: String,
    assistId: String,
    playerOffId: String,
    playerOnId: String,
    goalType: {
      type: String,
      enum: ["Open Play", "Penalty", "Free Kick", "Own Goal", ""],
      default: "Open Play",
    },
    reason: String,
  },
  { _id: false },
);

const lineupSideSchema = new mongoose.Schema(
  {
    formation: { type: String, default: "4-3-3" },
    startingXI: { type: [String], default: [] },
    substitutes: { type: [String], default: [] },
    positions: { type: Object, default: {} },
  },
  { _id: false },
);

module.exports = mongoose.model(
  "Match",
  new mongoose.Schema(
    {
      id: { type: String, unique: true, sparse: true },
      compId: { type: String, required: true },
      season: { type: String, default: "2025/26" },
      homeTeamId: { type: String, required: true },
      awayTeamId: { type: String, required: true },
      date: { type: String, required: true },
      time: String,
      stadium: String,
      stadiumId: String,
      referee: String,
      assistantReferee1: String,
      assistantReferee2: String,
      varOfficial: String,
      status: {
        type: String,
        enum: ["Scheduled", "Live", "Half Time", "Finished", "Postponed", "Cancelled", "Abandoned"],
        default: "Scheduled",
      },
      homeScore: { type: Number, default: 0 },
      awayScore: { type: Number, default: 0 },
      events: { type: [eventSchema], default: [] },
      lineups: {
        type: new mongoose.Schema(
          {
            home: { type: lineupSideSchema, default: () => ({}) },
            away: { type: lineupSideSchema, default: () => ({}) },
          },
          { _id: false },
        ),
        default: () => ({ home: {}, away: {} }),
      },
      stats: {
        possessionHome: { type: Number, default: 50 },
        possessionAway: { type: Number, default: 50 },
        shotsHome: { type: Number, default: 0 },
        shotsAway: { type: Number, default: 0 },
        shotsOnTargetHome: { type: Number, default: 0 },
        shotsOnTargetAway: { type: Number, default: 0 },
        cornersHome: { type: Number, default: 0 },
        cornersAway: { type: Number, default: 0 },
        foulsHome: { type: Number, default: 0 },
        foulsAway: { type: Number, default: 0 },
        offsidesHome: { type: Number, default: 0 },
        offsidesAway: { type: Number, default: 0 },
        passAccuracyHome: { type: Number, default: 0 },
        passAccuracyAway: { type: Number, default: 0 },
      },
    },
    { timestamps: true },
  ),
);
