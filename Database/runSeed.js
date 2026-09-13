const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { seedIfEmpty, seedFootball, ensureAdmin } = require("./seed");

async function run() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  await mongoose.connect(process.env.MONGO_URI);
  await ensureAdmin();
  const force = process.argv.includes("--force");
  const result = await seedFootball(force);
  console.log(result.seeded ? "Demo football data loaded." : "Football data already present (use --force to replace).");
  console.log(`Manager login: ${process.env.ADMIN_EMAIL || "admin@sindhulifc.local"}`);
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
