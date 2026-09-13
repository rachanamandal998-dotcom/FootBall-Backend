const express = require("express");
const Competition = require("../Database/models/Competition");
const Match = require("../Database/models/Match");
const Player = require("../Database/models/Player");
const Team = require("../Database/models/Team");
const { withId, withIds } = require("../Database/ids");
const {
  computeStandings,
  computePlayerStats,
  computeTeamStats,
} = require("../Database/engines/footballEngine");

const router = express.Router();

router.get("/standings", async (req, res) => {
  try {
    const competitions = await Competition.find();
    const matches = withIds(await Match.find());
    const teams = withIds(await Team.find());
    const teamName = (id) => teams.find((t) => t.id === id)?.name || id;
    const out = {};
    for (const c of competitions) {
      const comp = withId(c);
      out[comp.id] = computeStandings(comp, matches).map((row) => ({
        ...row,
        team: teamName(row.teamId),
      }));
    }
    if (req.query.compId && out[req.query.compId]) {
      return res.json(out[req.query.compId]);
    }
    res.json(out);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const [players, matches, teams] = await Promise.all([
      Player.find(),
      Match.find(),
      Team.find(),
    ]);
    const ms = withIds(matches);
    const playerRows = withIds(players).map((p) => ({
      player: p,
      stats: computePlayerStats(p, ms),
    }));
    const teamRows = withIds(teams).map((t) => ({
      team: t,
      stats: computeTeamStats(t.id, ms),
    }));

    const top = (key) =>
      playerRows
        .map((r) => ({ ...r.player, value: r.stats[key], stats: r.stats }))
        .sort((a, b) => b.value - a.value)
        .filter((x) => x.value > 0)
        .slice(0, 8);

    res.json({
      topScorers: top("goals"),
      mostAssists: top("assists"),
      mostAppearances: top("apps"),
      mostMinutes: top("minutes"),
      mostCleanSheets: top("cleanSheets"),
      mostYellow: top("yellow"),
      mostRed: top("red"),
      players: playerRows,
      teams: teamRows,
    });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
