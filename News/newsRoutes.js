const News = require("../Database/models/News");
const resourceRouter = require("../Database/crudRouter");
const { logActivity } = require("../Database/engines/footballEngine");
const { PERMS } = require("../Authentication/roles");
const router = resourceRouter(News, {
  writeRoles: PERMS.news,
  assignIdPrefix: "n",
  publicListQuery: (req) => (req.user ? {} : { status: "Published" }),
  validate: (payload) => {
    if (!payload.title) return "Title is required.";
    if (!payload.content) return "Content is required.";
    if (!payload.date) payload.date = new Date().toISOString().slice(0, 10);
    if (payload.content && !payload.excerpt) {
      payload.excerpt = String(payload.content).replace(/\s+/g, " ").slice(0, 160);
    }
    return null;
  },
  afterWrite: async (action, doc) => {
    if (doc.status === "Published") await logActivity(`News published: ${doc.title}`, "news");
    else await logActivity(`News ${action}: ${doc.title}`, "news");
  },
});

module.exports = router;
