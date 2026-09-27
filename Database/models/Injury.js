const { defineModel } = require("../repository");

module.exports = defineModel({
  table: "injuries",
  idPrefix: "inj",
  defaults: { status: "Injured", medicalNotes: "" },
  columns: [
    { field: "playerId", column: "player_id", type: "string", fk: true },
    { field: "type", column: "type", type: "string" },
    { field: "date", column: "injury_date", type: "string" },
    { field: "expectedReturn", column: "expected_return", type: "string" },
    { field: "status", column: "status", type: "string" },
    { field: "medicalNotes", column: "medical_notes", type: "string" },
  ],
});
