const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("./connection");
const { closeDB } = require("./db");
const { seedFootball, ensureAdmin } = require("./seed");

async function run() {
  if (!process.env.DB_NAME) throw new Error("DB_NAME is required");
  await connectDB();
  await ensureAdmin();
  const force = process.argv.includes("--force");
  const result = await seedFootball(force);
  console.log(result.seeded ? "Demo football data loaded." : "Football data already present (use --force to replace).");
  console.log(`Manager login: ${process.env.ADMIN_EMAIL || "admin@sindhulifc.local"}`);
  await closeDB();
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
