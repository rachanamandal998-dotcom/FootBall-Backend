let pool = null;
let ready = false;

function setPool(next) {
  pool = next;
  ready = Boolean(next);
}

function getPool() {
  if (!pool) {
    const error = new Error("Database is not connected.");
    error.expose = true;
    error.status = 503;
    throw error;
  }
  return pool;
}

function isDbReady() {
  return ready;
}

async function closeDB() {
  if (pool) await pool.end();
  pool = null;
  ready = false;
}

module.exports = { setPool, getPool, isDbReady, closeDB };
