const Contract = require("../Database/models/Contract");
const resourceRouter = require("../Database/crudRouter");
const { logActivity } = require("../Database/engines/footballEngine");
const { PERMS } = require("../Authentication/roles");

module.exports = resourceRouter(Contract, {
  writeRoles: PERMS.contracts,
  assignIdPrefix: "ct",
  hideListFromPublic: true,
  validate: (payload) => {
    if (!payload.playerId) return "Player is required.";
    if (!payload.start || !payload.end) return "Contract start and end dates are required.";
    if (payload.start > payload.end) return "Contract end must be after the start date.";
    return null;
  },
  afterWrite: async () => logActivity("Contract updated", "contract"),
});
