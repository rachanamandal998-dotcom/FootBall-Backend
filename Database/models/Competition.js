const { defineModel, query } = require("../repository");

module.exports = defineModel({
  table: "competitions",
  idPrefix: "c",
  defaults: {
    season: "2025/26",
    type: "League",
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    status: "Active",
    teamIds: [],
  },
  columns: [
    { field: "name", column: "name", type: "string" },
    { field: "shortName", column: "short_name", type: "string" },
    { field: "logo", column: "logo", type: "string" },
    { field: "season", column: "season", type: "string" },
    { field: "type", column: "type", type: "string" },
    { field: "description", column: "description", type: "string" },
    { field: "pointsWin", column: "points_win", type: "number" },
    { field: "pointsDraw", column: "points_draw", type: "number" },
    { field: "pointsLoss", column: "points_loss", type: "number" },
    { field: "status", column: "status", type: "string" },
  ],
  children: {
    teamIds: {
      async loadMap(conn) {
        const [rows] = await query(
          conn,
          "SELECT competition_id, team_id FROM competition_teams ORDER BY sort_order ASC, team_id ASC",
        );
        const map = new Map();
        for (const row of rows) {
          const key = String(row.competition_id);
          if (!map.has(key)) map.set(key, []);
          map.get(key).push(row.team_id);
        }
        return map;
      },
      async replace(conn, id, teamIds) {
        await query(conn, "DELETE FROM competition_teams WHERE competition_id = ?", [id]);
        const list = Array.isArray(teamIds) ? teamIds : [];
        for (let index = 0; index < list.length; index += 1) {
          if (!list[index]) continue;
          await query(
            conn,
            "INSERT INTO competition_teams (competition_id, team_id, sort_order) VALUES (?, ?, ?)",
            [id, String(list[index]), index],
          );
        }
      },
    },
  },
});
