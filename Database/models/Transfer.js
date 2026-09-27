const { defineModel } = require("../repository");

module.exports = defineModel({
  table: "transfers",
  idPrefix: "tf",
  defaults: { type: "Permanent" },
  columns: [
    { field: "playerId", column: "player_id", type: "string", fk: true },
    { field: "previousTeamId", column: "previous_team_id", type: "string", fk: true },
    { field: "newTeamId", column: "new_team_id", type: "string", fk: true },
    { field: "type", column: "type", type: "string" },
    { field: "date", column: "transfer_date", type: "string" },
    { field: "fee", column: "fee", type: "string" },
    { field: "contractExpiry", column: "contract_expiry", type: "string" },
  ],
});
