const express = require("express");
const Team = require("../Database/models/Team");
const Player = require("../Database/models/Player");
const Match = require("../Database/models/Match");
const router = express.Router();

router.get("/", async (req, res) => {
  const totalTeams = await Team.countDocuments();
  const totalPlayers = await Player.countDocuments();
  const totalMatches = await Match.countDocuments();
  res.json({ totalTeams, totalPlayers, totalMatches });
});
module.exports = router;
