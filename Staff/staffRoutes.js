const Staff = require("../Database/models/Staff");
const resourceRouter = require("../Database/crudRouter");
const { PERMS } = require("../Authentication/roles");

module.exports = resourceRouter(Staff, {
  writeRoles: PERMS.staff,
  assignIdPrefix: "st",
  sanitizePublic: (obj, req) => {
    if (req.user) return obj;
    const copy = { ...obj };
    delete copy.email;
    delete copy.phone;
    return copy;
  },
  validate: (payload) => {
    if (!payload.name) return "Staff name is required.";
    if (!payload.role) return "Staff role is required.";
    return null;
  },
});
