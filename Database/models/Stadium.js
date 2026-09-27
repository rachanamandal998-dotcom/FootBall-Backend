const { defineModel } = require("../repository");

module.exports = defineModel({
  table: "stadiums",
  idPrefix: "sd",
  columns: [
    { field: "name", column: "name", type: "string" },
    { field: "location", column: "location", type: "string" },
    { field: "capacity", column: "capacity", type: "number" },
    { field: "image", column: "image", type: "string" },
  ],
});
