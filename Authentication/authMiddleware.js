const jwt = require("jsonwebtoken");
const User = require("../Database/models/User");

const COOKIE_NAME = "sfc_token";

function getTokenFromRequest(req) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();

  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(COOKIE_NAME.length + 1));
}

exports.protect = async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ msg: "Authentication required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub || payload.id).select("-password");
    if (!user) return res.status(401).json({ msg: "Session is no longer valid" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ msg: "Session expired or invalid. Please log in again." });
  }
};

exports.optionalProtect = async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub || payload.id).select("-password");
    if (user) req.user = user;
  } catch {
    // ignore expired tokens on public routes
  }
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ msg: "Authentication required" });
  if (!["admin", "super_admin", "manager"].includes(req.user.role)) {
    return res.status(403).json({ msg: "Manager access required" });
  }
  next();
};

exports.COOKIE_NAME = COOKIE_NAME;
exports.getTokenFromRequest = getTokenFromRequest;
