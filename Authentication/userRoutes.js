const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../Database/models/User");
const { protect } = require("./authMiddleware");
const { requireRoles, STAFF_ROLES } = require("./roles");
const { EMAIL_RE } = require("../Database/ids");

const router = express.Router();

async function findUserByParam(id) {
  if (mongoose.isValidObjectId(id)) return User.findById(id).select("+password");
  return User.findOne({ email: id }).select("+password");
}

router.use(protect, requireRoles(["super_admin", "admin"]));

router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map((user) => user.toPublicJSON()));
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const name = String(req.body.name || req.body.displayName || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const role = STAFF_ROLES.includes(req.body.role) ? req.body.role : "manager";

    if (name.length < 2) return res.status(400).json({ msg: "Name is required" });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ msg: "Valid email is required" });
    if (password.length < 8) return res.status(400).json({ msg: "Password must be at least 8 characters" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ msg: "An account with this email already exists" });

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
      displayName: name,
      username: email,
    });
    res.status(201).json(user.toPublicJSON());
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ msg: "An account with this email already exists" });
    }
    res.status(400).json({ msg: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const user = await findUserByParam(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (req.body.name || req.body.displayName) {
      user.name = String(req.body.name || req.body.displayName).trim();
      user.displayName = user.name;
    }
    if (req.body.email) {
      const email = String(req.body.email).trim().toLowerCase();
      if (!EMAIL_RE.test(email)) return res.status(400).json({ msg: "Valid email is required" });
      user.email = email;
      user.username = email;
    }
    if (req.body.role && STAFF_ROLES.includes(req.body.role)) {
      if (["admin", "super_admin"].includes(user.role) && !["admin", "super_admin"].includes(req.body.role)) {
        const admins = await User.countDocuments({ role: { $in: ["admin", "super_admin"] } });
        if (admins <= 1) {
          return res.status(400).json({ msg: "Cannot remove the last super admin" });
        }
      }
      user.role = req.body.role;
    }
    if (req.body.password) {
      if (String(req.body.password).length < 8) {
        return res.status(400).json({ msg: "Password must be at least 8 characters" });
      }
      user.password = await bcrypt.hash(String(req.body.password), 10);
    }

    await user.save();
    res.json(user.toPublicJSON());
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ msg: "An account with this email already exists" });
    }
    res.status(400).json({ msg: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await findUserByParam(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ msg: "You cannot delete your own account while signed in" });
    }
    if (["admin", "super_admin"].includes(user.role)) {
      const admins = await User.countDocuments({ role: { $in: ["admin", "super_admin"] } });
      if (admins <= 1) {
        return res.status(400).json({ msg: "Cannot delete the last super admin" });
      }
    }

    await user.deleteOne();
    res.json({ msg: "deleted" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

module.exports = router;
