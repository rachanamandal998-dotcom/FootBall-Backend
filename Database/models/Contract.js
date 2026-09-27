const { defineModel } = require("../repository");

module.exports = defineModel({
  table: "contracts",
  idPrefix: "ct",
  defaults: { status: "Active" },
  columns: [
    { field: "playerId", column: "player_id", type: "string", fk: true },
    { field: "teamId", column: "team_id", type: "string", fk: true },
    { field: "start", column: "start_date", type: "string" },
    { field: "end", column: "end_date", type: "string" },
    { field: "status", column: "status", type: "string" },
    { field: "notes", column: "notes", type: "string" },
  ],
});
