const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./Database/connection");
const { optionalProtect } = require("./Authentication/authMiddleware");
const { seedIfEmpty } = require("./Database/seed");

dotenv.config();
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Set it in Backend/.env");
  process.exit(1);
}

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(optionalProtect);

connectDB().then(async () => {
  try {
    const result = await seedIfEmpty();
    if (result?.seeded) console.log("Demo football data seeded.");
  } catch (err) {
    console.error("Seed skipped:", err.message);
  }
});

app.use("/api/auth", require("./Authentication/authRoutes"));
app.use("/api/users", require("./Authentication/userRoutes"));
app.use("/api/teams", require("./Teams/teamRoutes"));
app.use("/api/players", require("./Players/playerRoutes"));
app.use("/api/matches", require("./Matches/matchRoutes"));
app.use("/api/competitions", require("./Competitions/competitionRoutes"));
app.use("/api/news", require("./News/newsRoutes"));
app.use("/api/injuries", require("./Injuries/injuryRoutes"));
app.use("/api/training", require("./Training/trainingRoutes"));
app.use("/api/reports", require("./Reports/reportRoutes"));
app.use("/api/staff", require("./Staff/staffRoutes"));
app.use("/api/transfers", require("./Transfers/transferRoutes"));
app.use("/api/contracts", require("./Contracts/contractRoutes"));
app.use("/api/stadiums", require("./Stadiums/stadiumRoutes"));
app.use("/api/stats", require("./Statistics/statsRoutes"));
app.use("/api/search", require("./Search/searchRoutes"));
app.use("/api/uploads", require("./Uploads/uploadRoutes"));
app.use("/api/dashboard", require("./Dashboard/dashboardRoutes"));
app.use("/api/settings", require("./Settings/settingsRoutes"));

app.get("/", (_req, res) => res.send("Sindhuli Football Clubhouse API running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
