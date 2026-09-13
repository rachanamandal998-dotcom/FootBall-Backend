const Stadium = require("../Database/models/Stadium");
const resourceRouter = require("../Database/crudRouter");
const { PERMS } = require("../Authentication/roles");

module.exports = resourceRouter(Stadium, {
  writeRoles: PERMS.teams,
  assignIdPrefix: "sd",
});
