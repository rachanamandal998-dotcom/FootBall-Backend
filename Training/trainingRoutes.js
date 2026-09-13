const Training = require("../Database/models/Training");
const resourceRouter = require("../Database/crudRouter");
const { logActivity } = require("../Database/engines/footballEngine");
const { PERMS } = require("../Authentication/roles");

module.exports = resourceRouter(Training, {
  writeRoles: PERMS.training,
  assignIdPrefix: "tr",
  hideListFromPublic: true,
  validate: (payload) => {
    if (!payload.date) return "Training date is required.";
    if (!payload.type) return "Training type is required.";
    return null;
  },
  afterWrite: async () => logActivity("Training session updated", "training"),
});
