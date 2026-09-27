const { defineModel } = require("../repository");

module.exports = defineModel({
  table: "staff",
  idPrefix: "st",
  defaults: { role: "Coach", nationality: "Nepal" },
  columns: [
    { field: "name", column: "name", type: "string" },
    { field: "photo", column: "photo", type: "string" },
    { field: "role", column: "role", type: "string" },
    { field: "nationality", column: "nationality", type: "string" },
    { field: "email", column: "email", type: "string" },
    { field: "phone", column: "phone", type: "string" },
    { field: "teamId", column: "team_id", type: "string", fk: true },
    { field: "joinDate", column: "join_date", type: "string" },
  ],
});
