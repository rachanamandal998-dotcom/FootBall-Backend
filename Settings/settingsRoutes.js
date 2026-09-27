const express = require("express");
const Setting = require("../Database/models/Setting");
const { protect } = require("../Authentication/authMiddleware");
const { requireRoles, PERMS } = require("../Authentication/roles");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const doc = (await Setting.findOne({ key: "site" })) || (await Setting.create({ key: "site" }));
    res.json(doc);
  } catch (e) {
    if (!e.expose) console.error(e);
    res.status(500).json({ msg: e.expose ? e.message : "Could not load settings." });
  }
});

router.put("/", protect, requireRoles(PERMS.settings), async (req, res) => {
  try {
    const doc = await Setting.findOneAndUpdate(
      { key: "site" },
      { ...req.body, key: "site" },
      { new: true, upsert: true },
    );
    res.json(doc);
  } catch (e) {
    if (!e.expose) console.error(e);
    res.status(400).json({ msg: e.expose ? e.message : "Could not save settings." });
  }
});

module.exports = router;
