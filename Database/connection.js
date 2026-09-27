const mysql = require("mysql2/promise");
const { setPool, isDbReady, closeDB } = require("./db");
const { ensureSchema } = require("./schema");

function dbConfig() {
  const database = process.env.DB_NAME || "sindhuli_football";
  if (!/^[A-Za-z0-9_]+$/.test(database)) {
    throw new Error("DB_NAME may only contain letters, numbers, and underscores.");
  }
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD ?? "",
    database,
    port: Number(process.env.DB_PORT || 3306),
  };
}

async function connectDB() {
  const config = dbConfig();
  const bootstrap = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
  });
  try {
    await bootstrap.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await bootstrap.end();
  }

  const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.port,
    waitForConnections: true,
    connectionLimit: 10,
    charset: "utf8mb4",
    dateStrings: true,
  });
  await ensureSchema(pool);
  setPool(pool);
  console.log("MySQL Connected");
  return true;
}

module.exports = connectDB;
module.exports.isDbReady = isDbReady;
module.exports.closeDB = closeDB;
module.exports.dbConfig = dbConfig;
