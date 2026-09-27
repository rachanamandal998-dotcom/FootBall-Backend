const express = require("express");
const Report = require("../Database/models/Report");
const { protect } = require("../Authentication/authMiddleware");
const { requireRoles, PERMS } = require("../Authentication/roles");
const { filterById, withId, uid, EMAIL_RE } = require("../Database/ids");
const { logActivity } = require("../Database/engines/footballEngine");

const router = express.Router();

const CATEGORIES = [
  "General Contact",
  "Match Report",
  "Player Report",
  "Team Report",
  "Website Issue",
  "Correction Request",
  "Community Feedback",
  "Other",
];
const STATUSES = ["New", "In Review", "Resolved", "Archived"];

router.post("/", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const subject = String(req.body.subject || "").trim();
    const message = String(req.body.message || "").trim();
    const category = req.body.category || "General Contact";
    const phone = String(req.body.phone || "").trim();

    if (name.length < 2 || name.length > 255) return res.status(400).json({ msg: "Please enter your name." });
    if (!EMAIL_RE.test(email) || email.length > 255) return res.status(400).json({ msg: "Please enter a valid email address." });
    if (phone.length > 50) return res.status(400).json({ msg: "Phone number is too long." });
    if (!CATEGORIES.includes(category)) return res.status(400).json({ msg: "Please choose a valid category." });
    if (!subject || subject.length > 255) return res.status(400).json({ msg: "Please enter a subject." });
    if (!message || message.length > 5000) return res.status(400).json({ msg: "Message cannot be empty." });

    const doc = await Report.create({
      id: uid("r"),
      name,
      email,
      phone,
      subject,
      message,
      category,
      status: "New",
    });
    await logActivity("Report received", "report");
    res.status(201).json({
      msg: "Thank you. Your message has been received.",
      id: withId(doc).id,
    });
  } catch (e) {
    if (!e.expose) console.error(e);
    res.status(400).json({ msg: e.expose ? e.message : "Could not send your message." });
  }
});

router.use(protect, requireRoles(PERMS.reports));

router.get("/", async (req, res) => {
  try {
    const q = {};
    if (req.query.status) q.status = req.query.status;
    if (req.query.category) q.category = req.query.category;
    if (req.query.search) {
      const s = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      q.$or = [
        { name: new RegExp(s, "i") },
        { email: new RegExp(s, "i") },
        { subject: new RegExp(s, "i") },
        { message: new RegExp(s, "i") },
      ];
    }
    const docs = await Report.find(q).sort({ createdAt: -1 });
    res.json(docs.map(withId));
  } catch (e) {
    if (!e.expose) console.error(e);
    res.status(500).json({ msg: e.expose ? e.message : "Could not load reports." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const doc = await Report.findOne(filterById(req.params.id));
    if (!doc) return res.status(404).json({ msg: "Not found" });
    res.json(withId(doc));
  } catch (e) {
    if (!e.expose) console.error(e);
    res.status(500).json({ msg: e.expose ? e.message : "Could not load this report." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const payload = { ...req.body };
    delete payload._id;
    delete payload.id;
    if (payload.status && !STATUSES.includes(payload.status)) {
      return res.status(400).json({ msg: "Please choose a valid report status." });
    }
    if (payload.managerNotes && String(payload.managerNotes).length > 5000) {
      return res.status(400).json({ msg: "Manager notes are too long." });
    }
    if (payload.status && payload.status !== "New") payload.reviewedAt = payload.reviewedAt || new Date();
    const doc = await Report.findOneAndUpdate(filterById(req.params.id), payload, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ msg: "Not found" });
    await logActivity(`Report marked as ${doc.status}`, "report");
    res.json(withId(doc));
  } catch (e) {
    if (!e.expose) console.error(e);
    res.status(400).json({ msg: e.expose ? e.message : "Could not update this report." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const doc = await Report.findOneAndDelete(filterById(req.params.id));
    if (!doc) return res.status(404).json({ msg: "Not found" });
    res.json({ msg: "deleted" });
  } catch (e) {
    if (!e.expose) console.error(e);
    res.status(400).json({ msg: e.expose ? e.message : "Could not delete this report." });
  }
});

module.exports = router;
