const Injury = require("../Database/models/Injury");
const resourceRouter = require("../Database/crudRouter");
const { rowExists } = require("../Database/repository");
const { logActivity } = require("../Database/engines/footballEngine");
const { PERMS, hasRole } = require("../Authentication/roles");

module.exports = resourceRouter(Injury, {
  writeRoles: PERMS.injuries,
  assignIdPrefix: "inj",
  validate: async (payload) => {
    if (!payload.playerId) return "Player is required.";
    if (!(await rowExists("players", payload.playerId))) return "Player was not found.";
    if (!payload.type) return "Injury type is required.";
    return null;
  },
  sanitizePublic: (obj, req) => {
    if (!hasRole(req.user, PERMS.medicalNotes)) {
      delete obj.medicalNotes;
    }
    return obj;
  },
  afterWrite: async (action, doc) => {
    await logActivity(`Injury record ${action}`, "injury");
  },
});
