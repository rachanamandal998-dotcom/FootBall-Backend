const express = require("express");
const mongoose = require("mongoose");

function filterById(id) {
  const clauses = [{ id: String(id) }];
  if (mongoose.isValidObjectId(id)) clauses.push({ _id: id });
  return { $or: clauses };
}

function crudRouter(Model) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      res.json(await Model.find());
    } catch (e) {
      res.status(500).json({ msg: e.message });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const doc = await Model.findOne(filterById(req.params.id));
      if (!doc) return res.status(404).json({ msg: "Not found" });
      res.json(doc);
    } catch (e) {
      res.status(500).json({ msg: e.message });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const doc = await Model.create(req.body);
      res.status(201).json(doc);
    } catch (e) {
      res.status(400).json({ msg: e.message });
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      const doc = await Model.findOneAndUpdate(filterById(req.params.id), req.body, {
        new: true,
        runValidators: true,
      });
      if (!doc) return res.status(404).json({ msg: "Not found" });
      res.json(doc);
    } catch (e) {
      res.status(400).json({ msg: e.message });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const doc = await Model.findOneAndDelete(filterById(req.params.id));
      if (!doc) return res.status(404).json({ msg: "Not found" });
      res.json({ msg: "deleted" });
    } catch (e) {
      res.status(400).json({ msg: e.message });
    }
  });

  return router;
}

module.exports = crudRouter;
