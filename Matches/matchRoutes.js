const Match = require("../Database/models/Match");
const resourceRouter = require("../Database/crudRouter");
const { rowExists } = require("../Database/repository");
const { applyScores, logActivity } = require("../Database/engines/footballEngine");
const { PERMS } = require("../Authentication/roles");
const { uid } = require("../Database/ids");

async function validate(payload) {
  if (!payload.homeTeamId || !payload.awayTeamId) return "Home and away teams are required.";
  if (String(payload.homeTeamId) === String(payload.awayTeamId)) {
    return "Home and away teams cannot be the same.";
  }
  if (!payload.compId) return "Competition is required.";
  if (!(await rowExists("teams", payload.homeTeamId))) return "Home team was not found.";
  if (!(await rowExists("teams", payload.awayTeamId))) return "Away team was not found.";
  if (!(await rowExists("competitions", payload.compId))) return "Competition was not found.";
  if (!payload.date) return "Match date is required.";
  if (payload.events) {
    payload.events = payload.events.map((ev) => ({ ...ev, id: ev.id || uid("e") }));
  }
  applyScores(payload);
  return null;
}

module.exports = resourceRouter(Match, {
  writeRoles: PERMS.matches,
  assignIdPrefix: "m",
  validate,
  afterWrite: async (action, doc) => {
    const label =
      action === "delete"
        ? "Match removed"
        : doc.status === "Finished"
          ? "Match result updated"
          : `Match ${action === "create" ? "created" : "updated"}`;
    await logActivity(label, "match");
  },
});
