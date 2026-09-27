const { getPool } = require("./db");
const { uid } = require("./ids");

function mapError(err) {
  if (!err) return err;
  if (err.expose) return err;
  if (err.code === "ER_DUP_ENTRY" || err.errno === 1062) {
    const error = new Error("A record with this value already exists.");
    error.expose = true;
    error.code = 11000;
    error.status = 409;
    return error;
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2" || err.errno === 1452) {
    const error = new Error("A related team, player, competition, or stadium was not found.");
    error.expose = true;
    error.status = 400;
    return error;
  }
  if (err.code === "ER_ROW_IS_REFERENCED_2" || err.errno === 1451) {
    const error = new Error("This record is still linked to other data and cannot be deleted.");
    error.expose = true;
    error.status = 400;
    return error;
  }
  if (err.code === "ER_DATA_TOO_LONG" || err.errno === 1406) {
    const error = new Error("One of the fields is too long.");
    error.expose = true;
    error.status = 400;
    return error;
  }
  console.error(err);
  const error = new Error("Could not complete that request.");
  error.expose = true;
  error.status = 500;
  return error;
}

async function query(conn, sql, params = []) {
  try {
    return await conn.query(sql, params);
  } catch (err) {
    throw mapError(err);
  }
}

async function withTransaction(work) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    try {
      await conn.rollback();
    } catch {
      // ignore rollback failures
    }
    throw err.expose ? err : mapError(err);
  } finally {
    conn.release();
  }
}

function toIso(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) return value.toISOString();
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(text)) {
    const normalized = text.replace(" ", "T");
    const date = new Date(normalized);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return text;
}

function same(left, right) {
  if (left == null && right == null) return true;
  return String(left) === String(right);
}

function matches(doc, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;
  return Object.entries(filter).every(([key, expected]) => {
    if (key === "$or") return Array.isArray(expected) && expected.some((clause) => matches(doc, clause));
    if (key === "$and") return Array.isArray(expected) && expected.every((clause) => matches(doc, clause));
    const value = doc[key];
    if (expected instanceof RegExp) return expected.test(String(value ?? ""));
    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
      if ("$in" in expected) return expected.$in.some((item) => same(item, value));
      if ("$ne" in expected) return !same(value, expected.$ne);
      if ("$regex" in expected) {
        const flags = expected.$options || "";
        const rx = expected.$regex instanceof RegExp ? expected.$regex : new RegExp(expected.$regex, flags);
        return rx.test(String(value ?? ""));
      }
    }
    return same(value, expected);
  });
}

function createQuery(loader, { one = false } = {}) {
  const queryObject = {
    _sort: null,
    _limit: null,
    _select: null,
    sort(value) {
      this._sort = value;
      return this;
    },
    limit(value) {
      this._limit = value;
      return this;
    },
    select(value) {
      this._select = value;
      return this;
    },
    async exec() {
      let rows = await loader(this);
      if (!Array.isArray(rows)) rows = rows ? [rows] : [];
      if (this._sort && Object.prototype.hasOwnProperty.call(this._sort, "createdAt")) {
        const dir = Number(this._sort.createdAt) < 0 ? -1 : 1;
        rows.sort((a, b) => {
          const av = new Date(a?.createdAt || 0).getTime();
          const bv = new Date(b?.createdAt || 0).getTime();
          return dir < 0 ? bv - av : av - bv;
        });
      }
      if (this._limit != null) rows = rows.slice(0, Number(this._limit));
      return one ? rows[0] || null : rows;
    },
    then(resolve, reject) {
      return this.exec().then(resolve, reject);
    },
  };
  return queryObject;
}

function applyDefaults(doc, defaults) {
  const next = { ...doc };
  for (const [key, value] of Object.entries(defaults)) {
    if (next[key] === undefined || next[key] === null) {
      next[key] = typeof value === "function" ? value() : value;
    }
  }
  return next;
}

