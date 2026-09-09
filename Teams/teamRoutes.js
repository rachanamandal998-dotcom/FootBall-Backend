const express = require("express");
const Team = require("../Database/models/Team");
const router = express.Router();

router.get("/", async (req, res) => {
  const teams = await Team.find();
  res.json(teams);
});
router.post("/", async (req, res) => {
  const team = await Team.create(req.body);
  res.json(team);
});
router.put("/:id", async (req, res) => {
  const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(team);
});
router.delete("/:id", async (req, res) => {
  await Team.findByIdAndDelete(req.params.id);
  res.json({ msg: "Team deleted" });
});
module.exports = router;
