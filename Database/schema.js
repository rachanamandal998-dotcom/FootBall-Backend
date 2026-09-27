const fs = require("fs");
const path = require("path");

async function ensureSchema(pool) {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const statements = sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.replace(/--.*$/gm, "").trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }
}

module.exports = { ensureSchema };
