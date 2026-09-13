const Transfer = require("../Database/models/Transfer");
const Player = require("../Database/models/Player");
const resourceRouter = require("../Database/crudRouter");
const { logActivity } = require("../Database/engines/footballEngine");
const { PERMS } = require("../Authentication/roles");
const { filterById } = require("../Database/ids");

module.exports = resourceRouter(Transfer, {
  writeRoles: PERMS.transfers,
  assignIdPrefix: "tf",
  hideListFromPublic: false,
  validate: (payload) => {
    if (!payload.playerId) return "Player is required.";
    if (!payload.newTeamId) return "New team is required.";
    if (!payload.date) return "Transfer date is required.";
    if (payload.previousTeamId && payload.previousTeamId === payload.newTeamId && payload.type !== "Loan Return") {
      return "Previous team and new team cannot be the same.";
    }
    return null;
  },
  afterWrite: async (action, doc) => {
    if (action !== "delete" && doc.newTeamId) {
      await Player.findOneAndUpdate(filterById(doc.playerId), { teamId: doc.newTeamId });
    }
    await logActivity("Transfer recorded", "transfer");
  },
});
