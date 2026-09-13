const express = require("express");
const Setting = require("../Database/models/Setting");
const { protect } = require("../Authentication/authMiddleware");
const { requireRoles, PERMS } = require("../Authentication/roles");

const router = express.Router();

router.get("/", async (_req, res) => {
  const doc = (await Setting.findOne({ key: "site" })) || (await Setting.create({ key: "site" }));
  res.json(doc);
});

router.put("/", protect, requireRoles(PERMS.settings), async (req, res) => {
  const doc = await Setting.findOneAndUpdate(
    { key: "site" },
    { ...req.body, key: "site" },
    { new: true, upsert: true },
  );
  res.json(doc);
});

module.exports = router;
