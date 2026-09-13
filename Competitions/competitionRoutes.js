const Competition = require("../Database/models/Competition");
const resourceRouter = require("../Database/crudRouter");
const { logActivity } = require("../Database/engines/footballEngine");
const { PERMS } = require("../Authentication/roles");

function validate(payload) {
  if (!payload.name) return "Competition name is required.";
  if (payload.pointsWin == null) payload.pointsWin = 3;
  if (payload.pointsDraw == null) payload.pointsDraw = 1;
  if (payload.pointsLoss == null) payload.pointsLoss = 0;
  return null;
}

module.exports = resourceRouter(Competition, {
  writeRoles: PERMS.competitions,
  assignIdPrefix: "c",
  validate,
  afterWrite: async (action, doc) => {
    await logActivity(`Competition ${action}: ${doc.name}`, "competition");
  },
});
