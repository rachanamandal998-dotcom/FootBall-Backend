const express = require("express");
const Player = require("../Database/models/Player");
const Team = require("../Database/models/Team");
const Match = require("../Database/models/Match");
const Competition = require("../Database/models/Competition");
const Injury = require("../Database/models/Injury");
const Report = require("../Database/models/Report");
const Activity = require("../Database/models/Activity");
const Contract = require("../Database/models/Contract");
const { protect } = require("../Authentication/authMiddleware");
const { requireRoles, PERMS } = require("../Authentication/roles");
const { withIds } = require("../Database/ids");

const router = express.Router();
router.use(protect, requireRoles(PERMS.dashboard));

router.get("/", async (req, res) => {
  try {
    const [players, teams, matches, competitions, injuries, reports, activity, contracts] = await Promise.all([
      Player.find(),
      Team.find(),
      Match.find(),
      Competition.find(),
      Injury.find(),
      Report.find(),
      Activity.find().sort({ createdAt: -1 }).limit(12),
      Contract.find(),
    ]);

    const ps = withIds(players);
    const ms = withIds(matches);
    const upcoming = ms.filter((m) => ["Scheduled", "Live", "Half Time"].includes(m.status));
    const finished = ms.filter((m) => m.status === "Finished");
    const injured = withIds(injuries).filter((i) => ["Injured", "Recovering"].includes(i.status));
    const newReports = withIds(reports).filter((r) => r.status === "New");
    const soon = new Date();
    soon.setDate(soon.getDate() + 45);
    const expiring = [
      ...ps.filter((p) => p.contractEnd && new Date(p.contractEnd) <= soon && new Date(p.contractEnd) >= new Date()),
      ...withIds(contracts).filter((c) => c.end && new Date(c.end) <= soon && new Date(c.end) >= new Date() && c.status !== "Expired"),
    ];
    const suspended = ps.filter((p) => p.status === "Suspended");

    const nextMatch = upcoming
      .slice()
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))[0] || null;

    const alerts = [];
    if (injured.length) alerts.push(`${injured.length} player${injured.length === 1 ? "" : "s"} injured`);
    if (expiring.length) alerts.push(`${expiring.length} contract${expiring.length === 1 ? "" : "s"} expiring soon`);
    if (suspended.length) alerts.push(`${suspended.length} player${suspended.length === 1 ? "" : "s"} suspended`);
    if (newReports.length) alerts.push(`${newReports.length} new report${newReports.length === 1 ? "" : "s"}`);

    res.json({
      totals: {
        players: ps.length,
        teams: teams.length,
        upcoming: upcoming.length,
        completed: finished.length,
        injured: injured.length,
        competitions: competitions.length,
        newReports: newReports.length,
      },
      nextMatch,
      recentResults: finished.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 5),
      alerts,
      activity: withIds(activity),
      newReportCount: newReports.length,
    });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
