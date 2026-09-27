const { defineModel } = require("../repository");

module.exports = defineModel({
  table: "reports",
  autoId: true,
  defaults: {
    category: "General Contact",
    status: "New",
    managerNotes: "",
    phone: null,
  },
  columns: [
    { field: "name", column: "name", type: "string" },
    { field: "email", column: "email", type: "string" },
    { field: "phone", column: "phone", type: "string", emptyNull: true },
    { field: "subject", column: "subject", type: "string" },
    { field: "message", column: "message", type: "string" },
    { field: "category", column: "category", type: "string" },
    { field: "status", column: "status", type: "string" },
    { field: "managerNotes", column: "manager_notes", type: "string" },
    { field: "reviewedAt", column: "reviewed_at", type: "date" },
  ],
});
