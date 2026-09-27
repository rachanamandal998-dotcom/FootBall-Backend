const { defineModel } = require("../repository");

module.exports = defineModel({
  table: "activities",
  autoId: true,
  columns: [
    { field: "message", column: "message", type: "string" },
    { field: "type", column: "type", type: "string" },
    { field: "actor", column: "actor", type: "string" },
  ],
});
