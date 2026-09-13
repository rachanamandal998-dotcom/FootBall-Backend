const STAFF_ROLES = ["super_admin", "admin", "manager", "coach", "medical", "staff"];

const PERMS = {
  dashboard: ["super_admin", "admin", "manager", "coach", "medical", "staff"],
  players: ["super_admin", "admin", "manager"],
  teams: ["super_admin", "admin", "manager"],
  matches: ["super_admin", "admin", "manager"],
  lineups: ["super_admin", "admin", "manager", "coach"],
  events: ["super_admin", "admin", "manager"],
  competitions: ["super_admin", "admin", "manager"],
  standings: ["super_admin", "admin", "manager"],
  news: ["super_admin", "admin", "manager"],
  reports: ["super_admin", "admin", "manager"],
  injuries: ["super_admin", "admin", "manager", "medical"],
  medicalNotes: ["super_admin", "admin", "manager", "medical"],
  training: ["super_admin", "admin", "manager", "coach"],
  transfers: ["super_admin", "admin", "manager"],
  contracts: ["super_admin", "admin", "manager"],
  staff: ["super_admin", "admin", "manager"],
  statistics: ["super_admin", "admin", "manager", "coach"],
  settings: ["super_admin", "admin", "manager"],
  users: ["super_admin", "admin"],
};

function normalizeRole(role) {
  if (role === "admin") return "super_admin";
  return role || "staff";
}

function hasRole(user, allowed = []) {
  if (!user) return false;
  const role = user.role;
  if (role === "super_admin" || role === "admin") return true;
  return allowed.includes(role);
}

function requireRoles(allowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: "Authentication required" });
    if (!hasRole(req.user, allowed)) {
      return res.status(403).json({ msg: "You do not have permission for this action." });
    }
    next();
  };
}

module.exports = {
  STAFF_ROLES,
  PERMS,
  normalizeRole,
  hasRole,
  requireRoles,
};
