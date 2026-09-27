const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("./connection");
const { closeDB } = require("./db");
const { ensureAdmin } = require("./seed");

async function seedAdmin() {
  if (!process.env.DB_NAME) throw new Error("DB_NAME is required");
  await connectDB();
  const admin = await ensureAdmin();
  console.log(`Manager ready: ${admin.email}`);
  await closeDB();
}

seedAdmin().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