function toParam(value, column) {
  if (column.type === "json") {
    const payload = value === undefined || value === null ? (column.fallback ?? []) : value;
    return JSON.stringify(payload);
  }
  if (column.type === "number") {
    if (value === undefined || value === null || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }
  if (column.type === "date") {
    if (value === undefined || value === null || value === "") return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }
  if (value === undefined || value === null) return null;
  if ((column.fk || column.emptyNull) && value === "") return null;
  return value;
}

function parseJson(value, fallback) {
  if (value == null || value === "") return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
}

function defineModel(spec) {
  const table = spec.table;
  if (!/^[a-z_]+$/.test(table)) throw new Error("Invalid table name");
  const columns = spec.columns;
  const children = spec.children || {};
  const defaults = spec.defaults || {};

  function docFromRow(row, childMaps) {
    const doc = {
      id: row.id,
      _id: row.id,
      createdAt: toIso(row.created_at),
      updatedAt: toIso(row.updated_at),
    };
    for (const column of columns) {
      let value = row[column.column];
      if (column.type === "json") value = parseJson(value, defaults[column.field] ?? column.fallback ?? null);
      else if (column.type === "number" && value != null && value !== "") value = Number(value);
      else if (column.type === "date") value = toIso(value);
      if ((value === null || value === undefined) && Object.prototype.hasOwnProperty.call(defaults, column.field)) {
        value = defaults[column.field];
      }
      doc[column.field] = value;
    }
    for (const [field, child] of Object.entries(children)) {
      const loaded = childMaps[field]?.get(String(row.id));
      doc[field] = loaded !== undefined ? loaded : defaults[field] ?? [];
    }
    return doc;
  }

  async function loadAll(conn) {
    const db = conn || getPool();
    const [rows] = await query(db, `SELECT * FROM \`${table}\``);
    const childMaps = {};
    for (const [field, child] of Object.entries(children)) {
      childMaps[field] = await child.loadMap(db);
    }
    return rows.map((row) => docFromRow(row, childMaps));
  }

  async function saveChildren(conn, id, doc) {
    for (const [field, child] of Object.entries(children)) {
      if (doc[field] !== undefined) await child.replace(conn, id, doc[field]);
    }
  }

  return {
    find(filter = {}) {
      return createQuery(async () => {
        const docs = await loadAll();
        return docs.filter((doc) => matches(doc, filter));
      });
    },
    findOne(filter = {}) {
      return createQuery(async () => {
        const docs = await loadAll();
        return docs.filter((doc) => matches(doc, filter));
      }, { one: true });
    },
    findById(id) {
      return this.findOne({ $or: [{ id }, { _id: id }] });
    },
    async create(input) {
      return withTransaction(async (conn) => {
        const doc = applyDefaults({ ...input }, defaults);
        let id = spec.autoId
          ? null
          : String(doc.id || (spec.idFrom && doc[spec.idFrom]) || uid(spec.idPrefix || ""));
        const now = new Date();
        const fields = [];
        const marks = [];
        const params = [];
        if (!spec.autoId) {
          fields.push("`id`");
          marks.push("?");
          params.push(id);
        }
        for (const column of columns) {
          fields.push(`\`${column.column}\``);
          marks.push("?");
          params.push(toParam(doc[column.field], column));
        }
        fields.push("`created_at`", "`updated_at`");
        marks.push("?", "?");
        params.push(now, now);
        const [result] = await query(
          conn,
          `INSERT INTO \`${table}\` (${fields.join(", ")}) VALUES (${marks.join(", ")})`,
          params,
        );
        if (spec.autoId) id = result.insertId;
        await saveChildren(conn, id, doc);
        const saved = await loadAll(conn);
        return saved.find((item) => String(item.id) === String(id)) || null;
      });
    },
    async insertMany(docs) {
      const created = [];
      for (const doc of docs || []) created.push(await this.create(doc));
      return created;
    },
    async findOneAndUpdate(filter, update, options = {}) {
      const existing = await this.findOne(filter);
      if (!existing) {
        if (!options.upsert) return null;
        const seed = {};
        for (const [key, value] of Object.entries(filter || {})) {
          if (!key.startsWith("$")) seed[key] = value;
        }
        return this.create({ ...seed, ...update });
      }
      const next = { ...existing, ...update, id: existing.id };
      delete next._id;
      return this._save(next);
    },
    async _save(doc) {
      return withTransaction(async (conn) => {
        const sets = [];
        const params = [];
        for (const column of columns) {
          sets.push(`\`${column.column}\` = ?`);
          params.push(toParam(doc[column.field], column));
        }
        sets.push("`updated_at` = ?");
        params.push(new Date());
        params.push(doc.id);
        await query(conn, `UPDATE \`${table}\` SET ${sets.join(", ")} WHERE id = ?`, params);
        await saveChildren(conn, doc.id, doc);
        const saved = await loadAll(conn);
        return saved.find((item) => String(item.id) === String(doc.id)) || null;
      });
    },
    async findOneAndDelete(filter) {
      const existing = await this.findOne(filter);
      if (!existing) return null;
      await query(getPool(), `DELETE FROM \`${table}\` WHERE id = ?`, [existing.id]);
      return existing;
    },
    async deleteMany(filter = {}) {
      if (!filter || Object.keys(filter).length === 0) {
        await query(getPool(), `DELETE FROM \`${table}\``);
        return { deletedCount: 0 };
      }
      const docs = await this.find(filter);
      for (const doc of docs) {
        await query(getPool(), `DELETE FROM \`${table}\` WHERE id = ?`, [doc.id]);
      }
      return { deletedCount: docs.length };
    },
    async countDocuments(filter = {}) {
      const docs = await this.find(filter);
      return docs.length;
    },
  };
}

async function rowExists(table, id) {
  if (!id || !/^[a-z_]+$/.test(table)) return false;
  const [rows] = await query(getPool(), `SELECT id FROM \`${table}\` WHERE id = ? LIMIT 1`, [id]);
  return rows.length > 0;
}

module.exports = {
  mapError,
  query,
  withTransaction,
  toIso,
  matches,
  createQuery,
  defineModel,
  rowExists,
  parseJson,
  toParam,
};
