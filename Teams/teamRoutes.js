const Team = require("../Database/models/Team");
const resourceRouter = require("../Database/crudRouter");
const { logActivity } = require("../Database/engines/footballEngine");
const { PERMS } = require("../Authentication/roles");

function validate(payload) {
  if (!payload.name || String(payload.name).trim().length < 2) return "Team name is required.";
  if (!payload.shortName) return "Short name is required.";
  return null;
}

module.exports = resourceRouter(Team, {
  writeRoles: PERMS.teams,
  assignIdPrefix: "t",
  validate,
  afterWrite: async (action, doc) => {
    await logActivity(`Team ${action === "create" ? "added" : action === "delete" ? "removed" : "updated"}: ${doc.name}`, "team");
  },
});
