const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../Database/models/User");
const { COOKIE_NAME } = require("./authMiddleware");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

function validateSignup({ name, email, password }) {
  const errors = [];
  if (!name || String(name).trim().length < 2) {
    errors.push("Name must be at least 2 characters.");
  }
  if (!email || !EMAIL_RE.test(String(email).trim().toLowerCase())) {
    errors.push("Please enter a valid email address.");
  }
  if (!password || String(password).length < 8) {
    errors.push("Password must be at least 8 characters.");
  }
  return errors;
}

exports.signup = async (req, res) => {
  if (!dbReady(res)) return;
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const errors = validateSignup({ name, email, password });
    if (errors.length) return res.status(400).json({ msg: errors[0], errors });

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ msg: "An account with this email already exists" });
    }

    const adminExists = await User.exists({ role: "admin" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: adminExists ? "user" : "admin",
      displayName: name,
      username: email,
    });

    const token = signToken(user);
    setAuthCookie(res, token);
    res.status(201).json({
      token,
      user: user.toPublicJSON(),
      msg: adminExists
        ? "Account created"
        : "Account created. You are the first user, so you have admin access.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ msg: "An account with this email already exists" });
    }
    console.error("Signup error:", error);
    res.status(500).json({ msg: "Unable to create account" });
  }
};

exports.login = async (req, res) => {
  if (!dbReady(res)) return;
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({ token, user: user.toPublicJSON() });
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
