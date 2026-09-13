const express = require("express");
const Player = require("../Database/models/Player");
const Team = require("../Database/models/Team");
const Match = require("../Database/models/Match");
const Competition = require("../Database/models/Competition");
const News = require("../Database/models/News");
const Report = require("../Database/models/Report");
const { withId } = require("../Database/ids");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (q.length < 2) return res.json({ players: [], teams: [], matches: [], competitions: [], news: [], reports: [] });
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const [players, teams, matches, competitions, news] = await Promise.all([
      Player.find({ $or: [{ displayName: rx }, { firstName: rx }, { lastName: rx }, { name: rx }, { position: rx }] }).limit(8),
      Team.find({ $or: [{ name: rx }, { shortName: rx }, { location: rx }] }).limit(8),
      Match.find({ $or: [{ stadium: rx }, { referee: rx }] }).limit(8),
      Competition.find({ $or: [{ name: rx }, { season: rx }, { type: rx }] }).limit(8),
      News.find({ status: "Published", $or: [{ title: rx }, { content: rx }, { category: rx }] }).limit(8),
    ]);

    let reports = [];
    if (req.user) {
      reports = await Report.find({ $or: [{ name: rx }, { subject: rx }, { email: rx }] }).limit(8);
    }

    res.json({
      players: players.map(withId),
      teams: teams.map(withId),
      matches: matches.map(withId),
      competitions: competitions.map(withId),
      news: news.map(withId),
      reports: reports.map(withId),
    });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
