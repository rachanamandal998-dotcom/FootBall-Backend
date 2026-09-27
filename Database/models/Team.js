const { defineModel } = require("../repository");

module.exports = defineModel({
  table: "teams",
  idPrefix: "t",
  defaults: { status: "Active", colors: [] },
  columns: [
    { field: "name", column: "name", type: "string" },
    { field: "shortName", column: "short_name", type: "string" },
    { field: "logo", column: "logo", type: "string" },
    { field: "location", column: "location", type: "string" },
    { field: "stadium", column: "stadium", type: "string" },
    { field: "stadiumId", column: "stadium_id", type: "string", fk: true },
    { field: "coach", column: "coach", type: "string" },
    { field: "manager", column: "manager", type: "string" },
    { field: "founded", column: "founded", type: "number" },
    { field: "contactEmail", column: "contact_email", type: "string" },
    { field: "contactPhone", column: "contact_phone", type: "string" },
    { field: "status", column: "status", type: "string" },
    { field: "colors", column: "colors", type: "json", fallback: [] },
    { field: "description", column: "description", type: "string" },
  ],
});
