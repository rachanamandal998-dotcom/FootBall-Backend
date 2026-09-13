const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../Database/models/User");
const { COOKIE_NAME } = require("./authMiddleware");
const { STAFF_ROLES } = require("./roles");
const { EMAIL_RE } = require("../Database/ids");

const TOKEN_DAYS = 7;

function dbReady(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      msg: "Database is not connected. Start MongoDB and try again.",
    });
    return false;
  }
  return true;
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

function signToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || `${TOKEN_DAYS}d` },
  );
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: 0 });
}

exports.login = async (req, res) => {
  if (!dbReady(res)) return;
  try {
    const identifier = String(req.body.email || req.body.username || req.body.managerId || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    if (!identifier || !password) {
      return res.status(400).json({ msg: "Manager ID / email and password are required." });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password");

    if (!user) {
      return res.status(401).json({ msg: "Invalid credentials." });
    }

    if (!STAFF_ROLES.includes(user.role) || user.role === "user") {
      return res.status(403).json({ msg: "This account cannot access the manager dashboard." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ msg: "Invalid credentials." });
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Unable to log in" });
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
};

exports.logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ msg: "Logged out" });
};

exports.optionalAuth = async (req, res, next) => {
  next();
};
