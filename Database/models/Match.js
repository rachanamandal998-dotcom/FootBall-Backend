const { getPool } = require("../db");
const { query, withTransaction, createQuery, matches, parseJson, toIso } = require("../repository");
const { uid } = require("../ids");

const STATS = [
  ["possessionHome", "possession_home", 50],
  ["possessionAway", "possession_away", 50],
  ["shotsHome", "shots_home", 0],
  ["shotsAway", "shots_away", 0],
  ["shotsOnTargetHome", "shots_on_target_home", 0],
  ["shotsOnTargetAway", "shots_on_target_away", 0],
  ["cornersHome", "corners_home", 0],
  ["cornersAway", "corners_away", 0],
  ["foulsHome", "fouls_home", 0],
  ["foulsAway", "fouls_away", 0],
  ["offsidesHome", "offsides_home", 0],
  ["offsidesAway", "offsides_away", 0],
  ["passAccuracyHome", "pass_accuracy_home", 0],
  ["passAccuracyAway", "pass_accuracy_away", 0],
];

function num(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function fk(value) {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
}

function emptySide(formation = "4-3-3") {
  return { formation, startingXI: [], substitutes: [], positions: {} };
}

function buildStats(row) {
  const stats = {};
  for (const [field, column, fallback] of STATS) stats[field] = num(row[column], fallback);
  return stats;
}

function buildDoc(row, events, lineups, lineupPlayers) {
  const id = String(row.id);
  const sides = { home: emptySide("4-3-3"), away: emptySide("4-3-3") };
  for (const lineup of lineups) {
    if (String(lineup.match_id) !== id) continue;
    const side = lineup.side === "away" ? "away" : "home";
    sides[side] = {
      formation: lineup.formation || "4-3-3",
      startingXI: [],
      substitutes: [],
      positions: parseJson(lineup.positions, {}),
    };
  }
  const players = lineupPlayers
    .filter((item) => String(item.match_id) === id)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  for (const side of ["home", "away"]) {
    sides[side].startingXI = players.filter((item) => item.side === side && item.role === "start").map((item) => item.player_id);
    sides[side].substitutes = players.filter((item) => item.side === side && item.role === "sub").map((item) => item.player_id);
  }
  const matchEvents = events
    .filter((event) => String(event.match_id) === id)
    .sort((a, b) => a.minute - b.minute || a.extra - b.extra || a.sort_order - b.sort_order)
    .map((event) => ({
      id: event.id,
      minute: num(event.minute, 0),
      extra: num(event.extra, 0),
      type: event.type,
      teamId: event.team_id || "",
      playerId: event.player_id || "",
      scorerId: event.scorer_id || "",
      assistId: event.assist_id || "",
      playerOffId: event.player_off_id || "",
      playerOnId: event.player_on_id || "",
      goalType: event.goal_type || (event.type === "goal" ? "Open Play" : ""),
      reason: event.reason || "",
    }));

  return {
    id: row.id,
    _id: row.id,
    compId: row.comp_id,
    season: row.season || "2025/26",
    homeTeamId: row.home_team_id,
    awayTeamId: row.away_team_id,
    date: row.match_date,
    time: row.match_time || "",
    stadium: row.stadium || "",
    stadiumId: row.stadium_id || "",
    referee: row.referee || "",
    assistantReferee1: row.assistant_referee1 || "",
    assistantReferee2: row.assistant_referee2 || "",
    varOfficial: row.var_official || "",
    status: row.status || "Scheduled",
    homeScore: num(row.home_score, 0),
    awayScore: num(row.away_score, 0),
    events: matchEvents,
    lineups: sides,
    stats: buildStats(row),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

async function loadAll(conn) {
  const db = conn || getPool();
  const [matches] = await query(db, "SELECT * FROM matches");
  const [events] = await query(db, "SELECT * FROM match_events");
  const [lineups] = await query(db, "SELECT * FROM match_lineups");
  const [lineupPlayers] = await query(db, "SELECT * FROM lineup_players");
  return matches.map((row) => buildDoc(row, events, lineups, lineupPlayers));
}

async function replaceChildren(conn, id, doc) {
  await query(conn, "DELETE FROM lineup_players WHERE match_id = ?", [id]);
  await query(conn, "DELETE FROM match_lineups WHERE match_id = ?", [id]);
  await query(conn, "DELETE FROM match_events WHERE match_id = ?", [id]);

  const lineups = doc.lineups || {};
  for (const side of ["home", "away"]) {
    const block = lineups[side] || {};
    await query(
      conn,
      "INSERT INTO match_lineups (match_id, side, formation, positions) VALUES (?, ?, ?, ?)",
      [id, side, block.formation || "4-3-3", JSON.stringify(block.positions || {})],
    );
    const starters = Array.isArray(block.startingXI) ? block.startingXI : [];
    const subs = Array.isArray(block.substitutes) ? block.substitutes : [];
    for (let index = 0; index < starters.length; index += 1) {
      if (!starters[index]) continue;
      await query(
        conn,
        "INSERT INTO lineup_players (match_id, side, player_id, role, sort_order) VALUES (?, ?, ?, 'start', ?)",
        [id, side, String(starters[index]), index],
      );
    }
    for (let index = 0; index < subs.length; index += 1) {
      if (!subs[index]) continue;
      await query(
        conn,
        "INSERT INTO lineup_players (match_id, side, player_id, role, sort_order) VALUES (?, ?, ?, 'sub', ?)",
        [id, side, String(subs[index]), index],
      );
    }
  }

  const events = Array.isArray(doc.events) ? doc.events : [];
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index] || {};
    await query(
      conn,
      `INSERT INTO match_events
        (id, match_id, minute, extra, type, team_id, player_id, scorer_id, assist_id, player_off_id, player_on_id, goal_type, reason, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(event.id || uid("e")),
        id,
        num(event.minute, 0),
        num(event.extra, 0),
        event.type,
        fk(event.teamId),
        fk(event.playerId || event.scorerId),
        fk(event.scorerId),
        fk(event.assistId),
        fk(event.playerOffId),
        fk(event.playerOnId),
        event.goalType || (event.type === "goal" ? "Open Play" : null),
        event.reason || null,
        index,
      ],
    );
  }
}

function matchParams(doc) {
  const stats = doc.stats || {};
  return [
    doc.compId,
    doc.season || "2025/26",
    doc.homeTeamId,
    doc.awayTeamId,
    doc.date,
    doc.time || null,
    doc.stadium || null,
    fk(doc.stadiumId),
    doc.referee || null,
    doc.assistantReferee1 || null,
    doc.assistantReferee2 || null,
    doc.varOfficial || null,
    doc.status || "Scheduled",
    num(doc.homeScore, 0),
    num(doc.awayScore, 0),
    ...STATS.map(([field, , fallback]) => num(stats[field], fallback)),
  ];
}

const MATCH_COLUMNS = `
  comp_id, season, home_team_id, away_team_id, match_date, match_time, stadium, stadium_id,
  referee, assistant_referee1, assistant_referee2, var_official, status, home_score, away_score,
  possession_home, possession_away, shots_home, shots_away, shots_on_target_home, shots_on_target_away,
  corners_home, corners_away, fouls_home, fouls_away, offsides_home, offsides_away,
  pass_accuracy_home, pass_accuracy_away
`;

const Match = {
  find(filter = {}) {
    return createQuery(async () => {
      const docs = await loadAll();
      return docs.filter((doc) => matches(doc, filter));
    });
  },
  findOne(filter = {}) {
    return createQuery(async () => {
      const docs = await loadAll();
      return docs.filter((doc) => matches(doc, filter));
    }, { one: true });
  },
  findById(id) {
    return this.findOne({ $or: [{ id }, { _id: id }] });
  },
  async create(input) {
    const id = String(input.id || uid("m"));
    return withTransaction(async (conn) => {
      const now = new Date();
      await query(
        conn,
        `INSERT INTO matches (id, ${MATCH_COLUMNS}, created_at, updated_at) VALUES (?, ${MATCH_COLUMNS.split(",").map(() => "?").join(", ")}, ?, ?)`,
        [id, ...matchParams(input), now, now],
      );
      await replaceChildren(conn, id, input);
      const saved = await loadAll(conn);
      return saved.find((item) => String(item.id) === id) || null;
    });
  },
  async insertMany(docs) {
    const created = [];
    for (const doc of docs || []) created.push(await this.create(doc));
    return created;
  },
  async findOneAndUpdate(filter, update) {
    const existing = await this.findOne(filter);
    if (!existing) return null;
    const next = { ...existing, ...update, id: existing.id };
    if (update.stats) next.stats = { ...existing.stats, ...update.stats };
    if (update.lineups) next.lineups = { ...existing.lineups, ...update.lineups };
    return withTransaction(async (conn) => {
      await query(
        conn,
        `UPDATE matches SET ${MATCH_COLUMNS.split(",").map((column) => `${column.trim()} = ?`).join(", ")}, updated_at = ? WHERE id = ?`,
        [...matchParams(next), new Date(), next.id],
      );
      await replaceChildren(conn, next.id, next);
      const saved = await loadAll(conn);
      return saved.find((item) => String(item.id) === String(next.id)) || null;
    });
  },
  async findOneAndDelete(filter) {
    const existing = await this.findOne(filter);
    if (!existing) return null;
    await query(getPool(), "DELETE FROM matches WHERE id = ?", [existing.id]);
    return existing;
  },
  async deleteMany(filter = {}) {
    if (!filter || Object.keys(filter).length === 0) {
      await query(getPool(), "DELETE FROM matches");
      return { deletedCount: 0 };
    }
    const docs = await this.find(filter);
    for (const doc of docs) await query(getPool(), "DELETE FROM matches WHERE id = ?", [doc.id]);
    return { deletedCount: docs.length };
  },
  async countDocuments(filter = {}) {
    const docs = await this.find(filter);
    return docs.length;
  },
};

module.exports = Match;
