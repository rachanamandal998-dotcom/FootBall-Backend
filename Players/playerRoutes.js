const Player = require("../Database/models/Player");
const resourceRouter = require("../Database/crudRouter");
const { logActivity } = require("../Database/engines/footballEngine");
const { PERMS } = require("../Authentication/roles");

function validate(payload) {
  if (!payload.firstName || String(payload.firstName).trim().length < 2) {
    return "Full name is required.";
  }
  if (!payload.teamId) return "Player must belong to a team.";
  if (!payload.position) return "Position is required.";
  if (payload.dob) {
    const d = new Date(payload.dob);
    if (Number.isNaN(d.getTime())) return "Please enter a valid date of birth.";
    if (d > new Date()) return "Date of birth cannot be in the future.";
  }
  if (payload.jersey !== undefined && payload.jersey !== "" && payload.jersey !== null) {
    const n = Number(payload.jersey);
    if (!Number.isInteger(n) || n < 1 || n > 99) return "Jersey number must be between 1 and 99.";
  }
  if (payload.contractStart && payload.contractEnd && payload.contractStart > payload.contractEnd) {
    return "Contract end must be after contract start.";
  }
  const full = `${payload.firstName || ""} ${payload.lastName || ""}`.trim();
  payload.displayName = payload.displayName || full;
  payload.name = full;
  return null;
}

module.exports = resourceRouter(Player, {
  writeRoles: PERMS.players,
  assignIdPrefix: "p",
  validate,
  afterWrite: async (action, doc) => {
    await logActivity(
      action === "delete" ? `Player removed: ${doc.displayName || doc.firstName}` : `Player ${action === "create" ? "added" : "updated"}: ${doc.displayName || doc.firstName}`,
      "player",
    );
  },
});
