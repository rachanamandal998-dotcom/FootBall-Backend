const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { ensureAdmin } = require("./seed");

async function seedAdmin() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  await mongoose.connect(process.env.MONGO_URI);
  const admin = await ensureAdmin();
  console.log(`Manager ready: ${admin.email}`);
  await mongoose.disconnect();
}

seedAdmin().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
