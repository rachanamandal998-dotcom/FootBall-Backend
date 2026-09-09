const express = require("express");
const Match = require("../Database/models/Match");
const router = express.Router();

router.get("/", async (req, res) => {
  res.json(await Match.find());
});
router.post("/", async (req, res) => {
  res.json(await Match.create(req.body));
});
router.delete("/:id", async (req, res) => {
  await Match.findByIdAndDelete(req.params.id);
  res.json({ msg: "deleted" });
});
module.exports = router;
