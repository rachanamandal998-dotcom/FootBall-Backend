const express = require("express");
const Player = require("../Database/models/Player");
const router = express.Router();

router.get("/", async (req, res) => {
  res.json(await Player.find().populate("teamId"));
});
router.post("/", async (req, res) => {
  res.json(await Player.create(req.body));
});
router.delete("/:id", async (req, res) => {
  await Player.findByIdAndDelete(req.params.id);
  res.json({ msg: "deleted" });
});
module.exports = router;
