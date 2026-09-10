const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("./models/User");

async function seedAdmin() {
  const email = String(process.env.ADMIN_EMAIL || "admin@sindhulifc.local").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS || "admin123";
  const name = process.env.ADMIN_NAME || "Club Admin";

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }
  if (!password || password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    existing.name = existing.name || name;
    existing.password = await bcrypt.hash(password, 10);
    await existing.save();
    console.log(`Updated existing admin: ${email}`);
  } else {
    await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: "admin",
      displayName: name,
      username: email,
    });
    console.log(`Created admin: ${email}`);
  }
  await mongoose.disconnect();
}

seedAdmin().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
