const express = require("express");
const { protect } = require("../Authentication/authMiddleware");
const { requireRoles } = require("../Authentication/roles");
const { filterById, withId, withIds, uid } = require("./ids");

function sendError(res, error, fallbackStatus) {
  if (!error.expose) console.error(error);
  const status = error.status || fallbackStatus;
  res.status(status).json({ msg: error.expose ? error.message : "Could not complete that request." });
}

function resourceRouter(Model, options = {}) {
  const {
    writeRoles = ["super_admin", "admin", "manager"],
    publicListQuery = () => ({}),
    sanitizePublic,
    hideListFromPublic = false,
    allowPublicCreate = false,
    validate,
    afterWrite,
    assignIdPrefix = "",
  } = options;

  const router = express.Router();
  const writeGuard = [protect, requireRoles(writeRoles)];

  function present(doc, req) {
    if (!doc) return doc;
    let obj = withId(doc);
    if (sanitizePublic) obj = sanitizePublic(obj, req);
    return obj;
  }

  router.get("/", async (req, res) => {
    try {
      if (hideListFromPublic && !req.user) {
        return res.status(401).json({ msg: "Authentication required" });
      }
      const q = publicListQuery(req) || {};
      const docs = await Model.find(q).sort({ createdAt: -1 });
      res.json(docs.map((d) => present(d, req)));
    } catch (e) {
      sendError(res, e, 500);
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      if (hideListFromPublic && !req.user) {
        return res.status(401).json({ msg: "Authentication required" });
      }
      const doc = await Model.findOne(filterById(req.params.id));
      if (!doc) return res.status(404).json({ msg: "Not found" });
      res.json(present(doc, req));
    } catch (e) {
      sendError(res, e, 500);
    }
  });

  const createHandlers = allowPublicCreate ? [] : writeGuard;
  router.post("/", ...createHandlers, async (req, res) => {
    try {
      const payload = { ...req.body };
      if (!payload.id && assignIdPrefix) payload.id = uid(assignIdPrefix);
      if (validate) {
        const err = await validate(payload, "create");
        if (err) return res.status(400).json({ msg: err });
      }
      const doc = await Model.create(payload);
      if (afterWrite) await afterWrite("create", doc, req);
      res.status(201).json(withId(doc));
    } catch (e) {
      sendError(res, e, 400);
    }
  });

  router.put("/:id", ...writeGuard, async (req, res) => {
    try {
      const payload = { ...req.body };
      delete payload._id;
      if (validate) {
        const err = await validate(payload, "update");
        if (err) return res.status(400).json({ msg: err });
      }
      const doc = await Model.findOneAndUpdate(filterById(req.params.id), payload, {
        new: true,
        runValidators: true,
      });
      if (!doc) return res.status(404).json({ msg: "Not found" });
      if (afterWrite) await afterWrite("update", doc, req);
      res.json(withId(doc));
    } catch (e) {
      sendError(res, e, 400);
    }
  });

  router.delete("/:id", ...writeGuard, async (req, res) => {
    try {
      const doc = await Model.findOneAndDelete(filterById(req.params.id));
      if (!doc) return res.status(404).json({ msg: "Not found" });
      if (afterWrite) await afterWrite("delete", doc, req);
      res.json({ msg: "deleted" });
    } catch (e) {
      sendError(res, e, 400);
    }
  });

  return router;
}

module.exports = resourceRouter;
module.exports.filterById = filterById;
module.exports.withId = withId;
module.exports.withIds = withIds;
