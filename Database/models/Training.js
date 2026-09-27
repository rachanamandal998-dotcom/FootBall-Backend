const { defineModel, query } = require("../repository");

module.exports = defineModel({
  table: "training_sessions",
  idPrefix: "tr",
  defaults: { type: "Technical", attendance: [] },
  columns: [
    { field: "date", column: "session_date", type: "string" },
    { field: "time", column: "session_time", type: "string" },
    { field: "type", column: "type", type: "string" },
    { field: "duration", column: "duration", type: "number" },
    { field: "coach", column: "coach", type: "string" },
    { field: "teamId", column: "team_id", type: "string", fk: true },
    { field: "notes", column: "notes", type: "string" },
  ],
  children: {
    attendance: {
      async loadMap(conn) {
        const [rows] = await query(
          conn,
          "SELECT training_id, player_id, status FROM training_attendance ORDER BY player_id ASC",
        );
        const map = new Map();
        for (const row of rows) {
          const key = String(row.training_id);
          if (!map.has(key)) map.set(key, []);
          map.get(key).push({ playerId: row.player_id, status: row.status || "Present" });
        }
        return map;
      },
      async replace(conn, id, attendance) {
        await query(conn, "DELETE FROM training_attendance WHERE training_id = ?", [id]);
        const list = Array.isArray(attendance) ? attendance : [];
        for (const row of list) {
          if (!row?.playerId) continue;
          await query(
            conn,
            "INSERT INTO training_attendance (training_id, player_id, status) VALUES (?, ?, ?)",
            [id, String(row.playerId), row.status || "Present"],
          );
        }
      },
    },
  },
});
