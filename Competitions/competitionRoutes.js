const express = require("express");
const Competition = require("../Database/models/Competition");
const router = express.Router();

router.get("/", async (req, res) => res.json(await Competition.find()));
router.post("/", async (req, res) =>
  res.json(await Competition.create(req.body)),
);
router.delete("/:id", async (req, res) => {
  await Competition.findByIdAndDelete(req.params.id);
  res.json({ msg: "deleted" });
});
module.exports = router;
