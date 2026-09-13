const Match = require("../models/Match");
const Player = require("../models/Player");
const Competition = require("../models/Competition");
const Activity = require("../models/Activity");
const { withId } = require("../ids");

function eventPlayerId(ev) {
  return ev.playerId || ev.scorerId || "";
}

function scoreFromEvents(match) {
  let home = 0;
  let away = 0;
  for (const ev of match.events || []) {
    if (ev.type !== "goal") continue;
    const own = ev.goalType === "Own Goal";
    const forHome = own ? ev.teamId === match.awayTeamId : ev.teamId === match.homeTeamId;
    if (forHome) home += 1;
    else if (ev.teamId === match.awayTeamId || (own && ev.teamId === match.homeTeamId)) away += 1;
    else if (ev.teamId === match.homeTeamId) home += 1;
    else away += 1;
  }
  return { home, away };
}

function applyScores(match) {
  if ((match.events || []).some((e) => e.type === "goal")) {
    const s = scoreFromEvents(match);
    match.homeScore = s.home;
    match.awayScore = s.away;
  }
  return match;
}

function emptyPlayerStats() {
  return {
    apps: 0,
    starts: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    yellow: 0,
    red: 0,
    cleanSheets: 0,
  };
}

function playerInLineup(match, pid, side) {
  const lu = match.lineups?.[side] || {};
  const xi = lu.startingXI || [];
  const subs = lu.substitutes || [];
  return { start: xi.includes(pid), bench: subs.includes(pid), any: xi.includes(pid) || subs.includes(pid) };
}

function computePlayerStats(player, matches) {
  const s = emptyPlayerStats();
  const pid = player.id || String(player._id);
  const isKeeper = String(player.position || "").toLowerCase().includes("goal");

  for (const m of matches) {
    if (!["Finished", "Live", "Half Time", "Abandoned"].includes(m.status)) continue;
    const homeLu = playerInLineup(m, pid, "home");
    const awayLu = playerInLineup(m, pid, "away");
    const onTeam = m.homeTeamId === player.teamId || m.awayTeamId === player.teamId;
    const played = homeLu.any || awayLu.any || (onTeam && !(m.lineups?.home?.startingXI || []).length);
    if (!played && !homeLu.any && !awayLu.any) {
      const involved = (m.events || []).some(
        (ev) => eventPlayerId(ev) === pid || ev.assistId === pid || ev.playerOffId === pid || ev.playerOnId === pid,
      );
      if (!involved) continue;
    }

    const started = homeLu.start || awayLu.start || (!(m.lineups?.home?.startingXI || []).length && onTeam);
    const cameOn = (m.events || []).some((ev) => ev.type === "sub" && ev.playerOnId === pid);
    const wentOff = (m.events || []).some((ev) => ev.type === "sub" && ev.playerOffId === pid);
    if (started || cameOn || played) {
      s.apps += 1;
      if (started) s.starts += 1;
      let mins = started ? 90 : 0;
      if (cameOn) {
        const ev = (m.events || []).find((e) => e.type === "sub" && e.playerOnId === pid);
        mins = Math.max(0, 90 - (ev?.minute || 0));
      }
      if (wentOff) {
        const ev = (m.events || []).find((e) => e.type === "sub" && e.playerOffId === pid);
        mins = Math.min(mins || 90, ev?.minute || 90);
      }
      s.minutes += mins || (started ? 90 : 20);
    }

    for (const ev of m.events || []) {
      if (ev.type === "goal" && ev.goalType !== "Own Goal" && eventPlayerId(ev) === pid) s.goals += 1;
      if (ev.assistId === pid || (ev.type === "assist" && eventPlayerId(ev) === pid)) s.assists += 1;
      if (ev.type === "yellow" && eventPlayerId(ev) === pid) s.yellow += 1;
      if (ev.type === "red" && eventPlayerId(ev) === pid) s.red += 1;
    }

    if (isKeeper && m.status === "Finished" && started) {
      const conceded = m.homeTeamId === player.teamId ? m.awayScore : m.homeScore;
      if (Number(conceded) === 0) s.cleanSheets += 1;
    }
  }
  return s;
}

function computeTeamStats(teamId, matches) {
  const s = { played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0, cleanSheets: 0 };
  for (const m of matches) {
    if (m.status !== "Finished") continue;
    if (m.homeTeamId !== teamId && m.awayTeamId !== teamId) continue;
    const home = m.homeTeamId === teamId;
    const gf = home ? m.homeScore : m.awayScore;
    const ga = home ? m.awayScore : m.homeScore;
    s.played += 1;
    s.gf += gf;
    s.ga += ga;
    if (gf > ga) s.won += 1;
    else if (gf < ga) s.lost += 1;
    else s.draw += 1;
    if (ga === 0) s.cleanSheets += 1;
  }
  s.gd = s.gf - s.ga;
  s.pts = s.won * 3 + s.draw;
  return s;
}

function computeStandings(competition, matches) {
  const win = competition.pointsWin ?? 3;
  const draw = competition.pointsDraw ?? 1;
  const loss = competition.pointsLoss ?? 0;
  const rows = {};
  (competition.teamIds || []).forEach((tid) => {
    rows[tid] = {
      teamId: tid,
      played: 0,
      won: 0,
      draw: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      pts: 0,
    };
  });

  const seen = new Set();
  for (const m of matches) {
    if (m.status !== "Finished") continue;
    if (String(m.compId) !== String(competition.id || competition._id)) continue;
    const key = m.id || String(m._id);
    if (seen.has(key)) continue;
    seen.add(key);
    const h = rows[m.homeTeamId];
    const a = rows[m.awayTeamId];
    if (!h || !a) continue;
    h.played += 1;
    a.played += 1;
    h.gf += m.homeScore;
    h.ga += m.awayScore;
    a.gf += m.awayScore;
    a.ga += m.homeScore;
    if (m.homeScore > m.awayScore) {
      h.won += 1;
      a.lost += 1;
      h.pts += win;
      a.pts += loss;
    } else if (m.homeScore < m.awayScore) {
      a.won += 1;
      h.lost += 1;
      a.pts += win;
      h.pts += loss;
    } else {
      h.draw += 1;
      a.draw += 1;
      h.pts += draw;
      a.pts += draw;
    }
  }

  return Object.values(rows)
    .map((r, i) => ({ ...r, gd: r.gf - r.ga }))
    .sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf)
    .map((r, i) => ({ ...r, position: i + 1 }));
}

async function logActivity(message, type = "update", actor = "Manager") {
  try {
    await Activity.create({ message, type, actor });
  } catch {
    // ignore logging failures
  }
}

async function standingsFor(compId) {
  const competition = await Competition.findOne({
    $or: [{ id: String(compId) }, ...(require("mongoose").isValidObjectId(compId) ? [{ _id: compId }] : [])],
  });
  if (!competition) return [];
  const matches = await Match.find({ compId: competition.id || String(competition._id) });
  return computeStandings(withId(competition), matches.map(withId));
}

async function allPlayerStats() {
  const [players, matches] = await Promise.all([Player.find(), Match.find()]);
  return players.map((p) => {
    const player = withId(p);
    return { player, stats: computePlayerStats(player, matches.map(withId)) };
  });
}

module.exports = {
  applyScores,
  scoreFromEvents,
  computePlayerStats,
  computeTeamStats,
  computeStandings,
  logActivity,
  standingsFor,
  allPlayerStats,
  emptyPlayerStats,
};
