const express = require("express");
const News = require("../Database/models/News");
const router = express.Router();

router.get("/", async (req, res) =>
  res.json(await News.find().sort({ date: -1 })),
);
router.post("/", async (req, res) => res.json(await News.create(req.body)));
router.delete("/:id", async (req, res) => {
  await News.findByIdAndDelete(req.params.id);
  res.json({ msg: "deleted" });
});
module.exports = router;
